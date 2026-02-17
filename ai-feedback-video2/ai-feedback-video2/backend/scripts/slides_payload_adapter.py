#!/usr/bin/env python
"""
slides_payload_adapter.py
-------------------------
Helpers to translate the new slide-authoring JSON ("slides" payload) into:
 1. The legacy session_questions.json structure that the frontend expects.
 2. Pre-authored narration snippets that can feed directly into the narration
    manifest (skipping the OpenAI generation step).
"""

from __future__ import annotations

import copy
import json
import re
from pathlib import Path
from typing import Any, Dict, Iterable, List, Mapping

DEFAULT_SESSION_TEMPLATE = {
    "session_id": "session_001",
    "candidate_name": "Candidate",
    "case_title": "Case Study",
    "intro": {
        "headline": "YOUR AI FEEDBACK MENTOR",
        "highlights": [
            "FAANG mentors",
            "Premium institutes",
            "Real-time insights",
        ],
        "body": "Hi, I am your personalized AI trainer, trained by FAANG & global company experts from premium institutes.",
        "cta_text": "Let's Start Your Feedback",
    },
    "questions": [],
}

QUESTION_BLOCK_PATTERN = re.compile(r"^q(?P<num>\d+)_summary$")
PUNCT_SPACING_PATTERN = re.compile(r"\s+([,.;!?])")


class SlidesPayloadError(RuntimeError):
    """Raised when the slide payload cannot be parsed."""


def _clean_text(value: str | None) -> str | None:
    if not value or not isinstance(value, str):
        return None
    text = " ".join(value.strip().split())
    text = PUNCT_SPACING_PATTERN.sub(r"\1", text)
    return text or None


def _normalize_keywords(items: Iterable[str], limit: int = 3) -> List[Dict[str, str]]:
    keywords: List[Dict[str, str]] = []
    for item in items:
        if len(keywords) >= limit:
            break
        snippet = _clean_text(item)
        if not snippet:
            continue
        phrase = " ".join(snippet.split()[:4])
        if phrase:
            keywords.append({"text": phrase})
    return keywords


def _section_for_question(block: Mapping[str, Any] | None, qid: str) -> Mapping[str, Any] | None:
    if not block:
        return None
    if isinstance(block, Mapping) and any(k in block for k in ("visual", "narration")):
        return block
    if isinstance(block, Mapping):
        return block.get(qid) or block.get(qid.lower()) or block.get(qid.upper())
    return None


