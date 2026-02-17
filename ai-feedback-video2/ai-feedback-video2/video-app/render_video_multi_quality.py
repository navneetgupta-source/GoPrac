from __future__ import annotations

import argparse
import json
import os
import platform
import shutil
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Optional, List

# =========================
# Project Configuration
# =========================

PROJECT_ROOT = Path(__file__).resolve().parent
DEFAULT_ENTRY = PROJECT_ROOT / "src" / "index.ts"
DEFAULT_COMPOSITION = "FullVideo"
DEFAULT_OUTPUT_DIR = PROJECT_ROOT / "renders"
DEFAULT_BUNDLE_DIR = DEFAULT_OUTPUT_DIR / "bundle"
RENDER_METRICS_PATH = DEFAULT_OUTPUT_DIR / "render_metrics.json"

DEFAULT_QUALITIES: Dict[str, Dict[str, int]] = {
    "480p": {"width": 854, "height": 480},
    "720p": {"width": 1280, "height": 720},
    "1080p": {"width": 1920, "height": 1080},
}

# =========================
# Utilities
# =========================

def find_npx() -> str:
    for candidate in ("npx.cmd", "npx"):
        path = shutil.which(candidate)
        if path:
            return path
    raise RuntimeError("npx not found. Install Node.js and npm.")


def run_command(cmd: List[str], cwd: Path) -> None:
    subprocess.run(
        cmd,
        cwd=cwd,
        check=True,
        stdout=sys.stdout,
        stderr=sys.stderr,
        text=True,
    )


def ffprobe_duration(path: Path) -> Optional[float]:
    if not shutil.which("ffprobe"):
        return None
    cmd = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(path),
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return float(result.stdout.strip())
    except Exception:
        return None

# =========================
# Remotion Operations
# =========================

def bundle_project(npx_cmd: str, entry: Path, bundle_dir: Path) -> Path:
    print("\n=== Bundling Remotion Project ===")

    cmd = [
        npx_cmd,
        "remotion",
        "bundle",
        str(entry),
    ]
    print(" ", " ".join(cmd))

    run_command(cmd, cwd=PROJECT_ROOT)

    # Remotion outputs bundle to ./build
    build_dir = PROJECT_ROOT / "build"
    index_html = build_dir / "index.html"

    if not index_html.exists():
        raise RuntimeError(
            f"Bundling finished but index.html not found in {build_dir}"
        )

    print(f"✅ Bundle ready at: {build_dir}")
    return build_dir


def render_video(
    quality: str,
    width: int,
    height: int,
    bundle_dir: Path,     # ✅ directory
    composition: str,
    output_dir: Path,
    npx_cmd: str,
    concurrency: int,
    extra_args: Optional[str] = None,
) -> Dict[str, object]:
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / f"output_{quality}.mp4"

    cmd = [
        npx_cmd,
        "remotion",
        "render",
        str(bundle_dir),        # ✅ DIRECTORY, not file
        composition,
        str(output_file),
        "--codec=h264",
        "--pixel-format=yuv420p",
        f"--width={width}",
        f"--height={height}",
        f"--concurrency={concurrency}",
        "--overwrite",
        "--log=error",
        "--bundle-cache",
    ]

    if extra_args:
        cmd.extend(extra_args.split())

    print(f"\n=== Rendering {quality} ({width}x{height}) ===")
    print(" ", " ".join(cmd))

    start = time.perf_counter()
    run_command(cmd, cwd=PROJECT_ROOT)
    end = time.perf_counter()

    file_size_mb = output_file.stat().st_size / (1024 * 1024)
    duration_sec = ffprobe_duration(output_file)

    return {
        "quality": quality,
        "width": width,
        "height": height,
        "file": output_file.name,
        "file_size_mb": round(file_size_mb, 2),
        "duration_sec": None if duration_sec is None else round(duration_sec, 2),
        "render_time_sec": round(end - start, 2),
    }

# =========================
# Argument Parsing
# =========================

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Production-grade Remotion renderer (Windows-safe)"
    )
    parser.add_argument("--entry", type=Path, default=DEFAULT_ENTRY)
    parser.add_argument("--composition", default=DEFAULT_COMPOSITION)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--extra-args", default=None)
    parser.add_argument("--render-concurrency", type=int, default=None)
    return parser.parse_args()

# =========================
# Main
# =========================

def main() -> int:
    print("DEBUG: Entered main()")

    npx_cmd = find_npx()
    args = parse_args()

    cpu_count = os.cpu_count() or 2
    render_concurrency = args.render_concurrency or max(cpu_count - 1, 1)

    print("\n=== Render Configuration ===")
    print(f"CPU cores           : {cpu_count}")
    print("Parallel renders    : 1  (Windows-safe)")
    print(f"Render concurrency  : {render_concurrency}")
    print(f"Composition         : {args.composition}")
    print(f"Output directory    : {args.output_dir}")

    # ✅ Bundle once
    bundle_dir = bundle_project(npx_cmd, args.entry, DEFAULT_BUNDLE_DIR)

    render_results = []
    total_render_time = 0.0

    # ✅ Sequential rendering
    for quality, dims in DEFAULT_QUALITIES.items():
        print(f"\nDEBUG: Starting render for {quality}")

        result = render_video(
            quality=quality,
            width=dims["width"],
            height=dims["height"],
            bundle_dir=bundle_dir,
            composition=args.composition,
            output_dir=args.output_dir,
            npx_cmd=npx_cmd,
            concurrency=render_concurrency,
            extra_args=args.extra_args,
        )

        render_results.append(result)
        total_render_time += result["render_time_sec"]

    metrics = {
        "run_id": datetime.now(timezone.utc).isoformat(),
        "machine": {
            "os": platform.system(),
            "cpu_cores": cpu_count,
        },
        "composition": args.composition,
        "renders": render_results,
        "total_render_time_sec": round(total_render_time, 2),
    }

    args.output_dir.mkdir(parents=True, exist_ok=True)
    RENDER_METRICS_PATH.write_text(
        json.dumps(metrics, indent=2),
        encoding="utf-8",
    )

    print("\n=== Render Metrics Written ===")
    print(f"📄 {RENDER_METRICS_PATH}")

    return 0
if __name__ == "__main__":
    sys.exit(main())

