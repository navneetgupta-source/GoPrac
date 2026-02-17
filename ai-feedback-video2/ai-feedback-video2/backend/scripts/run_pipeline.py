#!/usr/bin/env python
"""
run_pipeline.py
---------------
Master script to run the complete narration generation pipeline:
1. build_narration.py - Generate narration text with OpenAI
2. generate_tts_and_timings.py - Synthesize audio with Azure TTS + word timings
3. calculate_choreography.py - Convert timings to frame-accurate choreography
4. publish_assets.py - Copy everything to frontend

Usage:
    python scripts/run_pipeline.py                  # Run full pipeline
    python scripts/run_pipeline.py --skip-narration # Skip step 1 (use existing manifest)
    python scripts/run_pipeline.py --skip-tts       # Skip step 2 (use existing audio)
    python scripts/run_pipeline.py --publish-only   # Only run step 4
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
SCRIPTS_DIR = PROJECT_ROOT / "backend" / "scripts"

# Script paths
NARRATION_SCRIPT = SCRIPTS_DIR / "build_narration.py"
TTS_SCRIPT = SCRIPTS_DIR / "generate_tts_and_timings.py"
CHOREOGRAPHY_SCRIPT = SCRIPTS_DIR / "calculate_choreography.py"
PUBLISH_SCRIPT = SCRIPTS_DIR / "publish_assets.py"


def run_script(script_path: Path, step_name: str) -> bool:
    """Run a Python script and return success status"""
    print("\n" + "=" * 70)
    print(f"STEP: {step_name}")
    print("=" * 70 + "\n")
    
    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            check=True,
            cwd=PROJECT_ROOT,
            capture_output=False,
            text=True
        )
        print(f"\n✅ {step_name} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ {step_name} failed with exit code {e.returncode}")
        return False
    except Exception as e:
        print(f"\n❌ {step_name} failed: {e}")
        return False


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the narration generation pipeline")
    parser.add_argument("--skip-narration", action="store_true", help="Skip narration generation")
    parser.add_argument("--skip-tts", action="store_true", help="Skip TTS synthesis")
    parser.add_argument("--skip-choreography", action="store_true", help="Skip choreography calculation")
    parser.add_argument("--publish-only", action="store_true", help="Only run publish step")
    args = parser.parse_args()
    
    print("\n" + "🎬" * 35)
    print("NARRATION PIPELINE - Complete Video Generation")
    print("🎬" * 35)
    
    steps_run = 0
    steps_failed = 0
    
    if args.publish_only:
        # Only run publishing
        if not run_script(PUBLISH_SCRIPT, "4️⃣ Publish Assets"):
            return 1
        print("\n" + "🎉" * 35)
        print("PIPELINE COMPLETE - Assets Published!")
        print("🎉" * 35 + "\n")
        return 0
    
    # Step 1: Generate narration text
    if not args.skip_narration:
        steps_run += 1
        if not run_script(NARRATION_SCRIPT, "1️⃣ Generate Narration Text"):
            steps_failed += 1
            print("\n⚠️  Pipeline halted due to narration generation failure")
            return 1
    else:
        print("\n⏭️  Skipping narration generation (using existing manifest)")
    
    # Step 2: Synthesize audio with TTS
    if not args.skip_tts:
        steps_run += 1
        if not run_script(TTS_SCRIPT, "2️⃣ Synthesize Audio & Word Timings"):
            steps_failed += 1
            print("\n⚠️  Pipeline halted due to TTS synthesis failure")
            return 1
    else:
        print("\n⏭️  Skipping TTS synthesis (using existing audio)")
    
    # Step 3: Calculate choreography
    if not args.skip_choreography:
        steps_run += 1
        if not run_script(CHOREOGRAPHY_SCRIPT, "3️⃣ Calculate Frame-Accurate Choreography"):
            steps_failed += 1
            print("\n⚠️  Pipeline halted due to choreography calculation failure")
            return 1
    else:
        print("\n⏭️  Skipping choreography calculation (using existing files)")
    
    # Step 4: Publish to frontend
    steps_run += 1
    if not run_script(PUBLISH_SCRIPT, "4️⃣ Publish Assets to Frontend"):
        steps_failed += 1
        print("\n⚠️  Publishing failed")
        return 1
    
    # Summary
    print("\n" + "🎉" * 35)
    print("PIPELINE COMPLETE!")
    print("🎉" * 35)
    print(f"\nSteps completed: {steps_run - steps_failed}/{steps_run}")
    
    if steps_failed == 0:
        print("\n✨ All assets generated and published successfully!")
        print("\n📺 Next steps:")
        print("   cd video-app")
        print("   npm run dev")
        print("\n   Then enable narration in your slides by setting enabled=true")
        return 0
    else:
        print(f"\n⚠️  {steps_failed} step(s) failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
