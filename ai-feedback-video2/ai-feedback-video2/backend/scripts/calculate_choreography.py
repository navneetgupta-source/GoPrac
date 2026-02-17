#!/usr/bin/env python
"""
calculate_choreography.py - FIXED VERSION v2
--------------------------
Fixes for thinking steps timing:
1. Each row in "How You Thought" and "Thinking Advice" appears individually
2. Rows start appearing AFTER their column is introduced
3. No more "all at once" behavior
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Dict, List, Any, Tuple, Optional

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_OUTPUT = PROJECT_ROOT / "backend" / "output"
TIMINGS_DIR = BACKEND_OUTPUT / "timings"
CHOREOGRAPHY_DIR = BACKEND_OUTPUT / "choreography"
MANIFEST_PATH = BACKEND_OUTPUT / "narration_manifest.json"
SESSION_PATH = PROJECT_ROOT / "backend" / "data" / "session_questions.json"

FPS = 30
HIGHLIGHT_COLOR = "#E6A100"

SESSION_DATA: Dict[str, Any] = {}


def load_session_data() -> None:
    global SESSION_DATA
    if SESSION_PATH.exists():
        SESSION_DATA = json.loads(SESSION_PATH.read_text(encoding="utf-8"))
    else:
        SESSION_DATA = {}


def get_question_data(question_id: str) -> Dict[str, Any]:
    questions = SESSION_DATA.get("questions", [])
    if not questions:
        return {}
    if question_id:
        for question in questions:
            if question.get("question_id") == question_id:
                return question
    return questions[0]


def seconds_to_frames(seconds: float) -> int:
    return round(seconds * FPS)


def convert_word_timings_to_frames(words: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [
        {
            "word": w["text"],
            "startFrame": seconds_to_frames(w["start_sec"]),
            "endFrame": seconds_to_frames(w["end_sec"]),
            "durationFrames": seconds_to_frames(w["duration_sec"])
        }
        for w in words
    ]


def normalize_token(token: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", token.lower())


def tokenize_phrase(phrase: str) -> List[str]:
    if not phrase:
        return []
    return [normalize_token(tok) for tok in phrase.split() if normalize_token(tok)]


def find_phrase_in_words(
    word_timings: List[Dict[str, Any]],
    search_phrase: str,
    start_frame: int = 0
) -> Optional[int]:
    """Find when a specific phrase is spoken and return its start frame."""
    phrase_tokens = tokenize_phrase(search_phrase)
    if not phrase_tokens:
        return None
    
    tokens = []
    for entry in word_timings:
        if entry["startFrame"] >= start_frame:
            token = normalize_token(entry.get("word", ""))
            if token:
                tokens.append((token, entry["startFrame"]))
    
    for i in range(len(tokens) - len(phrase_tokens) + 1):
        match = True
        for j, phrase_token in enumerate(phrase_tokens):
            if tokens[i + j][0] != phrase_token:
                match = False
                break
        if match:
            return tokens[i][1]
    
    return None


def _find_phrase_window(
    tokens: List[str],
    phrase_tokens: List[str],
    start_token_idx: int = 0,
    max_gap: int = 4,
) -> Optional[Tuple[int, int]]:
    if not phrase_tokens:
        return None
    n = len(tokens)
    m = len(phrase_tokens)
    i = start_token_idx
    while i < n:
        if tokens[i] != phrase_tokens[0]:
            i += 1
            continue
        j = 0
        k = i
        last_match = i
        start_match = None
        while k < n and j < m:
            if tokens[k] == phrase_tokens[j]:
                if start_match is None:
                    start_match = k
                last_match = k
                j += 1
            elif start_match is not None and (k - last_match) > max_gap:
                break
            k += 1
        if j == m and start_match is not None:
            return start_match, last_match
        i += 1
    return None


def find_phrase_windows(
    tokens: List[str],
    phrase_tokens: List[str],
    start_token_idx: int = 0,
    max_gap: int = 4,
    max_matches: int = 3,
) -> List[Tuple[int, int]]:
    matches: List[Tuple[int, int]] = []
    search_idx = start_token_idx
    while len(matches) < max_matches and search_idx < len(tokens):
        window = _find_phrase_window(tokens, phrase_tokens, search_idx, max_gap)
        if not window:
            break
        matches.append(window)
        search_idx = window[1] + 1
    return matches


def build_block_highlights(
    word_timings: List[Dict[str, Any]],
    block_specs: List[Dict[str, Any]],
    total_frames: int,
) -> List[Dict[str, Any]]:
    if not block_specs:
        return []

    tokens: List[str] = []
    token_to_word_idx: List[int] = []
    for idx, entry in enumerate(word_timings):
        token = normalize_token(entry.get("word", ""))
        if not token:
            continue
        tokens.append(token)
        token_to_word_idx.append(idx)

    highlights: List[Dict[str, Any]] = []
    fallback_chunk = max(total_frames // max(len(block_specs), 1), 1)

    import inspect
    caller = inspect.stack()[1].function if len(inspect.stack()) > 1 else ""
    is_thinking_steps = caller == "create_thinking_steps_choreography"
    
    for block_index, spec in enumerate(block_specs):
        phrases = [p for p in spec.get("phrases", []) if p]
        segments: List[Dict[str, Any]] = []
        search_idx = 0
        
        for phrase in phrases:
            phrase_tokens = tokenize_phrase(phrase)
            if not phrase_tokens or not tokens:
                continue
            if is_thinking_steps:
                windows = find_phrase_windows(
                    tokens,
                    phrase_tokens,
                    start_token_idx=0,
                )
            else:
                windows = find_phrase_windows(
                    tokens,
                    phrase_tokens,
                    start_token_idx=search_idx,
                )
            if windows:
                token_start, token_end = windows[0]
                start_word_idx = token_to_word_idx[token_start]
                end_word_idx = token_to_word_idx[token_end]
                # Appear earlier: show 8 frames before narration starts (was 2)
                start_frame = max(word_timings[start_word_idx]["startFrame"] - 8, 0)
                end_frame = word_timings[end_word_idx]["endFrame"] + 2
                segments.append(
                    {
                        "text": phrase,
                        "startFrame": start_frame,
                        "endFrame": end_frame,
                    }
                )
                if not is_thinking_steps:
                    search_idx = token_end + 1

        if not segments:
            print(f"[WARN] No match for one or more phrases in block '{spec['block_id']}'")
            # Fallback: stagger each row by 10 frames after the column intro
            fallback_start = block_index * fallback_chunk
            fallback_end = min(fallback_start + fallback_chunk, total_frames)
            phrase_count = max(len(phrases), 1)
            phrase_span = max((fallback_end - fallback_start) // phrase_count, 1)
            for idx in range(phrase_count):
                seg_start = fallback_start + idx * phrase_span + idx * 10  # Stagger by 10 frames
                seg_end = (
                    fallback_end
                    if idx == phrase_count - 1
                    else min(seg_start + phrase_span, fallback_end)
                )
                segments.append(
                    {
                        "text": phrases[idx] if idx < len(phrases) else None,
                        "startFrame": seg_start,
                        "endFrame": seg_end,
                    }
                )

        block_start = min(seg["startFrame"] for seg in segments)
        block_end = max(seg["endFrame"] for seg in segments)

        highlights.append(
            {
                "blockId": spec["block_id"],
                "startFrame": block_start,
                "endFrame": block_end,
                "color": spec.get("color", HIGHLIGHT_COLOR),
                "segments": segments,
            }
        )

    return highlights


def animation_from_highlight(
    block_id: str,
    highlight: Dict[str, Any],
    animation_type: str,
    duration: int = 30,
    lead: int = 12,
) -> Dict[str, Any]:
    start_frame = max(highlight["startFrame"] - lead, 0)
    return {
        "blockId": block_id,
        "type": animation_type,
        "startFrame": start_frame,
        "durationFrames": duration,
        "easing": "easeOut",
    }


def get_case_overview_specs(question: Dict[str, Any]) -> List[Dict[str, Any]]:
    summary = question.get("problem_summary", {})
    return [
        {
            "block_id": "problem_scenario",
            "phrases": [summary.get("scenario_narration") or summary.get("scenario", "")],
        },
        {
            "block_id": "data_simplified",
            "phrases": [summary.get("data_narration", "")] if summary.get("data_narration") else summary.get("data", []),
        },
        {
            "block_id": "business_rules",
            "phrases": [summary.get("business_rules_narration", "")] if summary.get("business_rules_narration") else summary.get("business_rules", []),
        },
        {
            "block_id": "performance_constraints",
            "phrases": [summary.get("performance_constraints_narration", "")] if summary.get("performance_constraints_narration") else summary.get("performance_constraints", []),
        },
    ]


def get_question_summary_specs(question: Dict[str, Any]) -> List[Dict[str, Any]]:
    return [
        {
            "block_id": "question_block",
            "phrases": [question.get("question_prompt", "")],
        },
        {
            "block_id": "feedback_block",
            "phrases": [question.get("feedback_summary", "")],
        },
        {
            "block_id": "score_badge",
            "phrases": [f"You scored {question.get('score')} out of 10"],
        },
    ]


def get_feedback_specs(question: Dict[str, Any]) -> List[Dict[str, Any]]:
    # Use the actual bullet text for anchors instead of ordinals to stay in sync
    right_points = question.get("what_went_right", []) or []
    wrong_points = question.get("what_went_wrong", []) or []
    return [
        {
            "block_id": "right_box",
            "phrases": right_points,
        },
        {
            "block_id": "wrong_box",
            "phrases": wrong_points,
        },
    ]


def get_thinking_specs(question: Dict[str, Any]) -> List[Dict[str, Any]]:
    steps_data = question.get("thinking_steps", [])
    if isinstance(steps_data, dict):
        steps = steps_data.get("steps", [])
        how_you_thought = steps_data.get("how_you_thought", [])
        thinking_advice = steps_data.get("thinking_advice", [])
        max_len = max(len(steps), len(how_you_thought), len(thinking_advice))
        steps = steps + [""] * (max_len - len(steps))
        how_you_thought = how_you_thought + [""] * (max_len - len(how_you_thought))
        thinking_advice = thinking_advice + [""] * (max_len - len(thinking_advice))
        return [
            {
                "block_id": "col_steps",
                "phrases": steps,
            },
            {
                "block_id": "col_thought",
                "phrases": how_you_thought,
            },
            {
                "block_id": "col_advice",
                "phrases": thinking_advice,
            },
        ]
    else:
        steps = steps_data
        return [
            {
                "block_id": "col_steps",
                "phrases": [step.get("step_title", "") for step in steps],
            },
            {
                "block_id": "col_thought",
                "phrases": [step.get("your_approach", "") for step in steps],
            },
            {
                "block_id": "col_advice",
                "phrases": [step.get("ideal", "") for step in steps],
            },
        ]


def create_intro_choreography(timing_data: Dict[str, Any]) -> Dict[str, Any]:
    duration_sec = timing_data.get("duration_sec", 6.0)
    total_frames = seconds_to_frames(duration_sec)
    
    return {
        "slideType": "intro_welcome",
        "totalDurationFrames": total_frames,
        "actualDurationSec": duration_sec,
        "animations": [
            {
                "blockId": "intro_caption",
                "type": "fadeIn",
                "startFrame": 0,
                "durationFrames": 60,
                "easing": "easeOut"
            }
        ],
        "narration": {
            "audioFile": timing_data["audio_file"],
            "startFrame": 0,
            "endFrame": total_frames,
            "durationSec": duration_sec,
            "wordTimings": convert_word_timings_to_frames(timing_data.get("words", []))
        }
    }


def create_case_overview_choreography(timing_data: Dict[str, Any], question: Dict[str, Any]) -> Dict[str, Any]:
    duration_sec = timing_data.get("duration_sec", 15.0)
    total_frames = seconds_to_frames(duration_sec)
    word_timings = convert_word_timings_to_frames(timing_data.get("words", []))
    block_specs = get_case_overview_specs(question)
    highlights = build_block_highlights(word_timings, block_specs, total_frames)
    animation_map = {
        "problem_scenario": "slideInLeft",
        "data_simplified": "slideInRight",
        "business_rules": "slideInLeft",
        "performance_constraints": "slideInRight",
    }
    animations = [
        animation_from_highlight(
            h["blockId"],
            h,
            animation_map.get(h["blockId"], "fadeIn"),
            duration=40,
            lead=18,
        )
        for h in highlights
    ]
    
    return {
        "slideType": "case_overview",
        "totalDurationFrames": total_frames,
        "actualDurationSec": duration_sec,
        "animations": animations,
        "highlights": highlights,
        "narration": {
            "audioFile": timing_data["audio_file"],
            "startFrame": 0,
            "endFrame": total_frames,
            "durationSec": duration_sec,
            "wordTimings": word_timings
        }
    }


def create_question_summary_choreography(timing_data: Dict[str, Any], question_id: str) -> Dict[str, Any]:
    duration_sec = timing_data.get("duration_sec", 8.0)
    total_frames = seconds_to_frames(duration_sec)
    question = get_question_data(question_id)
    word_timings = convert_word_timings_to_frames(timing_data.get("words", []))
    feedback_intro_frame = find_phrase_in_words(word_timings, "feedback summary")
    # The feedback highlight should fade when this sentence finishes.
    feedback_end_phrase = "So you started in the right direction, but did not complete the full tracing"

    # Build token index to locate the end of the feedback summary sentence
    tokens: List[str] = []
    token_to_word_idx: List[int] = []
    for idx, entry in enumerate(word_timings):
        token = normalize_token(entry.get("word", ""))
        if not token:
            continue
        tokens.append(token)
        token_to_word_idx.append(idx)

    phrase_tokens = tokenize_phrase(feedback_end_phrase)
    phrase_start_frame: Optional[int] = None
    if tokens and phrase_tokens:
        window = find_phrase_windows(tokens, phrase_tokens, start_token_idx=0, max_gap=4, max_matches=1)
        if window:
            token_start, _ = window[0]
            start_word_idx = token_to_word_idx[token_start]
            phrase_start_frame = word_timings[start_word_idx]["startFrame"]


    highlights = build_block_highlights(word_timings, get_question_summary_specs(question), total_frames)

    feedback_highlight = next((h for h in highlights if h["blockId"] == "feedback_block"), None)
    score_highlight = next((h for h in highlights if h["blockId"] == "score_badge"), None)
    question_highlight = next((h for h in highlights if h["blockId"] == "question_block"), None)

    # Extend question block highlight until the phrase is finished (robust match)
    question_end_phrase = "You had to find where the price difference is coming from."
    question_phrase_tokens = tokenize_phrase(question_end_phrase)
    question_phrase_start_frame = None
    if tokens and question_phrase_tokens:
        window = find_phrase_windows(tokens, question_phrase_tokens, start_token_idx=0, max_gap=6, max_matches=1)
        if window:
            token_start, token_end = window[0]
            # Use the END of the phrase for highlight end
            end_word_idx = token_to_word_idx[token_end]
            question_phrase_start_frame = word_timings[end_word_idx]["endFrame"]
        else:
            print(f"[WARN] Could not find phrase for question block highlight: '{question_end_phrase}'")
    if question_highlight:
        if question_phrase_start_frame is not None:
            question_highlight["endFrame"] = question_phrase_start_frame
            for seg in question_highlight.get("segments", []):
                seg["endFrame"] = question_phrase_start_frame
        else:
            # Fallback: keep highlight until end of narration
            question_highlight["endFrame"] = total_frames
            for seg in question_highlight.get("segments", []):
                seg["endFrame"] = total_frames

    if feedback_highlight:
        if feedback_intro_frame is not None:
            feedback_highlight["startFrame"] = feedback_intro_frame
            for seg in feedback_highlight.get("segments", []):
                seg["startFrame"] = feedback_intro_frame
        if phrase_start_frame is not None:
            cut_frame = max(phrase_start_frame, feedback_highlight["startFrame"])
            feedback_highlight["endFrame"] = cut_frame
            for seg in feedback_highlight.get("segments", []):
                seg["endFrame"] = cut_frame

    animation_map = {
        "problem_scenario": "fadeIn",
        "data_simplified": "fadeIn",
        "business_rules": "fadeIn",
        "performance_constraints": "fadeIn",
        "question_block": "slideInRight",
        "feedback_block": "slideInRight",
        "score_badge": "scaleIn",
    }
    animations = [
        animation_from_highlight(
            h["blockId"],
            h,
            animation_map.get(h["blockId"], "fadeIn"),
            duration=35 if h["blockId"] != "score_badge" else 30,
            lead=0 if h["blockId"] == "feedback_block" else 15,
        )
        for h in highlights
    ]
    if score_highlight:
        animations.append(
            {
                "blockId": "score_number",
                "type": "counterAnimation",
                "startFrame": max(score_highlight["startFrame"] - 5, 0),
                "durationFrames": 40,
                "easing": "linear",
            }
        )
    
    return {
        "slideType": f"{question_id}_summary",
        "totalDurationFrames": total_frames,
        "actualDurationSec": duration_sec,
        "animations": animations,
        "highlights": highlights,
        "narration": {
            "audioFile": timing_data["audio_file"],
            "startFrame": 0,
            "endFrame": total_frames,
            "durationSec": duration_sec,
            "wordTimings": word_timings
        }
    }


def create_feedback_blocks_choreography(timing_data: Dict[str, Any], question_id: str) -> Dict[str, Any]:
    duration_sec = timing_data.get("duration_sec", 9.0)
    total_frames = seconds_to_frames(duration_sec)
    question = get_question_data(question_id)
    word_timings = convert_word_timings_to_frames(timing_data.get("words", []))
    right_intro_frame = (
        find_phrase_in_words(word_timings, "let's start") or find_phrase_in_words(word_timings, "lets start")
    )
    wrong_intro_frame = (
        find_phrase_in_words(word_timings, "now let's see what went wrong")
        or find_phrase_in_words(word_timings, "what went wrong")
    )
    highlights = build_block_highlights(word_timings, get_feedback_specs(question), total_frames)
    right_highlight = next((h for h in highlights if h["blockId"] == "right_box"), None)
    wrong_highlight = next((h for h in highlights if h["blockId"] == "wrong_box"), None)

    if right_highlight and right_intro_frame is not None:
        right_highlight["startFrame"] = right_intro_frame
        for seg in right_highlight.get("segments", []):
            seg["startFrame"] = right_intro_frame

    # Nudge the wrong block to light up as soon as the narration pivots
    if wrong_highlight and wrong_intro_frame is not None:
        wrong_highlight["startFrame"] = max(
            min(wrong_highlight["startFrame"], wrong_intro_frame - 2),
            0,
        )

    animations = [
        animation_from_highlight(
            h["blockId"],
            h,
            "slideInLeft" if h["blockId"] == "right_box" else "slideInRight",
            duration=45,
            lead=0 if h["blockId"] == "right_box" else 20,
        )
        for h in highlights
    ]

    wrong_bullet_anchor = find_phrase_in_words(
        word_timings,
        "one",
        start_frame=wrong_intro_frame or 0,
    )

    if right_highlight:
        animations.append(
            {
                "blockId": "right_bullets",
                "type": "fadeIn",
                "startFrame": max(right_highlight["startFrame"] - 5, 0),
                "durationFrames": 30,
                "easing": "easeOut",
                "stagger": 10,
            }
        )
    if wrong_highlight:
        wrong_bullet_start = (
            max(wrong_bullet_anchor - 2, 0)
            if wrong_bullet_anchor is not None
            else max(wrong_highlight["startFrame"] - 5, 0)
        )
        animations.append(
            {
                "blockId": "wrong_bullets",
                "type": "fadeIn",
                "startFrame": wrong_bullet_start,
                "durationFrames": 30,
                "easing": "easeOut",
                "stagger": 10,
            }
        )
    
    return {
        "slideType": f"{question_id}_feedback",
        "totalDurationFrames": total_frames,
        "actualDurationSec": duration_sec,
        "animations": animations,
        "highlights": highlights,
        "narration": {
            "audioFile": timing_data["audio_file"],
            "startFrame": 0,
            "endFrame": total_frames,
            "durationSec": duration_sec,
            "wordTimings": word_timings
        }
    }


def create_thinking_steps_choreography(timing_data: Dict[str, Any], question_id: str) -> Dict[str, Any]:
    """
    FIXED v2: Segments remain individual, but column startFrame marks when
    the column becomes available for row-by-row reveal.
    """
    duration_sec = timing_data.get("duration_sec", 10.0)
    total_frames = seconds_to_frames(duration_sec)
    question = get_question_data(question_id)
    word_timings = convert_word_timings_to_frames(timing_data.get("words", []))
    
    # Find when column introductions are spoken
    thought_intro_frame = find_phrase_in_words(word_timings, "How You Thought")
    advice_intro_frame = find_phrase_in_words(word_timings, "Thinking Advice")
    # Show advice column at the very start (frame 0)
    my_advice_frame = 0
    
    # Build highlights - segments stay as they are (individual row timings)
    highlights = build_block_highlights(word_timings, get_thinking_specs(question), total_frames)
    
    # Update ONLY the column-level startFrame (not individual segments)
    # This tells the frontend when the column is "unlocked" for display
    for highlight in highlights:
        if highlight["blockId"] == "col_thought" and thought_intro_frame:
            highlight["startFrame"] = thought_intro_frame
        elif highlight["blockId"] == "col_advice":
            # Use the frame for 'my advice' (not 'my advice is to')
            if my_advice_frame is not None:
                highlight["startFrame"] = my_advice_frame
                for seg in highlight.get("segments", []):
                    seg["startFrame"] = max(seg.get("startFrame", my_advice_frame), my_advice_frame)
            elif advice_intro_frame:
                highlight["startFrame"] = advice_intro_frame
    
    animations = [
        animation_from_highlight(
            h["blockId"],
            h,
            "slideInLeft" if h["blockId"] == "col_steps" else "slideInUp",
            duration=40,
            lead=0 if h["blockId"] == "col_advice" else 18,
        )
        for h in highlights
    ]
    
    return {
        "slideType": f"{question_id}_thinking",
        "totalDurationFrames": total_frames,
        "actualDurationSec": duration_sec,
        "animations": animations,
        "highlights": highlights,
        "narration": {
            "audioFile": timing_data["audio_file"],
            "startFrame": 0,
            "endFrame": total_frames,
            "durationSec": duration_sec,
            "wordTimings": word_timings
        }
    }


def process_timing_file(timing_file: Path, manifest: List[Dict[str, Any]]) -> Dict[str, Any] | None:
    timing_data = json.loads(timing_file.read_text(encoding="utf-8"))
    filename = timing_file.stem
    
    manifest_entry = None
    for entry in manifest:
        audio_file = entry.get("narration", {}).get("audio_file", "")
        if filename in audio_file or audio_file.replace("audio/", "").replace(".mp3", "") == filename:
            manifest_entry = entry
            break
    
    if not manifest_entry:
        print(f"  ⚠️  No manifest entry found for {filename}, skipping")
        return None
    
    slide_type = manifest_entry.get("slide_type", "")
    question_id = manifest_entry.get("question_id", "")
    question_data = get_question_data(question_id)
    
    if "intro" in filename or slide_type == "intro":
        return create_intro_choreography(timing_data)
    elif "case" in filename or slide_type == "case":
        return create_case_overview_choreography(timing_data, question_data)
    elif "summary" in filename or slide_type == "q_summary":
        return create_question_summary_choreography(timing_data, question_id)
    elif "feedback" in filename or slide_type == "feedback_blocks":
        return create_feedback_blocks_choreography(timing_data, question_id)
    elif "thinking" in filename or slide_type == "thinking_steps":
        return create_thinking_steps_choreography(timing_data, question_id)
    else:
        print(f"  ⚠️  Unknown slide type '{slide_type}' for {filename}")
        return None


def main() -> None:
    if not TIMINGS_DIR.exists():
        raise FileNotFoundError(f"Timings directory not found: {TIMINGS_DIR}")
    
    if not MANIFEST_PATH.exists():
        raise FileNotFoundError(f"Narration manifest not found: {MANIFEST_PATH}")
    
    load_session_data()
    
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    
    CHOREOGRAPHY_DIR.mkdir(parents=True, exist_ok=True)
    
    timing_files = list(TIMINGS_DIR.glob("*.json"))
    generated_count = 0
    
    print("🎭 Calculating choreography from word timings...\n")
    
    for timing_file in timing_files:
        print(f"Processing {timing_file.name}...")
        choreography = process_timing_file(timing_file, manifest)
        
        if choreography:
            output_file = CHOREOGRAPHY_DIR / timing_file.name
            output_file.write_text(
                json.dumps(choreography, indent=2, ensure_ascii=False),
                encoding="utf-8"
            )
            print(f"  ✅ Generated {output_file.name}")
            generated_count += 1
    
    print(f"\n✅ Choreography calculation complete!")
    print(f"   Generated {generated_count} choreography files in {CHOREOGRAPHY_DIR}")


if __name__ == "__main__":
    main()