def load_slides_payload(path: Path | str) -> Dict[str, Any]:
    payload_path = Path(path)
    if not payload_path.exists():
        raise SlidesPayloadError(f"Slides payload not found at {payload_path}")
    try:
        payload = json.loads(payload_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise SlidesPayloadError(f"Slides payload at {payload_path} is not valid JSON") from exc
    slides = payload.get("slides") if isinstance(payload, dict) else None
    if not isinstance(slides, dict):
        raise SlidesPayloadError("Slides payload must contain a top-level 'slides' object")
    return slides


def convert_slides_to_session(
    slides: Mapping[str, Any],
    existing_session: Mapping[str, Any] | None = None,
) -> Dict[str, Any]:
    """Map the new slides structure to the legacy session schema."""
    session = copy.deepcopy(existing_session) if existing_session else copy.deepcopy(DEFAULT_SESSION_TEMPLATE)

    intro_block = slides.get("intro") or {}
    intro_visual = intro_block.get("visual") or {}
    intro_narr = intro_block.get("narration")

    case_title = _clean_text(intro_visual.get("headline")) or session.get("case_title")
    if case_title:
        session["case_title"] = case_title

    session_intro = session.setdefault("intro", {})
    session_intro.setdefault("highlights", copy.deepcopy(DEFAULT_SESSION_TEMPLATE["intro"]["highlights"]))
    session_intro["headline"] = case_title or session_intro.get("headline") or DEFAULT_SESSION_TEMPLATE["intro"]["headline"]
    session_intro["cta_text"] = (
        _clean_text(intro_visual.get("cta_text"))
        or session_intro.get("cta_text")
        or DEFAULT_SESSION_TEMPLATE["intro"]["cta_text"]
    )
    session_intro["body"] = (
        _clean_text(intro_narr)
        or session_intro.get("body")
        or DEFAULT_SESSION_TEMPLATE["intro"]["body"]
    )

    # Case overview -> problem summary
    case_overview = slides.get("case_overview") or {}
    case_visual = case_overview.get("visual") or {}
    case_narr = case_overview.get("narration") or {}

    scenario_points = case_visual.get("problem_scenario", {}).get("key_points", [])
    scenario_text = _clean_text(case_narr.get("problem_scenario")) or "Scenario details not provided."
    problem_summary = {
        "scenario": scenario_text,
        "scenario_narration": scenario_text,
        "scenario_points": scenario_points,
        "data": case_visual.get("data", {}).get("key_points", []),
        "business_rules": case_visual.get("business_rules", {}).get("key_points", []),
        "performance_constraints": case_visual.get("performance_constraints", {}).get("key_points", []),
        "data_narration": _clean_text(case_narr.get("data")) or "",
        "business_rules_narration": _clean_text(case_narr.get("business_rules")) or "",
        "performance_constraints_narration": _clean_text(case_narr.get("performance_constraints")) or "",
    }

    # Attempt to capture additional context from narration if data lists are empty.
    if not problem_summary["scenario_points"] and case_narr.get("problem_scenario"):
        fallback_point = _clean_text(case_narr["problem_scenario"])
        if fallback_point:
            problem_summary["scenario_points"] = [fallback_point]
    if not problem_summary["data"] and case_narr.get("data"):
        problem_summary["data"] = [_clean_text(case_narr["data"])]
    if not problem_summary["business_rules"] and case_narr.get("business_rules"):
        problem_summary["business_rules"] = [_clean_text(case_narr["business_rules"])]
    if not problem_summary["performance_constraints"] and case_narr.get("performance_constraints"):
        problem_summary["performance_constraints"] = [_clean_text(case_narr["performance_constraints"])]


    questions: List[Dict[str, Any]] = []
    for key in sorted(slides.keys()):
        match = QUESTION_BLOCK_PATTERN.match(key)
        if not match:
            continue
        qnum = int(match.group("num"))
        qid = f"q{qnum}"
        q_summary = slides[key] or {}
        q_visual = q_summary.get("visual") or {}
        # Support both legacy `question` and new `question_block` keys.
        q_question = q_visual.get("question_block") or q_visual.get("question") or {}
        question_prompt = _clean_text(q_question.get("question_text")) or "Question prompt missing."
        score_block = q_visual.get("score_block") or q_visual.get("score") or {}

        # Support feedback points from feedback_block, feedback_summary, or feedback_summary_block
        feedback_block = (
            q_visual.get("feedback_block")
            or q_visual.get("feedback_summary")
            or q_visual.get("feedback_summary_block")
            or {}
        )

        # Prefer visual text/points for feedback summary
        feedback_summary_text = (
            _clean_text(feedback_block.get("text"))
            or _clean_text(feedback_block.get("summary"))
            or _clean_text(feedback_block.get("description"))
            or _clean_text(feedback_block.get("body"))
        )
        if not feedback_summary_text:
            visual_points = feedback_block.get("points", [])
            if isinstance(visual_points, list):
                cleaned_points: List[str] = []
                for point in visual_points:
                    cleaned = _clean_text(point)
                    if cleaned:
                        cleaned_points.append(cleaned)
                if cleaned_points:
                    feedback_summary_text = " ".join(cleaned_points)
        # Only fall back to narration if visual is missing
        if not feedback_summary_text:
            feedback_summary_text = (
                _clean_text((q_summary.get("narration") or {}).get("feedback"))
                or "Feedback summary missing."
            )

        # Add narration text for what_went_right and what_went_wrong
        what_went_right_arr = slides.get("feedback_blocks", {}).get("visual", {}).get("what_went_right", [])
        what_went_wrong_arr = slides.get("feedback_blocks", {}).get("visual", {}).get("what_went_wrong", [])
        # Copy narration fields verbatim from input.txt
        what_went_right_narr = slides.get("feedback_blocks", {}).get("narration", {}).get("what_went_right", "")
        what_went_wrong_narr = slides.get("feedback_blocks", {}).get("narration", {}).get("what_went_wrong", "")

        question_entry: Dict[str, Any] = {
            "question_id": qid,
            "question_number": qnum,
            "topic": q_question.get("topic") or f"Question {qnum}",
            "score": (score_block or {}).get("score") or (score_block or {}).get("value"),
            "score_text": (score_block or {}).get("score_text")
            or (score_block or {}).get("text")
            or "Score unavailable",
            "question_prompt": question_prompt,
            "problem_summary": copy.deepcopy(problem_summary),
            # Prefer points from feedback_block, feedback_summary, or feedback_summary_block
            "feedback_points": feedback_block.get("points", []),
            "feedback_summary": feedback_summary_text,
            "what_went_right": what_went_right_arr,
            "what_went_right_narration": what_went_right_narr,
            "what_went_wrong": what_went_wrong_arr,
            "what_went_wrong_narration": what_went_wrong_narr,
            "thinking_advice": (
                _clean_text((slides.get("thinking_steps", {}).get("narration")) if isinstance(slides.get("thinking_steps", {}).get("narration"), str) else (slides.get("thinking_steps", {}).get("narration") or {}).get("thinking_advice"))
                or _clean_text((slides.get("thinking_steps", {}).get("narration")) if isinstance(slides.get("thinking_steps", {}).get("narration"), str) else (slides.get("thinking_steps", {}).get("narration") or {}).get("phase4_closing"))
                or "Thinking advice unavailable."
            ),
            "thinking_steps": {
                "steps": [row.get("step", "") for row in (slides.get("thinking_steps", {}).get("visual", {}).get("rows", []))],
                "how_you_thought": [row.get("how_you_thought", "") for row in (slides.get("thinking_steps", {}).get("visual", {}).get("rows", []))],
                "thinking_advice": [row.get("thinking_advice", "") for row in (slides.get("thinking_steps", {}).get("visual", {}).get("rows", []))],
            },
        }

        questions.append(question_entry)

    if questions:
        session["questions"] = questions
    elif existing_session and existing_session.get("questions"):
        session["questions"] = copy.deepcopy(existing_session["questions"])
    else:
        session["questions"] = []

    return session


def extract_preauthored_narrations(
    slides: Mapping[str, Any],
    session: Mapping[str, Any],
) -> Dict[str, Dict[str, Any]]:
    """
    Build a lookup dict of narration overrides keyed by slide_type/question_id.
    Keys follow the pattern "{slide_type}:{question_id}" where question_id is
    "global" for intro/case slides.
    """

    def key(slide_type: str, question_id: str | None = None) -> str:
        return f"{slide_type}:{question_id or 'global'}"

    narrations: Dict[str, Dict[str, Any]] = {}

    intro_text = _clean_text((slides.get("intro") or {}).get("narration"))
    if intro_text:
        highlights = session.get("intro", {}).get("highlights", [])
        narrations[key("intro")] = {
            "text": intro_text,
            "keywords": _normalize_keywords(highlights or [session.get("case_title", "")]),
        }

    case_narr = (slides.get("case_overview") or {}).get("narration") or {}
    case_parts = [
        _clean_text(case_narr.get("problem_scenario")),
        _clean_text(case_narr.get("data")),
        _clean_text(case_narr.get("business_rules")),
        _clean_text(case_narr.get("performance_constraints")),
    ]
    case_text = " ".join([part for part in case_parts if part])
    if case_text:
        case_points = []
        visual = (slides.get("case_overview") or {}).get("visual") or {}
        for bucket in ("problem_scenario", "data", "business_rules", "performance_constraints"):
            case_points.extend(visual.get(bucket, {}).get("key_points", []))
        narrations[key("case")] = {
            "text": case_text,
            "keywords": _normalize_keywords(case_points, limit=4),
        }

    questions = session.get("questions", [])
    for question in questions:
        qid = question.get("question_id")
        if not qid:
            continue
        slides_key = f"{qid}_summary"
        q_summary_block = slides.get(slides_key) or {}
        q_summary_narr = q_summary_block.get("narration") or {}
        q_text_parts = [
            _clean_text(q_summary_narr.get("question")),
            _clean_text(q_summary_narr.get("feedback")),
            _clean_text(q_summary_narr.get("score")),
        ]
        q_visual = (q_summary_block.get("visual") or {}) if isinstance(q_summary_block, Mapping) else {}
        feedback_points = (
            (q_visual.get("feedback_block") or q_visual.get("feedback_summary") or {}).get("points", [])
        )
        narrations[key("q_summary", qid)] = {
            "text": " ".join([part for part in q_text_parts if part]) or question.get("feedback_summary", ""),
            "keywords": _normalize_keywords(feedback_points, limit=3)
            or [{"text": question.get("topic", "Question")}],
        }

        thinking_block = _section_for_question(slides.get("thinking_steps"), qid) or {}
        thinking_narr = thinking_block.get("narration") or slides.get("thinking_steps", {}).get("narration") or {}
        # Patch: Concatenate all four narration fields for thinking_steps
        if isinstance(thinking_narr, dict):
            thinking_parts = [
                _clean_text(thinking_narr.get("thinking_steps")),
                _clean_text(thinking_narr.get("how_you_thought")),
                _clean_text(thinking_narr.get("thinking_advice")),
                _clean_text(thinking_narr.get("closing")),
            ]
        else:
            thinking_parts = [_clean_text(thinking_narr)]
        thinking_visual = thinking_block.get("visual", {}) if isinstance(thinking_block, Mapping) else {}
        thinking_rows = thinking_visual.get("table_rows") or thinking_visual.get("table") or []
        narrations[key("thinking_steps", qid)] = {
            "text": " ".join([part for part in thinking_parts if part]) or question.get("thinking_advice", ""),
            "keywords": _normalize_keywords(
                [row.get("step") for row in thinking_rows],
                limit=3,
            ),
        }

        feedback_block = _section_for_question(slides.get("feedback_blocks"), qid) or slides.get("feedback_blocks") or {}
        feedback_narr = feedback_block.get("narration") or {}
        feedback_parts = [
            _clean_text(feedback_narr.get("what_went_right")),
            _clean_text(feedback_narr.get("what_went_wrong")),
        ]
        # Scalable: Generate unique keywords for right/wrong blocks
        right_keywords = []
        wrong_keywords = []
        right_count = len((feedback_block.get("visual") or {}).get("what_went_right", []))
        wrong_count = len((feedback_block.get("visual") or {}).get("what_went_wrong", []))
        if right_count:
            right_keywords = [ {"text": f"right_{i+1}"} for i in range(right_count) ]
        if wrong_count:
            wrong_keywords = [ {"text": f"wrong_{i+1}"} for i in range(wrong_count) ]
        narrations[key("feedback_blocks", qid)] = {
            "text": " ".join([part for part in feedback_parts if part])
            or question.get("feedback_summary", ""),
            "keywords": right_keywords + wrong_keywords,
        }

    return narrations


def narration_lookup_key(slide_type: str, question_id: str | None = None) -> str:
    return f"{slide_type}:{question_id or 'global'}"
