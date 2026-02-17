#!/usr/bin/env python
"""
orchestrate.py
--------------
Single-click pipeline runner:
1) convert_input_to_session.py  (author JSON → session_questions.json)
2) build_narration.py           (author narration → narration_manifest.json)
3) generate_tts_and_timings.py  (TTS audio + word timings)
4) calculate_choreography.py    (derive animations/highlights from timings)
5) publish_assets.py            (copy everything into video-app)

Flags let you skip steps if you already ran them:
  --skip-convert
  --skip-tts
  --skip-choreo
  --skip-publish

Usage:
  python backend/scripts/orchestrate.py
  python backend/scripts/orchestrate.py --skip-tts  # reuse existing audio
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
SCRIPTS_DIR = PROJECT_ROOT / "backend" / "scripts"

STEPS = [
    ("Convert authored JSON → session", SCRIPTS_DIR / "convert_input_to_session.py", "convert"),
    ("Build narration manifest", SCRIPTS_DIR / "build_narration.py", "narration"),
    ("Synthesize TTS + timings", SCRIPTS_DIR / "generate_tts_and_timings.py", "tts"),
    ("Calculate choreography", SCRIPTS_DIR / "calculate_choreography.py", "choreo"),
    ("Publish to frontend", SCRIPTS_DIR / "publish_assets.py", "publish"),
]


def run_script(path: Path, label: str) -> bool:
    print("\n" + "=" * 70)
    print(f"STEP: {label}")
    print("=" * 70 + "\n")
    try:
        subprocess.run([sys.executable, str(path)], check=True, cwd=PROJECT_ROOT)
        print(f"\n✅ {label} completed")
        return True
    except subprocess.CalledProcessError as exc:
        print(f"\n❌ {label} failed with exit code {exc.returncode}")
        return False


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the full narration + choreography pipeline")
    parser.add_argument("--skip-convert", action="store_true", help="Skip author JSON → session conversion")
    parser.add_argument("--skip-tts", action="store_true", help="Skip TTS synthesis (reuse existing audio/timings)")
    parser.add_argument("--skip-choreo", action="store_true", help="Skip choreography calculation")
    parser.add_argument("--skip-publish", action="store_true", help="Skip publishing assets to video-app")
    args = parser.parse_args()

    skip_tags = {
        "convert": args.skip_convert,
        "narration": False,  # always rebuild to stay in sync with session
        "tts": args.skip_tts,
        "choreo": args.skip_choreo,
        "publish": args.skip_publish,
    }

    failures = 0
    for label, script_path, tag in STEPS:
        if skip_tags.get(tag, False):
            print(f"⏭️  Skipping: {label}")
            continue
        ok = run_script(script_path, label)
        if not ok:
            failures += 1
            # Stop immediately to avoid cascading bad outputs
            break

    if failures == 0:
        print("\n" + "🎉" * 20)
        print("PIPELINE COMPLETE")
        print("🎉" * 20 + "\n")
        print("Next: cd video-app && npm run dev (enable narration in slides if needed)")
        return 0

    print("\n⚠️  Pipeline halted. Fix the error above and rerun.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
