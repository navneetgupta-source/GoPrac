#!/usr/bin/env python
"""
publish_assets.py
-----------------
Publishes generated assets to the frontend video-app:
- Audio files → public/audio/
- Choreography manifests → src/data/choreography/
- Word timings → src/data/timings/
- Updates narration_manifest.json with actual durations
"""

from __future__ import annotations

import shutil
from pathlib import Path
import json
from typing import Dict, List

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = PROJECT_ROOT / "backend"
DATA_DIR = BACKEND_DIR / "data"
BACKEND_OUTPUT = BACKEND_DIR / "output"
FRONTEND_DIR = PROJECT_ROOT / "video-app"
FRONTEND_DATA = FRONTEND_DIR / "src" / "data"
FRONTEND_AUDIO = FRONTEND_DIR / "public" / "audio"

# Session data paths
SESSION_SOURCE = DATA_DIR / "session_questions.json"
SESSION_DEST = FRONTEND_DATA / "session_questions.json"

# Source directories
AUDIO_SRC = BACKEND_OUTPUT / "audio"
CHOREOGRAPHY_SRC = BACKEND_OUTPUT / "choreography"
TIMINGS_SRC = BACKEND_OUTPUT / "timings"

# Destination directories
CHOREOGRAPHY_DEST = FRONTEND_DATA / "choreography"
TIMINGS_DEST = FRONTEND_DATA / "timings"
MANIFEST_DEST = FRONTEND_DATA / "narration_manifest.json"


def copy_session_data() -> bool:
    """Copy session_questions.json so visual text matches backend source."""
    print("📄 Publishing session data...")
    if not SESSION_SOURCE.exists():
        print(f"  ⚠️  Session data not found at {SESSION_SOURCE}")
        return False
    SESSION_DEST.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SESSION_SOURCE, SESSION_DEST)
    print(f"  ✅ session_questions.json → {SESSION_DEST}")
    return True


def copy_audio_files():
    """Copy audio files to frontend public directory"""
    print("🎵 Publishing audio files...")
    
    FRONTEND_AUDIO.mkdir(parents=True, exist_ok=True)
    
    audio_files = list(AUDIO_SRC.glob("*.mp3"))
    
    for audio_file in audio_files:
        dest_file = FRONTEND_AUDIO / audio_file.name
        shutil.copy2(audio_file, dest_file)
        print(f"  ✅ {audio_file.name}")
    
    return len(audio_files)


def copy_choreography_files():
    """Copy choreography manifests to frontend data directory"""
    print("\n📋 Publishing choreography manifests...")
    
    CHOREOGRAPHY_DEST.mkdir(parents=True, exist_ok=True)
    
    if not CHOREOGRAPHY_SRC.exists():
        print("  ⚠️  No choreography directory found")
        return 0
    
    choreo_files = list(CHOREOGRAPHY_SRC.glob("*.json"))
    
    for choreo_file in choreo_files:
        dest_file = CHOREOGRAPHY_DEST / choreo_file.name
        shutil.copy2(choreo_file, dest_file)
        print(f"  ✅ {choreo_file.name}")
    
    return len(choreo_files)


def copy_timing_files():
    """Copy word timing files to frontend data directory"""
    print("\n⏱️  Publishing word timing files...")
    
    TIMINGS_DEST.mkdir(parents=True, exist_ok=True)
    
    if not TIMINGS_SRC.exists():
        print("  ⚠️  No timings directory found")
        return 0
    
    timing_files = list(TIMINGS_SRC.glob("*.json"))
    
    for timing_file in timing_files:
        dest_file = TIMINGS_DEST / timing_file.name
        shutil.copy2(timing_file, dest_file)
        print(f"  ✅ {timing_file.name}")
    
    # Create index
    index_file = TIMINGS_DEST / "index.json"
    index = {f.stem: f"./{f.name}" for f in timing_files}
    index_file.write_text(json.dumps(index, indent=2), encoding="utf-8")
    
    return len(timing_files)


def update_narration_manifest():
    """Update narration_manifest.json with actual durations from audio timing"""
    print("\n📝 Updating narration manifest with actual audio durations...")
    
    # Load manifest from backend output
    manifest_source = BACKEND_OUTPUT / "narration_manifest.json"
    if not manifest_source.exists():
        print("  ⚠️  No manifest in backend output")
        return 0
    
    current_manifest = json.loads(manifest_source.read_text(encoding="utf-8"))
    
    # Load timing data for actual audio durations
    if not TIMINGS_SRC.exists():
        print("  ⚠️  No timing data, skipping duration updates")
        return 0
    
    # Create mapping from audio files to durations
    audio_durations: Dict[str, float] = {}
    for timing_file in TIMINGS_SRC.glob("*.json"):
        timing_data = json.loads(timing_file.read_text(encoding="utf-8"))
        audio_file = timing_data.get("audio_file", "")
        duration_sec = timing_data.get("duration_sec", 0)
        if audio_file:
            audio_durations[audio_file] = duration_sec
    
    # Update manifest with actual durations
    updated_count = 0
    for event in current_manifest:
        audio_file = event.get('narration', {}).get('audio_file', '')
        if audio_file in audio_durations:
            old_duration = event['animation'].get('duration_sec', 0)
            new_duration = audio_durations[audio_file]
            
            if abs(old_duration - new_duration) > 0.5:
                event['animation']['duration_sec'] = new_duration
                updated_count += 1
                print(f"  🔄 {audio_file}: {old_duration:.1f}s → {new_duration:.1f}s")
    
    # Save updated manifest to frontend
    MANIFEST_DEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_DEST.write_text(
        json.dumps(current_manifest, indent=4, ensure_ascii=False),
        encoding="utf-8"
    )
    
    print(f"  ✅ Updated {updated_count} durations in manifest")
    return updated_count


def publish() -> None:
    """Main publishing function"""
    print("📦 Publishing backend assets to frontend...\n")
    
    session_copied = copy_session_data()
    # Copy all assets
    audio_count = copy_audio_files()
    choreo_count = copy_choreography_files()
    timing_count = copy_timing_files()
    update_count = update_narration_manifest()
    
    # Summary
    print("\n" + "="*60)
    print("✅ ASSETS PUBLISHED SUCCESSFULLY")
    print("="*60)
    print(f"  Session data copied:  {'yes' if session_copied else 'no'}")
    print(f"  Audio files:         {audio_count}")
    print(f"  Choreography files:  {choreo_count}")
    print(f"  Timing files:        {timing_count}")
    print(f"  Manifest updates:    {update_count}")
    print("="*60)
    print("\n🎬 Frontend ready! Preview your video:")
    print(f"   cd video-app")
    print("   npm run dev")


if __name__ == "__main__":
    publish()
