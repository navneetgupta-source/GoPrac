# Project Cleanup Analysis & File Organization

## Overview
This document outlines the recommended file organization and cleanup for the AI Feedback Video project to prepare it for team handover.

---

## Current Markdown Files Analysis

### 📋 Files to KEEP

1. **README.md** (NEW - comprehensive root file)
   - Status: To be created
   - Purpose: Single source of truth for the entire project
   - Contains: Architecture, setup, pipeline, development workflow

### 📋 Files to REMOVE

1. **QUICK_START.md** (DEPRECATED)
   - Current Location: `d:\ai-feedback-video\QUICK_START.md`
   - Why: POC/testing guide for Remotion studio animations
   - Already Covered: Content will be integrated into main README under "Development" section
   - Action: DELETE

2. **backend/README.md** (DEPRECATED)
   - Current Location: `d:\ai-feedback-video\backend\README.md`
   - Why: Incomplete, mentions both orchestrate.py and run_pipeline.py (outdated)
   - Issues:
     - References run_pipeline.py which appears to be legacy
     - Uses different flags than current orchestrate.py
   - Already Covered: Will be integrated into main README under "Backend Pipeline" section
   - Action: DELETE

3. **video-app/README.md** (DEPRECATED)
   - Current Location: `d:\ai-feedback-video\video-app\README.md`
   - Why: Generic Remotion boilerplate, not project-specific
   - Action: DELETE (standard Remotion docs are online)

---

## Other Files Analysis

### ✅ KEEP - Critical Files

**Project Root:**
- `.env` - Environment variables (required for Azure TTS)
- `input.txt` - Authored feedback content (data source)
- `.venv/` - Python virtual environment
- `package-lock.json` - Frontend dependency lock

**Backend:**
- `backend/requirements.txt` - Python dependencies
- `backend/data/session_questions.json` - Session data
- `backend/output/` - Generated assets (keep all)
- `backend/scripts/` - All pipeline scripts (keep all):
  - `orchestrate.py` - **MAIN**: Single-click pipeline
  - `build_narration.py` - Generate narration manifest
  - `generate_tts_and_timings.py` - TTS synthesis + word timings
  - `calculate_choreography.py` - Animation/highlight generation
  - `publish_assets.py` - Copy to frontend
  - `convert_input_to_session.py` - Author JSON conversion
  - Supporting scripts (cost reporting, utilities)
- `backend/tts/azure_tts.py` - Azure TTS helper

**Frontend (video-app):**
- `package.json`, `tsconfig.json`, `postcss.config.mjs` - Config files
- `src/` - All source code (components, compositions, hooks, types, lib)
- `public/` - Static assets (audio, backgrounds, branding)
- `remotion.config.ts` - Remotion configuration
- `video-app/render_video_multi_quality.py` - Video rendering script

### ❌ REMOVE - Cache/Generated Files

- `__pycache__/` directories (will regenerate)
- `backend/__pycache__/` (will regenerate)
- `backend/scripts/__pycache__/` (will regenerate)
- `.venv/Lib/site-packages/` (virtual environment - can be regenerated)

### ⚠️ CONSIDER - Temporary/Test Files

- `input.txt` - Keep (data source)
- Backend output files - Keep (generated but useful reference)
- `video-app/build/` - Keep for now (can be regenerated, but useful reference)
- `video-app/__pycache__/` - Remove (will regenerate)

---

## Legacy Script Analysis

### orchestrate.py vs run_pipeline.py
- **orchestrate.py** - CURRENT (recommended)
  - Has conversion step, narration, TTS, choreography, publish
  - Supports: `--skip-convert`, `--skip-tts`, `--skip-choreo`, `--skip-publish`
  - ✅ KEEP THIS

- **run_pipeline.py** - LEGACY (outdated)
  - Different flag structure
  - Doesn't include conversion step
  - ❌ CONSIDER REMOVING (already superseded by orchestrate.py)

---

## Directory Structure Recommendations

```
d:\ai-feedback-video/
├── README.md                          # ← COMPREHENSIVE (NEW)
├── .env                               # Keep (Azure credentials)
├── input.txt                          # Keep (data source)
├── package-lock.json                  # Keep (lockfile)
│
├── backend/
│   ├── requirements.txt               # Keep
│   ├── data/
│   │   └── session_questions.json    # Keep (source)
│   ├── output/                        # Keep (generated assets)
│   ├── scripts/
│   │   ├── orchestrate.py            # ✅ MAIN ENTRY POINT
│   │   ├── build_narration.py        # Keep
│   │   ├── generate_tts_and_timings.py
│   │   ├── calculate_choreography.py
│   │   ├── publish_assets.py
│   │   ├── convert_input_to_session.py
│   │   └── [other utilities]
│   └── tts/
│       └── azure_tts.py
│
├── video-app/
│   ├── package.json                   # Keep
│   ├── tsconfig.json                  # Keep
│   ├── remotion.config.ts             # Keep
│   ├── postcss.config.mjs             # Keep
│   ├── src/                           # Keep (all)
│   ├── public/                        # Keep (assets)
│   └── [configs and source]
│
├── .venv/                             # Keep (can regenerate)
├── __pycache__/                       # ❌ REMOVE
└── video-app/__pycache__/            # ❌ REMOVE
```

---

## Setup Instructions (Post-Cleanup)

For new team members:

1. **Clone & Setup Environment**
   ```bash
   git clone <repo>
   cd d:\ai-feedback-video
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r backend/requirements.txt
   cd video-app && npm install && cd ..
   ```

2. **Configure Azure TTS** (`.env`)
   ```
   AZURE_SPEECH_KEY=<your-key>
   AZURE_SPEECH_REGION=eastus
   ```

3. **Run Pipeline**
   ```bash
   python backend/scripts/orchestrate.py
   ```

4. **Preview Video**
   ```bash
   cd video-app
   npm run dev
   ```

---

## Summary

| Action | Count | Items |
|--------|-------|-------|
| **DELETE** | 3 | QUICK_START.md, backend/README.md, video-app/README.md |
| **REMOVE** | 4 | `__pycache__/` directories |
| **KEEP** | ~50+ | All source code, configs, critical data files |
| **CREATE** | 1 | Comprehensive README.md at root |

---

## Next Steps

1. ✅ Create comprehensive README.md
2. ✅ Delete 3 markdown files
3. ✅ Remove __pycache__ directories
4. ✅ Verify final structure
5. ✅ Ready for team handover!
