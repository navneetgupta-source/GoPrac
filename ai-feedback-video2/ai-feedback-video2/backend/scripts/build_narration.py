#!/usr/bin/env python
"""
build_narration.py
------------------
Generates narration manifest **without** calling OpenAI. It uses the narration
text already present in your slides/session JSON and falls back to basic
session fields when narration text is missing.
"""

from __future__ import annotations

import copy
import json
import os
import sys
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Dict, List, Callable

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
BACKEND_DIR = PROJECT_ROOT / "backend"
DATA_DIR = BACKEND_DIR / "data"
OUTPUT_DIR = BACKEND_DIR / "output"
FRONTEND_DATA_DIR = PROJECT_ROOT / "video-app" / "src" / "data"
DEFAULT_SLIDES_PATHS = [
    PROJECT_ROOT / "input.txt",
    PROJECT_ROOT / "input.json",
    DATA_DIR / "slides_payload.json",
    DATA_DIR / "slides_payload.txt",
]

SESSION_PATH = os.environ.get(
    "SESSION_JSON_PATH",
    str((DATA_DIR / "session_questions.json") if (DATA_DIR / "session_questions.json").exists()
        else (FRONTEND_DATA_DIR / "session_questions.json"))
)
MANIFEST_PATH = Path(os.environ.get("NARRATION_MANIFEST_PATH", OUTPUT_DIR / "narration_manifest.json"))


def resolve_slides_payload_path() -> str | None:
    env_value = os.environ.get("SLIDES_PAYLOAD_PATH")
    if env_value:
        return env_value
    for candidate in DEFAULT_SLIDES_PATHS:
        if candidate.exists():
            return str(candidate)
    return None


SLIDES_PAYLOAD_PATH = resolve_slides_payload_path()

load_dotenv(PROJECT_ROOT / ".env", override=True)

from backend.scripts.slides_payload_adapter import (  # noqa: E402
    convert_slides_to_session,
    extract_preauthored_narrations,
    load_slides_payload,
    narration_lookup_key,
    SlidesPayloadError,
)


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class AnimationSpec:
    type: str
    duration_sec: float
    delay_sec: float = 0.0


@dataclass
class ManifestEvent:
    question_id: str
    question_number: int
    slide_type: str
    slide_index: int
    anim_num: int
    shape_id: str
    animation: AnimationSpec
    narration: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        result = asdict(self)
        result["animation"] = asdict(self.animation)
        return result


SlideGenerator = Callable[[Dict[str, Any], Dict[str, Any]], Dict[str, Any]]


def get_preauthored_override(
    overrides: Dict[str, Dict[str, Any]] | None,
    slide_type: str,
    question_id: str | None = None,
) -> Dict[str, Any] | None:
    if not overrides:
        return None
    lookup_key = narration_lookup_key(slide_type, question_id)
    spec = overrides.get(lookup_key)
    return copy.deepcopy(spec) if spec else None


