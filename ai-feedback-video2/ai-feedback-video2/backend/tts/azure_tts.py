"""
backend.tts.azure_tts
---------------------
Wrapper around the existing azure_synthesize_audio helpers to:
 - Keep canonical voice + prosody settings
 - Provide synthesize_with_timings() returning duration + per-word timings
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Dict, List

from dotenv import load_dotenv
import azure.cognitiveservices.speech as speechsdk

load_dotenv()

PROJECT_ROOT = Path(__file__).resolve().parents[2]

# Ensure we can import the original Azure helpers
VIDEO_APP_DIR = PROJECT_ROOT / "video-app"
if str(VIDEO_APP_DIR) not in sys.path:
    sys.path.append(str(VIDEO_APP_DIR))

# from azure_synthesize_audio import (  # type: ignore
#     build_azure_ssml,
#     identify_content_words,
#     add_intelligent_emphasis,
#     add_breathing_pauses,
#     create_prosody_contour,
# )

load_dotenv(PROJECT_ROOT / ".env", override=True)

VOICE_NAME = "en-IN-ArjunNeural"
DEFAULT_STYLE = {
    "style": "friendly",
    "rate": "+0%",
    "pitch": "+0%",
    "role_type": "mentor",
}


def _speech_config() -> speechsdk.SpeechConfig:
    key = os.environ.get("AZURE_SPEECH_KEY")
    region = os.environ.get("AZURE_SPEECH_REGION", "eastus")
    if not key:
        raise ValueError("AZURE_SPEECH_KEY missing in environment/.env")

    config = speechsdk.SpeechConfig(subscription=key, region=region)
    config.speech_synthesis_voice_name = VOICE_NAME
    config.set_speech_synthesis_output_format(
        speechsdk.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3
    )
    return config


def _prepare_ssml(text: str, voice_style: Dict[str, str]) -> str:
    """
    Prepare SIMPLIFIED SSML for better word boundary capture.
    Complex prosody tags interfere with word timing events.
    """
    # Use simple SSML structure for reliable word boundaries
    style = voice_style.get("style", DEFAULT_STYLE["style"])
    rate = voice_style.get("rate", DEFAULT_STYLE["rate"])
    pitch = voice_style.get("pitch", DEFAULT_STYLE["pitch"])
    role_type = voice_style.get("role_type", DEFAULT_STYLE["role_type"])
    
    # Build simple SSML without complex prosody manipulation
    ssml = f"""<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' 
                xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='en-IN'>
        <voice name='{VOICE_NAME}'>
            <mstts:express-as style='{style}' role='{role_type}'>
                <prosody rate='{rate}' pitch='{pitch}'>
                    {text}
                </prosody>
            </mstts:express-as>
        </voice>
    </speak>"""
    
    return ssml


def synthesize_with_timings(text: str, output_path: Path, voice_style: Dict[str, str] | None = None) -> Dict:
    """
    Synthesize narration text and capture per-word timings.

    Returns:
        {
            "audio_file": "<absolute path>",
            "duration_sec": float,
            "words": [{"text": str, "start_sec": float, "end_sec": float, "duration_sec": float}, ...]
        }
    """
    if voice_style is None:
        voice_style = DEFAULT_STYLE

    ssml = _prepare_ssml(text, voice_style)
    speech_config = _speech_config()
    
    # CRITICAL: Use audio_config=None to capture word boundaries
    # Word boundary events don't fire when audio is saved to file!
    synthesizer = speechsdk.SpeechSynthesizer(speech_config, audio_config=None)

    word_boundaries: List[Dict[str, float]] = []

    def _collect(evt: speechsdk.SpeechSynthesisWordBoundaryEventArgs):
        try:
            start = evt.audio_offset / 10_000_000  # convert 100ns to seconds
            # duration is a timedelta, convert to seconds
            duration_sec = evt.duration.total_seconds() if hasattr(evt.duration, 'total_seconds') else evt.duration / 10_000_000
            end = start + duration_sec
            word_boundaries.append({
                "text": evt.text,
                "start_sec": start,
                "end_sec": end,
                "duration_sec": duration_sec
            })
        except Exception as e:
            print(f"❌ ERROR in callback: {e}")  # DEBUG

    # Connect BEFORE synthesis
    synthesizer.synthesis_word_boundary.connect(_collect)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Use plain TEXT instead of SSML - word boundaries work better
    result = synthesizer.speak_text_async(text).get()
    
    # CRITICAL: Wait a moment for word boundary events to finish processing
    # Events fire asynchronously even after .get() returns!
    import time
    time.sleep(0.5)
    
    # Save audio data to file manually
    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        with open(output_path, 'wb') as audio_file:
            audio_file.write(result.audio_data)

    if result.reason != speechsdk.ResultReason.SynthesizingAudioCompleted:
        details = ""
        if result.reason == speechsdk.ResultReason.Canceled:
            details = f" ({result.cancellation_details.reason}: {result.cancellation_details.error_details})"
        raise RuntimeError(f"Azure TTS failed{details}")

    duration_sec = result.audio_duration.total_seconds()
    print(f"  → {len(word_boundaries)} words captured")
    
    return {
        "audio_file": str(output_path),
        "duration_sec": duration_sec,
        "words": word_boundaries,
    }

