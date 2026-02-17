#!/usr/bin/env python
"""
generate_tts_and_timings.py
---------------------------
Reads backend/output/narration_manifest.json and synthesizes:
 - Audio files via Azure TTS
 - Word-level timing JSON alongside each audio file
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Dict

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

BACKEND_DIR = PROJECT_ROOT / "backend"
OUTPUT_DIR = BACKEND_DIR / "output"
MANIFEST_PATH = OUTPUT_DIR / "narration_manifest.json"
AUDIO_DIR = OUTPUT_DIR / "audio"
TIMINGS_DIR = OUTPUT_DIR / "timings"

load_dotenv(PROJECT_ROOT / ".env", override=True)

from backend.tts.azure_tts import synthesize_with_timings  # noqa: E402


def synthesize_manifest(manifest: list[Dict]) -> None:
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    TIMINGS_DIR.mkdir(parents=True, exist_ok=True)

    for idx, event in enumerate(manifest, start=1):
        narration = event.get("narration")
        if not narration or not narration.get("text"):
            continue

        text = narration["text"]
        voice_style = narration.get("voice_style", {})
        audio_rel = narration["audio_file"]  # e.g. "audio/q1_summary.mp3"
        audio_path = OUTPUT_DIR / audio_rel

        print(f"[{idx}/{len(manifest)}] Synthesizing {audio_rel}")
        timing = synthesize_with_timings(text, audio_path, voice_style)
        timing["audio_file"] = audio_rel.replace("\\", "/")

        timing_filename = Path(audio_rel).with_suffix(".json").name
        timing_path = TIMINGS_DIR / timing_filename
        timing_path.write_text(json.dumps(timing, indent=2), encoding="utf-8")
        print(f"  → saved audio to {audio_path}")
        print(f"  → saved timings to {timing_path}")


def main() -> None:
    if not MANIFEST_PATH.exists():
        raise FileNotFoundError(f"Manifest not found at {MANIFEST_PATH}")

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    synthesize_manifest(manifest)
    try:
        # Regenerate choreography off the fresh timings so highlights/entrances stay frame-accurate
        from backend.scripts.calculate_choreography import main as calc_choreo

        print("🎭 Recalculating choreography from updated timings...")
        calc_choreo()
    except Exception as exc:  # pragma: no cover - defensive catch to avoid failing the main TTS run
        print(f"⚠️  Skipping choreography regeneration: {exc}")

    print("✅ Audio + timing generation complete.")


if __name__ == "__main__":
    main()
