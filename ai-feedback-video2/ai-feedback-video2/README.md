# AI Feedback Video - Complete Project Guide

A **full-stack application** that transforms authored feedback content into cinematic AI-narrated videos with synchronized animations, audio timings, and choreographed transitions.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Project Architecture](#project-architecture)
3. [Quick Start](#quick-start)
4. [Pipeline Workflow](#pipeline-workflow)
5. [Project Structure](#project-structure)
6. [Development Setup](#development-setup)
7. [Configuration](#configuration)
8. [Usage Guide](#usage-guide)
9. [Video Rendering](#video-rendering)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This project automates the creation of personalized AI feedback videos by:

1. **Ingesting** authored feedback content (JSON format)
2. **Synthesizing** professional narration audio via Azure Text-to-Speech
3. **Extracting** precise word-level timing data
4. **Calculating** frame-accurate animations and highlights
5. **Rendering** multi-quality videos with Remotion

### Key Features

✨ **Text-to-Speech Integration** - Azure Cognitive Services for high-quality narration  
⏱️ **Frame-Accurate Timing** - Synchronizes animations with audio at millisecond precision  
🎬 **Choreographed Animations** - Slides, fades, and staggered transitions  
🎨 **Responsive Design** - Built with Remotion and React  
📊 **Cost Tracking** - Automatic reporting of TTS synthesis costs  
🔄 **Reusable Pipeline** - Skip steps to avoid re-synthesizing unchanged content  

---

## Project Architecture

### High-Level Flow

```
┌─────────────────┐
│  input.txt      │ (Authored JSON)
│  (Feedback      │
│   Content)      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  BACKEND PIPELINE (Python)          │
│  ├─ Convert JSON → Session Data     │
│  ├─ Build Narration Manifest        │
│  ├─ Synthesize Audio + Get Timings  │
│  ├─ Calculate Choreography          │
│  └─ Publish to Frontend             │
└────────┬────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  frontend/video-app/src/data/          │
│  ├─ session_questions.json             │
│  ├─ narration_manifest.json            │
│  ├─ audio/ (*.mp3)                     │
│  ├─ timings/ (*.json)                  │
│  └─ choreography/ (*.json)             │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  FRONTEND (TypeScript/React/Remotion)  │
│  ├─ Load data sources                  │
│  ├─ Render choreographed slides        │
│  ├─ Apply animations at frame timings  │
│  └─ Sync audio playback                │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  Remotion Studio / Render Output       │
│  ├─ Preview (browser)                  │
│  ├─ Render MP4 (720p, 1080p, etc)      │
│  └─ Multi-quality variants             │
└────────────────────────────────────────┘
```

### Core Components

| Component | Language | Purpose |
|-----------|----------|---------|
| **Backend Pipeline** | Python | Data transformation, TTS synthesis, choreography calculation |
| **Frontend App** | TypeScript/React | Remotion compositions, animations, video rendering |
| **Azure TTS** | Cloud Service | Text-to-speech synthesis with word-level timing |
| **Video Renderer** | Remotion CLI | MP4 video generation |

---

## Quick Start

### Prerequisites

- **Python 3.8+** (with pip)
- **Node.js 16+** (with npm)
- **Azure Cognitive Services Account** (speech API key)
- **Git** (for version control)

### 1️⃣ Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd d:\ai-feedback-video

# Create Python virtual environment
python -m venv .venv
.venv\Scripts\Activate  # Windows
# OR
source .venv/bin/activate  # macOS/Linux

# Install Python dependencies
pip install -r backend/requirements.txt

# Install Node dependencies
cd video-app
npm install
cd ..
```

### 2️⃣ Configure Environment

Create `.env` file at project root:

```env
AZURE_SPEECH_KEY=<your-azure-speech-api-key>
AZURE_SPEECH_REGION=eastus
```

### 3️⃣ Run the Pipeline

```bash
# Single-click pipeline (recommended)
python backend/scripts/orchestrate.py

# Optional: Skip specific steps to save time
python backend/scripts/orchestrate.py --skip-tts  # Reuse existing audio/timings
```

The pipeline will:
- ✅ Convert authored content → session data
- ✅ Generate narration manifest
- ✅ Synthesize audio via Azure TTS
- ✅ Extract word-level timings
- ✅ Calculate choreography (animations)
- ✅ Publish all assets to frontend

### 4️⃣ Preview in Remotion Studio

```bash
cd video-app
npm run dev
```

Open http://localhost:3000 and click on "FullVideo" composition to preview.

### 5️⃣ Render Video

```bash
cd video-app
npx remotion render FullVideo output.mp4
# OR use the Python helper script for multi-quality output:
python render_video_multi_quality.py
```

---

## Pipeline Workflow

### Stage 1: Data Preparation

**Script:** `backend/scripts/convert_input_to_session.py`

**Input:** `input.txt` (authored JSON)

**Output:** `backend/data/session_questions.json`

Converts author-structured feedback content into standardized session data format compatible with frontend.

```json
{
  "intro": { "visual": {...}, "narration": "..." },
  "case_overview": { "visual": {...}, "narration": "..." },
  "q1_summary": { "visual": {...}, "narration": "..." },
  ...
}
```

---

### Stage 2: Narration Manifest

**Script:** `backend/scripts/build_narration.py`

**Input:** Session data + authored narration text

**Output:** `backend/output/narration_manifest.json`

Creates a manifest mapping each slide to its narration text and audio files.

```json
[
  {
    "slide_type": "intro",
    "event_id": "intro_welcome",
    "narration_text": "Hi, I'm your AI coach...",
    "audio_file": "intro_welcome.mp3"
  },
  ...
]
```

---

### Stage 3: TTS Synthesis & Timings

**Script:** `backend/scripts/generate_tts_and_timings.py`

**Services:** Azure Cognitive Services (Speech-to-Text)

**Outputs:**
- `backend/output/audio/` (MP3 files)
- `backend/output/timings/` (JSON word timings)

Synthesizes audio for each narration segment and extracts precise timing for each word.

```json
// Example word timing
{
  "audio_file": "intro_welcome.mp3",
  "words": [
    { "word": "Hi", "offset": 0.0, "duration": 0.3 },
    { "word": "I'm", "offset": 0.3, "duration": 0.2 },
    ...
  ]
}
```

---

### Stage 4: Choreography Calculation

**Script:** `backend/scripts/calculate_choreography.py`

**Input:** Word timings + slide definitions

**Output:** `backend/output/choreography/` (frame-accurate animations)

Converts audio timings into Remotion animation keyframes.

```json
{
  "slide_id": "q1_feedback",
  "animations": [
    {
      "blockId": "right_heading",
      "animationType": "slideFromLeft",
      "startFrame": 120,
      "duration": 15,
      "easing": "easeOut"
    },
    ...
  ]
}
```

---

### Stage 5: Publishing Assets

**Script:** `backend/scripts/publish_assets.py`

**Action:** Copy all generated assets to frontend

**Destination:** `video-app/src/data/`

Copies:
- `narration_manifest.json`
- `session_questions.json`
- `audio/` folder
- `timings/` folder
- `choreography/` folder

---

### ⏭️ Skip Flags (Optimization)

Avoid re-synthesizing unchanged content:

```bash
# Skip audio re-synthesis (reuse existing audio/timings)
python backend/scripts/orchestrate.py --skip-tts

# Skip choreography recalculation
python backend/scripts/orchestrate.py --skip-choreo

# Skip publishing (develop locally without overwriting frontend data)
python backend/scripts/orchestrate.py --skip-publish
```

---

## Project Structure

```
d:\ai-feedback-video/
│
├── README.md                           # This file
├── .env                                # Azure credentials (not in git)
├── input.txt                           # Authored feedback content (data source)
├── package-lock.json                   # Frontend dependency lock
│
├── backend/                            # Python pipeline & TTS
│   ├── requirements.txt                # Python dependencies
│   ├── data/
│   │   └── session_questions.json      # Session data (converted from input.txt)
│   ├── output/                         # Generated outputs
│   │   ├── narration_manifest.json     # Narration events & audio files
│   │   ├── audio/                      # MP3 files (Azure TTS output)
│   │   ├── timings/                    # Word-level timing JSON
│   │   ├── choreography/               # Animation keyframes JSON
│   │   └── reports/                    # Cost reports & analytics
│   ├── scripts/                        # Pipeline scripts
│   │   ├── orchestrate.py              # ⭐ MAIN: Single-click pipeline
│   │   ├── convert_input_to_session.py # JSON conversion
│   │   ├── build_narration.py          # Narration manifest generation
│   │   ├── generate_tts_and_timings.py # Azure TTS synthesis
│   │   ├── calculate_choreography.py   # Animation calculation
│   │   ├── publish_assets.py           # Copy to frontend
│   │   └── [utilities & reporting]
│   └── tts/
│       └── azure_tts.py                # Azure TTS wrapper
│
├── video-app/                          # React/Remotion frontend
│   ├── package.json                    # Dependencies
│   ├── tsconfig.json                   # TypeScript config
│   ├── postcss.config.mjs              # Tailwind config
│   ├── remotion.config.ts              # Remotion settings
│   ├── render_video_multi_quality.py   # Multi-quality render script
│   │
│   ├── src/
│   │   ├── index.ts                    # Entry point
│   │   ├── Root.tsx                    # Root component
│   │   ├── index.css                   # Global styles
│   │   │
│   │   ├── compositions/               # Remotion compositions
│   │   │   ├── FullVideo.tsx           # ⭐ Main video composition
│   │   │   └── slides/                 # Individual slide components
│   │   │       ├── IntroSlideEnhanced.tsx
│   │   │       ├── CaseOverviewSlide.tsx
│   │   │       ├── QuestionSummarySlide.tsx
│   │   │       ├── FeedbackBlocksSlide.tsx
│   │   │       └── ThinkingStepsSlide.tsx
│   │   │
│   │   ├── components/                 # React components
│   │   │   ├── animations/             # Animation primitives
│   │   │   ├── audio/                  # Audio playback
│   │   │   ├── layout/                 # Layout components
│   │   │   ├── narration/              # Narration display
│   │   │   └── text/                   # Text rendering
│   │   │
│   │   ├── data/                       # Generated/static data
│   │   │   ├── session_questions.json  # Slide structure (from backend)
│   │   │   ├── narration_manifest.json # Audio mapping (from backend)
│   │   │   ├── audio/                  # MP3 files (from backend)
│   │   │   ├── timings/                # Timing data (from backend)
│   │   │   └── choreography/           # Animation keyframes (from backend)
│   │   │
│   │   ├── hooks/                      # Custom React hooks
│   │   │   ├── useChoreography.ts      # Load & apply choreography
│   │   │   ├── useDynamicFontSize.ts   # Responsive text sizing
│   │   │   ├── useHighlightedParagraph.ts
│   │   │   ├── useMorphTransition.ts   # Morphing animations
│   │   │   └── [other hooks]
│   │   │
│   │   ├── lib/                        # Utilities
│   │   │   ├── config.ts               # Video configuration (fps, duration, etc)
│   │   │   ├── loadData.ts             # Data loading & parsing
│   │   │   ├── textUtils.ts            # Text manipulation
│   │   │   └── [other utilities]
│   │   │
│   │   └── types/                      # TypeScript interfaces
│   │       ├── manifest.ts             # Narration manifest types
│   │       ├── timings.ts              # Timing data types
│   │       ├── choreography.ts         # Animation types
│   │       └── [other types]
│   │
│   ├── public/                         # Static assets
│   │   ├── audio/                      # Audio files
│   │   ├── backgrounds/                # Background images
│   │   └── brand/                      # Logo, color palette
│   │
│   └── build/                          # Generated bundle (build output)
│
└── .venv/                              # Python virtual environment
```

---

## Development Setup

### For Backend Developers

1. **Activate Python environment:**
   ```bash
   .venv\Scripts\activate  # Windows
   source .venv/bin/activate  # macOS/Linux
   ```

2. **Edit authored content:**
   ```
   input.txt  # JSON format
   ```

3. **Run pipeline:**
   ```bash
   python backend/scripts/orchestrate.py
   ```

4. **Check outputs:**
   ```
   backend/output/
   ├── narration_manifest.json
   ├── audio/
   ├── timings/
   └── choreography/
   ```

### For Frontend Developers

1. **Install dependencies:**
   ```bash
   cd video-app
   npm install
   ```

2. **Start Remotion Studio:**
   ```bash
   npm run dev
   ```

3. **Edit React components:**
   ```
   video-app/src/components/
   video-app/src/compositions/
   ```

4. **Reload browser** to see changes

### For Full-Stack Development

1. Run backend pipeline
2. Start frontend dev server
3. Edit content/code and iterate
4. Render final video when ready

---

## Configuration

### Environment Variables (`.env`)

```env
# Azure Cognitive Services
AZURE_SPEECH_KEY=<your-speech-api-key>
AZURE_SPEECH_REGION=eastus

# Optional: Override default paths
SESSION_JSON_PATH=/path/to/session_questions.json
NARRATION_MANIFEST_PATH=/path/to/narration_manifest.json
SLIDES_PAYLOAD_PATH=/path/to/input.json
```

### Video Settings (`video-app/src/lib/config.ts`)

```typescript
export const VIDEO_CONFIG = {
  fps: 30,                    // Frames per second
  durationInSeconds: 300,     // Total video duration
  width: 1920,               // Video width
  height: 1080,              // Video height
};
```

### Azure TTS Settings

Default region: `eastus`

Supported regions: See [Azure Regions](https://azure.microsoft.com/en-us/global-infrastructure/services/)

---

## Usage Guide

### Authored Content Format

The `input.txt` file uses this JSON structure:

```json
{
  "slides": {
    "intro": {
      "visual": {
        "headline": "...",
        "cta_text": "..."
      },
      "narration": "..."
    },
    "case_overview": {
      "visual": { ... },
      "narration": "..."
    },
    "q1_summary": { ... },
    "feedback_blocks": { ... },
    "thinking_steps": { ... }
  }
}
```

### Adding New Slides

1. Add slide definition to `input.txt`
2. Run `python backend/scripts/orchestrate.py`
3. Pipeline automatically:
   - Generates narration
   - Synthesizes audio
   - Creates choreography
   - Updates frontend data

### Modifying Choreography

Edit choreography JSON files directly:

```json
// backend/output/choreography/q1_feedback.json
{
  "slide_id": "q1_feedback",
  "animations": [
    {
      "blockId": "heading",
      "animationType": "slideFromLeft",
      "startFrame": 100,
      "duration": 20
    }
  ]
}
```

Reload frontend to see changes.

### Reusing Generated Assets

Skip expensive operations:

```bash
# Only regenerate choreography (keep audio)
python backend/scripts/orchestrate.py --skip-tts

# Test frontend changes without backend pipeline
python backend/scripts/orchestrate.py --skip-publish
```

---

## Video Rendering

### Preview in Studio

```bash
cd video-app
npm run dev
# Open http://localhost:3000
```

### Single-Quality Render

```bash
cd video-app
npx remotion render FullVideo output.mp4
```

### Multi-Quality Render

```bash
cd video-app
python render_video_multi_quality.py
```

Outputs:
- `output_720p.mp4`
- `output_1080p.mp4`
- `output_4k.mp4`

### Render Options

```bash
# With codec specification
npx remotion render --codec h265 FullVideo output.mp4

# With custom frame rate
npx remotion render --fps 60 FullVideo output.mp4

# With concurrency
npx remotion render --concurrency 4 FullVideo output.mp4
```

See [Remotion Render Docs](https://www.remotion.dev/docs/cli/render) for full options.

---

## Troubleshooting

### Pipeline Issues

#### "AZURE_SPEECH_KEY not found"
**Solution:** Add `AZURE_SPEECH_KEY` to `.env` file

#### Audio synthesis fails
**Solutions:**
1. Verify Azure Cognitive Services account is active
2. Check API key has speech synthesis permission
3. Verify region is correct in `.env`
4. Check internet connection

#### Choreography calculation fails
**Solutions:**
1. Ensure timings are generated (run `--skip-tts` if already done)
2. Check choreography JSON format is valid
3. Verify slide IDs match between session and choreography data

### Frontend Issues

#### "Cannot find module" in TypeScript
**Solution:** Run `npm install` in `video-app` directory

#### Videos don't render
**Solutions:**
1. Ensure all data files exist in `video-app/src/data/`
2. Check Remotion studio runs without errors
3. Verify video composition loads (check browser console)

#### Audio out of sync
**Solutions:**
1. Regenerate timings: `python backend/scripts/orchestrate.py --skip-publish`
2. Verify FPS matches: Check `video-app/src/lib/config.ts`
3. Check choreography timing values

#### Animations don't play
**Solutions:**
1. Verify choreography files exist in `video-app/src/data/choreography/`
2. Check animation types are supported: `slideFromLeft`, `fade`, `slideFromRight`, etc.
3. Inspect browser console for errors
4. Try clearing cache: `Ctrl+Shift+Delete` in browser

### Development Issues

#### Python venv not activating
**Windows:**
```powershell
.venv\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
source .venv/bin/activate
```

#### npm dependencies conflict
**Solution:**
```bash
cd video-app
rm -rf node_modules package-lock.json
npm install
```

---

## API Documentation

### Backend Pipeline API

See individual script documentation:

- [orchestrate.py](backend/scripts/orchestrate.py) - Pipeline orchestrator
- [build_narration.py](backend/scripts/build_narration.py) - Narration generation
- [generate_tts_and_timings.py](backend/scripts/generate_tts_and_timings.py) - TTS synthesis
- [calculate_choreography.py](backend/scripts/calculate_choreography.py) - Animation calculation
- [publish_assets.py](backend/scripts/publish_assets.py) - Asset publishing

### Frontend Components

Key React components for extending:

- `FullVideo.tsx` - Main composition
- `FeedbackBlocksSlide.tsx` - Feedback slide with animations
- `useChoreography.ts` - Load and apply choreography data
- `loadData.ts` - Data loading utilities

---

## Performance & Optimization

### TTS Synthesis Optimization

```bash
# Skip re-synthesis if content unchanged
python backend/scripts/orchestrate.py --skip-tts
```

Typical synthesis time: 5-15 seconds per slide

### Video Rendering Optimization

```bash
# Use parallel encoding
npx remotion render --concurrency 4 FullVideo output.mp4

# Use faster codec
npx remotion render --codec h264 FullVideo output.mp4
```

Typical render time: 30-120 seconds (depends on video length and hardware)

### Browser Preview Performance

- Keep studio window <1500px wide for faster preview
- Use timeline scrubber instead of playback for testing
- Disable browser extensions that may affect video element

---

## Contributing Guidelines

1. Follow the existing code structure
2. Use TypeScript for frontend, Python for backend
3. Test changes in dev environment before committing
4. Document significant changes in code comments
5. Keep authored content (`input.txt`) properly formatted

---

## Support & Resources

- **Remotion Docs:** https://www.remotion.dev/docs
- **Azure Speech Services:** https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/
- **React Hooks:** https://react.dev/reference/react/hooks
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/

---

## License

[Add your license here]

---

## Version History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | Jan 2, 2026 | Initial comprehensive documentation |

---

## Contacts & Handover Notes

**For questions about:**
- **Backend Pipeline** → Check [backend/scripts/](backend/scripts/)
- **Frontend/Video** → Check [video-app/src/](video-app/src/)
- **Azure Configuration** → See [Configuration](#configuration) section
- **Specific slides** → See [input.txt](input.txt) for structure

**Next Steps for Team:**
1. Review this README thoroughly
2. Set up local environment following Quick Start
3. Run example pipeline to understand workflow
4. Explore frontend code structure
5. Test video preview in Remotion Studio
6. Prepare to extend with new slides/features

---

**Last Updated:** January 2, 2026  
**Status:** Ready for Team Handover ✅