def normalize_narration_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ensure every narration block has a `text` string and a `keywords` list, even if
    the authored payload used alternative field names.
    """
    if not payload:
        raise ValueError("OpenAI payload was empty.")

    text = (
        payload.get("text")
        or payload.get("narration")
        or payload.get("explanation")
        or payload.get("message")
    )

    if not text or not isinstance(text, str):
        raise ValueError(f"OpenAI response missing `text`: {payload}")

    keywords = payload.get("keywords") or payload.get("highlights") or []
    if not isinstance(keywords, list):
        keywords = [keywords]

    normalized_keywords: List[Any] = []
    for kw in keywords:
        if isinstance(kw, dict):
            kw_text = kw.get("text")
            if kw_text:
                normalized_keywords.append({"text": kw_text.strip(), **{k: v for k, v in kw.items() if k != "text"}})
        else:
            kw_text = str(kw).strip()
            if kw_text:
                normalized_keywords.append(kw_text)

    payload["text"] = text.strip()
    payload["keywords"] = normalized_keywords
    return payload


# ---------------------------------------------------------------------------
# Slide builders
# ---------------------------------------------------------------------------

def build_intro_event(
    session: Dict[str, Any],
    slide_index: int,
    overrides: Dict[str, Dict[str, Any]] | None = None,
) -> ManifestEvent:
    override = get_preauthored_override(overrides, "intro") or {
        "text": f"Hi {session.get('candidate_name', 'there')}, welcome back! Let's dive into your case {session.get('case_title', '')}.",
        "keywords": [{"text": session.get("case_title", "case")}],
    }
    narration = normalize_narration_payload(override)
    narration["audio_file"] = "audio/intro_welcome.mp3"
    narration["voice_style"] = {
        "style": "cheerful",
        "rate": "-5%",
        "pitch": "+2%",
        "role_type": "Girl",
    }
    return ManifestEvent(
        question_id="intro",
        question_number=0,
        slide_type="intro",
        slide_index=slide_index,
        anim_num=1,
        shape_id="intro_caption",
        animation=AnimationSpec("fade_in", 6.0),
        narration=narration,
    )


def build_case_event(
    session: Dict[str, Any],
    slide_index: int,
    overrides: Dict[str, Dict[str, Any]] | None = None,
) -> ManifestEvent:
    override = get_preauthored_override(overrides, "case") or {
        "text": f"Here's the mystery: {session.get('case_title', 'your case')} — let's unpack what went wrong and fix it together.",
        "keywords": [{"text": "case"}, {"text": "problem"}],
    }
    narration = normalize_narration_payload(override)
    narration["audio_file"] = "audio/case_overview.mp3"
    narration["voice_style"] = {
        "style": "friendly",
        "rate": "-8%",
        "pitch": "+0%",
        "role_type": "Boy",
    }
    return ManifestEvent(
        question_id="case",
        question_number=0,
        slide_type="case",
        slide_index=slide_index,
        anim_num=1,
        shape_id="case_block",
        animation=AnimationSpec("slide_in_up", 7.0),
        narration=narration,
    )


def build_question_events(
    question: Dict[str, Any],
    slide_index: int,
    overrides: Dict[str, Dict[str, Any]] | None = None,
) -> List[ManifestEvent]:
    qid = question["question_id"]
    qnum = question["question_number"]
    events: List[ManifestEvent] = []

    # Question summary
    summary_payload = {
        "topic": question.get("topic"),
        "question_prompt": question.get("question_prompt"),
        "score": question.get("score"),
        "score_text": question.get("score_text"),
        "feedback_summary": question.get("feedback_summary"),
    }
    summary_override = get_preauthored_override(overrides, "q_summary", qid)
    summary_narr = normalize_narration_payload(summary_override or {
        "text": " ".join(
            [
                f"The question was: {summary_payload.get('question_prompt','')}.",
                f"Your score: {summary_payload.get('score','?')}.",
                summary_payload.get("feedback_summary", ""),
            ]
        ),
        "keywords": [{"text": "question"}, {"text": "score"}, {"text": "feedback"}],
    })
    summary_narr["audio_file"] = f"audio/{qid}_summary.mp3"
    summary_narr["voice_style"] = {
        "style": "empathetic",
        "rate": "-6%",
        "pitch": "+1%",
        "role_type": "Girl",
    }
    events.append(
        ManifestEvent(
            question_id=qid,
            question_number=qnum,
            slide_type="q_summary",
            slide_index=slide_index,
            anim_num=1,
            shape_id="q_summary_block",
            animation=AnimationSpec("fade_in", 7.0),
            narration=summary_narr,
        )
    )
    slide_index += 1

    # Feedback blocks (now second slide in the question cluster)
    feedback_payload = {
        "what_went_right": question.get("what_went_right", []),
        "what_went_wrong": question.get("what_went_wrong", []),
        "thinking_advice": question.get("thinking_advice"),
    }
    feedback_override = get_preauthored_override(overrides, "feedback_blocks", qid)
    feedback_narr = normalize_narration_payload(feedback_override or {
        "text": " ".join(
            [
                "Let's wrap up your feedback.",
                "What went right:",
                " ".join(question.get("what_went_right", [])),
                "What needs work:",
                " ".join(question.get("what_went_wrong", [])),
            ]
        ),
        "keywords": [{"text": "right"}, {"text": "wrong"}],
    })
    feedback_narr["audio_file"] = f"audio/{qid}_feedback.mp3"
    feedback_narr["voice_style"] = {
        "style": "cheerful",
        "rate": "-5%",
        "pitch": "+1%",
        "role_type": "Girl",
    }
    events.append(
        ManifestEvent(
            question_id=qid,
            question_number=qnum,
            slide_type="feedback_blocks",
            slide_index=slide_index,
            anim_num=1,
            shape_id="feedback_blocks",
            animation=AnimationSpec("slide_in_up", 7.0),
        narration=feedback_narr,
    )
    )
    slide_index += 1

    # Thinking steps (now last slide in the question cluster)
    thinking_payload = {
        "steps": question.get("thinking_steps", []),
        "advice": question.get("thinking_advice"),
    }
    thinking_override = get_preauthored_override(overrides, "thinking_steps", qid)
    thinking_narr = normalize_narration_payload(thinking_override or {
        "text": " ".join(
            [
                "Let's review your thinking steps.",
                thinking_payload.get("advice") or "",
            ]
        ),
        "keywords": [{"text": "steps"}, {"text": "advice"}],
    })
    thinking_narr["audio_file"] = f"audio/{qid}_thinking.mp3"
    thinking_narr["voice_style"] = {
        "style": "friendly",
        "rate": "-7%",
        "pitch": "+0%",
        "role_type": "Boy",
    }
    events.append(
        ManifestEvent(
            question_id=qid,
            question_number=qnum,
            slide_type="thinking_steps",
            slide_index=slide_index,
            anim_num=1,
            shape_id="thinking_table",
            animation=AnimationSpec("slide_in_left", 8.0),
            narration=thinking_narr,
        )
    )
    slide_index += 1

    return events, slide_index


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    session_path = Path(SESSION_PATH)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    existing_session: Dict[str, Any] = {}
    if session_path.exists():
        existing_session = json.loads(session_path.read_text(encoding="utf-8"))
    elif not SLIDES_PAYLOAD_PATH:
        raise FileNotFoundError(f"session_questions.json not found at {session_path}")

    overrides: Dict[str, Dict[str, Any]] = {}
    if SLIDES_PAYLOAD_PATH:
        if not os.environ.get("SLIDES_PAYLOAD_PATH"):
            print(f"ℹ️  Auto-detected slides payload at {SLIDES_PAYLOAD_PATH}")
        try:
            slides = load_slides_payload(SLIDES_PAYLOAD_PATH)
        except SlidesPayloadError as exc:
            raise RuntimeError(f"Failed to load slides payload: {exc}") from exc
        session = convert_slides_to_session(slides, existing_session)
        overrides = extract_preauthored_narrations(slides, session)
        session_path.parent.mkdir(parents=True, exist_ok=True)
        session_path.write_text(json.dumps(session, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"📄 Session data refreshed from slides payload ({SLIDES_PAYLOAD_PATH})")
    else:
        session = existing_session

    events: List[ManifestEvent] = []
    slide_index = 1

    events.append(build_intro_event(session, slide_index, overrides))
    slide_index += 1

    events.append(build_case_event(session, slide_index, overrides))
    slide_index += 1

    for question in session.get("questions", []):
        question_events, slide_index = build_question_events(question, slide_index, overrides)
        events.extend(question_events)

    manifest_dicts = [event.to_dict() for event in events]
    MANIFEST_PATH.write_text(json.dumps(manifest_dicts, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"✅ Narration manifest written to {MANIFEST_PATH}")


if __name__ == "__main__":
    main()
