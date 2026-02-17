# AI Feedback Video - Technical Documentation

A comprehensive guide to understanding how this codebase transforms authored feedback content into cinematic AI-narrated videos.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Data Flow](#data-flow)
4. [Backend Pipeline](#backend-pipeline)
   - [Stage 1: Input Conversion](#stage-1-input-conversion)
   - [Stage 2: Narration Manifest](#stage-2-narration-manifest)
   - [Stage 3: TTS Synthesis](#stage-3-tts-synthesis)
   - [Stage 4: Choreography Calculation](#stage-4-choreography-calculation)
   - [Stage 5: Asset Publishing](#stage-5-asset-publishing)
5. [Frontend Video Composition](#frontend-video-composition)
   - [Remotion Configuration](#remotion-configuration)
   - [Slide Components](#slide-components)
   - [Animation System](#animation-system)
   - [Audio Synchronization](#audio-synchronization)
6. [Key Data Structures](#key-data-structures)
7. [Configuration Reference](#configuration-reference)

---

## System Overview

This project automates personalized AI feedback video creation through a two-phase process:

| Phase | Technology | Responsibility |
|-------|------------|----------------|
| **Backend** | Python 3.8+ | Data transformation, Azure TTS synthesis, choreography timing |
| **Frontend** | TypeScript/React/Remotion | Video composition, animations, rendering |

### Key Capabilities

- **Azure TTS Integration**: Professional narration with word-level timing extraction
- **Frame-Accurate Sync**: Animations synchronized to audio at 30fps precision
- **Choreographed Transitions**: Morph transitions, staggered reveals, keyword highlights
- **Multi-Quality Rendering**: Export to 720p, 1080p, or custom resolutions

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INPUT LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  input.txt                                                                   │
│  {                                                                           │
│    "slides": {                                                               │
│      "intro": { "visual": {...}, "narration": "..." },                       │
│      "case_overview": { "visual": {...}, "narration": {...} },               │
│      "q1_summary": { "visual": {...}, "narration": {...} },                  │
│      "feedback_blocks": { "visual": {...}, "narration": {...} },             │
│      "thinking_steps": { "visual": {...}, "narration": {...} }               │
│    }                                                                         │
│  }                                                                           │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BACKEND PIPELINE (Python)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐       │
│  │ 1. Convert JSON  │───▶│ 2. Build         │───▶│ 3. Generate TTS  │       │
│  │    to Session    │    │    Narration     │    │    + Timings     │       │
│  └──────────────────┘    └──────────────────┘    └────────┬─────────┘       │
│         │                        │                        │                  │
│         ▼                        ▼                        ▼                  │
│  session_questions.json  narration_manifest.json   audio/*.mp3              │
│                                                    timings/*.json            │
│                                                           │                  │
│                          ┌──────────────────┐             │                  │
│                          │ 4. Calculate     │◀────────────┘                  │
│                          │    Choreography  │                                │
│                          └────────┬─────────┘                                │
│                                   │                                          │
│                                   ▼                                          │
│                          choreography/*.json                                 │
│                                   │                                          │
│                          ┌────────┴─────────┐                                │
│                          │ 5. Publish to    │                                │
│                          │    Frontend      │                                │
│                          └──────────────────┘                                │
│                                                                              │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     FRONTEND (TypeScript/React/Remotion)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  video-app/src/data/           video-app/src/compositions/                  │
│  ├── session_questions.json    ├── FullVideo.tsx (main composition)         │
│  ├── narration_manifest.json   └── slides/                                  │
│  ├── audio/*.mp3                   ├── IntroSlideEnhanced.tsx               │
│  ├── timings/*.json                ├── CaseOverviewSlide.tsx                │
│  └── choreography/*.json           ├── QuestionSummarySlide.tsx             │
│                                    ├── FeedbackBlocksSlide.tsx              │
│                                    └── ThinkingStepsSlide.tsx               │
│                                                                              │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OUTPUT LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Remotion Studio Preview (http://localhost:3000)                          │
│  • Rendered MP4 Video (720p, 1080p, 4K)                                     │
│  • Cost Reports (HTML, CSV)                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Step-by-Step Transformation

```
input.txt (authored content)
    │
    │  convert_input_to_session.py
    ▼
session_questions.json (structured session data)
    │
    │  build_narration.py
    ▼
narration_manifest.json (slide → audio mapping)
    │
    │  generate_tts_and_timings.py (Azure TTS)
    ▼
audio/*.mp3 + timings/*.json (word-level timing)
    │
    │  calculate_choreography.py
    ▼
choreography/*.json (frame-accurate animations)
    │
    │  publish_assets.py
    ▼
video-app/src/data/* (frontend copy)
    │
    │  Remotion
    ▼
MP4 Video Output
```

---

## Backend Pipeline

The backend is orchestrated by a single entry point:

### Orchestrator Script

**File:** `backend/scripts/orchestrate.py`

```python
#!/usr/bin/env python
"""
orchestrate.py - Single-click pipeline runner
"""

STEPS = [
    ("Convert authored JSON → session", "convert_input_to_session.py", "convert"),
    ("Build narration manifest", "build_narration.py", "narration"),
    ("Synthesize TTS + timings", "generate_tts_and_timings.py", "tts"),
    ("Calculate choreography", "calculate_choreography.py", "choreo"),
    ("Publish to frontend", "publish_assets.py", "publish"),
]

def run_script(path: Path, label: str) -> bool:
    """Execute a pipeline step and return success status."""
    print(f"STEP: {label}")
    try:
        subprocess.run([sys.executable, str(path)], check=True, cwd=PROJECT_ROOT)
        print(f"✅ {label} completed")
        return True
    except subprocess.CalledProcessError as exc:
        print(f"❌ {label} failed with exit code {exc.returncode}")
        return False

# Usage:
# python backend/scripts/orchestrate.py
# python backend/scripts/orchestrate.py --skip-tts  # Reuse existing audio
```

---

### Stage 1: Input Conversion

**File:** `backend/scripts/convert_input_to_session.py`

Transforms authored JSON into a standardized session format.

**Input Example (`input.txt`):**
```json
{
  "slides": {
    "intro": {
      "visual": {
        "headline": "Checkout Total Integrity Debugging",
        "cta_text": "Let's Start Your Feedback"
      },
      "narration": "Hi Laukik, I am GoPrac's AI Coach. Let's walk through your feedback."
    },
    "case_overview": {
      "visual": {
        "problem_scenario": {
          "key_points": [
            "CheckoutService emits finalTotal for each order.",
            "JSP sometimes recomputes a separate displayTotal."
          ]
        }
      },
      "narration": {
        "problem_scenario": "What is the Problem Scenario? The service emits..."
      }
    }
  }
}
```

**Output Example (`session_questions.json`):**
```json
{
  "session_id": "session_001",
  "candidate_name": "Candidate",
  "case_title": "Checkout Total Integrity Debugging",
  "intro": {
    "headline": "Checkout Total Integrity Debugging",
    "highlights": ["FAANG mentors", "Premium institutes", "Real-time insights"],
    "body": "Hi Laukik, I am GoPrac's AI Coach...",
    "cta_text": "Let's Start Your Feedback"
  },
  "questions": [
    {
      "question_id": "q1",
      "question_number": 1,
      "topic": "Trace Variable Flows",
      "score": 6.5,
      "score_text": "Below Industry Standards",
      "question_prompt": "Trace the pricing total through...",
      "problem_summary": {
        "scenario_points": ["CheckoutService emits finalTotal..."],
        "scenario_narration": "What is the Problem Scenario?..."
      },
      "what_went_right": ["You pinpointed the mismatch region..."],
      "what_went_wrong": ["You skipped tracing CheckoutServlet..."],
      "thinking_steps": {
        "steps": ["Locate mismatch", "Validate rules"],
        "how_you_thought": ["You identified the mismatch..."],
        "thinking_advice": ["Trace finalTotal from service..."]
      }
    }
  ]
}
```

---

### Stage 2: Narration Manifest

**File:** `backend/scripts/build_narration.py`

Creates a manifest mapping each slide to its narration text and audio files.

**Core Logic:**
```python
@dataclass
class ManifestEvent:
    question_id: str
    question_number: int
    slide_type: str        # 'intro', 'case', 'q_summary', 'feedback_blocks', 'thinking_steps'
    slide_index: int       # Global ordering across all slides
    anim_num: int          # Animation sequence within slide
    shape_id: str          # DOM element identifier
    animation: AnimationSpec
    narration: Dict[str, Any]

# Example ManifestEvent for intro slide
{
    "question_id": "",
    "question_number": 0,
    "slide_type": "intro",
    "slide_index": 0,
    "anim_num": 1,
    "shape_id": "intro_welcome",
    "animation": {
        "type": "fade_in",
        "duration_sec": 2.0,
        "delay_sec": 0.5
    },
    "narration": {
        "text": "Hi Laukik, I am GoPrac's AI Coach...",
        "audio_file": "audio/intro_welcome.mp3",
        "voice_style": {
            "style": "friendly",
            "rate": "+0%",
            "pitch": "+0%"
        }
    }
}
```

**Output (`narration_manifest.json`):**
```json
[
  {
    "question_id": "",
    "question_number": 0,
    "slide_type": "intro",
    "slide_index": 0,
    "anim_num": 1,
    "shape_id": "intro_welcome",
    "animation": {"type": "fade_in", "duration_sec": 2.0},
    "narration": {
      "text": "Hi Laukik, I am GoPrac's AI Coach...",
      "audio_file": "audio/intro_welcome.mp3"
    }
  },
  {
    "question_id": "q1",
    "question_number": 1,
    "slide_type": "case",
    "slide_index": 1,
    "narration": {
      "text": "What is the Problem Scenario?...",
      "audio_file": "audio/case_overview.mp3"
    }
  }
]
```

---

### Stage 3: TTS Synthesis

**File:** `backend/scripts/generate_tts_and_timings.py`

Synthesizes audio via Azure Cognitive Services and extracts word-level timing.

**Azure TTS Wrapper (`backend/tts/azure_tts.py`):**
```python
VOICE_NAME = "en-IN-ArjunNeural"
DEFAULT_STYLE = {
    "style": "friendly",
    "rate": "+0%",
    "pitch": "+0%",
    "role_type": "mentor",
}

def synthesize_with_timings(text: str, output_path: Path, voice_style: Dict) -> Dict:
    """
    Synthesize narration and capture per-word timings.
    
    Returns:
        {
            "audio_file": "<path>",
            "duration_sec": float,
            "words": [
                {"text": "Hi", "start_sec": 0.0, "end_sec": 0.3, "duration_sec": 0.3},
                {"text": "I'm", "start_sec": 0.3, "end_sec": 0.5, "duration_sec": 0.2},
                ...
            ]
        }
    """
    speech_config = _speech_config()
    synthesizer = speechsdk.SpeechSynthesizer(speech_config, audio_config=None)
    
    word_boundaries: List[Dict] = []
    
    def _collect(evt: speechsdk.SpeechSynthesisWordBoundaryEventArgs):
        start = evt.audio_offset / 10_000_000  # convert 100ns to seconds
        duration_sec = evt.duration.total_seconds()
        word_boundaries.append({
            "text": evt.text,
            "start_sec": start,
            "end_sec": start + duration_sec,
            "duration_sec": duration_sec
        })
    
    # Connect callback BEFORE synthesis
    synthesizer.synthesis_word_boundary.connect(_collect)
    
    # Synthesize and save audio
    result = synthesizer.speak_text_async(text).get()
    
    with open(output_path, 'wb') as f:
        f.write(result.audio_data)
    
    return {
        "audio_file": str(output_path),
        "duration_sec": result.audio_duration.total_seconds(),
        "words": word_boundaries
    }
```

**Output Example (`timings/intro_welcome.json`):**
```json
{
  "audio_file": "audio/intro_welcome.mp3",
  "duration_sec": 8.45,
  "words": [
    {"text": "Hi", "start_sec": 0.05, "end_sec": 0.25, "duration_sec": 0.20},
    {"text": "Laukik", "start_sec": 0.28, "end_sec": 0.72, "duration_sec": 0.44},
    {"text": "I", "start_sec": 0.85, "end_sec": 0.95, "duration_sec": 0.10},
    {"text": "am", "start_sec": 0.98, "end_sec": 1.15, "duration_sec": 0.17},
    {"text": "GoPrac's", "start_sec": 1.18, "end_sec": 1.65, "duration_sec": 0.47},
    {"text": "AI", "start_sec": 1.68, "end_sec": 1.92, "duration_sec": 0.24},
    {"text": "Coach", "start_sec": 1.95, "end_sec": 2.35, "duration_sec": 0.40}
  ]
}
```

---

### Stage 4: Choreography Calculation

**File:** `backend/scripts/calculate_choreography.py`

Converts audio timings into frame-accurate Remotion animations.

**Key Functions:**
```python
FPS = 30
HIGHLIGHT_COLOR = "#E6A100"

def seconds_to_frames(seconds: float) -> int:
    """Convert seconds to frame number at 30fps."""
    return round(seconds * FPS)

def convert_word_timings_to_frames(words: List[Dict]) -> List[Dict]:
    """Transform word timings from seconds to frames."""
    return [
        {
            "word": w["text"],
            "startFrame": seconds_to_frames(w["start_sec"]),
            "endFrame": seconds_to_frames(w["end_sec"]),
            "durationFrames": seconds_to_frames(w["duration_sec"])
        }
        for w in words
    ]

def find_phrase_in_words(word_timings: List[Dict], search_phrase: str) -> Optional[int]:
    """
    Find when a specific phrase is spoken and return its start frame.
    Used to sync animations with specific words in narration.
    """
    phrase_tokens = tokenize_phrase(search_phrase)
    # ... fuzzy matching logic to find phrase in word timings
    return start_frame
```

**Choreography Builder Example:**
```python
def build_feedback_choreography(question_id: str, timing_data: Dict) -> Dict:
    """
    Build choreography for feedback blocks slide.
    
    Animations:
    1. Header fades in
    2. "What went right" cards stagger in from left
    3. "What went wrong" cards stagger in from right
    4. Each card highlights when narrated
    """
    word_frames = convert_word_timings_to_frames(timing_data["words"])
    
    # Find when narrator says "what you did right"
    right_start = find_phrase_in_words(word_frames, "what you did right")
    wrong_start = find_phrase_in_words(word_frames, "what went wrong")
    
    animations = [
        {
            "blockId": "header",
            "animationType": "fade",
            "startFrame": 0,
            "durationFrames": 15,
            "easing": "easeOut"
        },
        {
            "blockId": "right_cards",
            "animationType": "slideFromLeft",
            "startFrame": right_start - 30,  # 1 second before mentioned
            "durationFrames": 20,
            "stagger": 8,  # 8 frames between each card
            "easing": "easeOut"
        },
        {
            "blockId": "wrong_cards",
            "animationType": "slideFromRight",
            "startFrame": wrong_start - 30,
            "durationFrames": 20,
            "stagger": 8,
            "easing": "easeOut"
        }
    ]
    
    # Build highlights for each card when mentioned
    highlights = []
    for i, card_text in enumerate(right_cards):
        card_frame = find_phrase_in_words(word_frames, card_text[:20])
        if card_frame:
            highlights.append({
                "blockId": f"right_card_{i}",
                "startFrame": card_frame,
                "endFrame": card_frame + 90,  # 3 second highlight
                "color": HIGHLIGHT_COLOR
            })
    
    return {
        "slideId": f"{question_id}_feedback",
        "slideType": "feedback_blocks",
        "totalDurationFrames": seconds_to_frames(timing_data["duration_sec"]) + 45,
        "narration": {
            "audioFile": timing_data["audio_file"],
            "startFrame": 30,
            "durationSec": timing_data["duration_sec"],
            "wordTimings": word_frames
        },
        "animations": animations,
        "highlights": highlights
    }
```

**Output Example (`choreography/q1_feedback.json`):**
```json
{
  "slideId": "q1_feedback",
  "slideType": "feedback_blocks",
  "totalDurationFrames": 540,
  "narration": {
    "audioFile": "audio/q1_feedback.mp3",
    "startFrame": 30,
    "durationSec": 16.5,
    "endFrame": 525,
    "wordTimings": [
      {"word": "Let's", "startFrame": 2, "endFrame": 8, "durationFrames": 6},
      {"word": "start", "startFrame": 9, "endFrame": 15, "durationFrames": 6}
    ]
  },
  "animations": [
    {
      "blockId": "header",
      "animationType": "fade",
      "startFrame": 0,
      "durationFrames": 15,
      "easing": "easeOut"
    },
    {
      "blockId": "right_cards",
      "animationType": "slideFromLeft",
      "startFrame": 45,
      "durationFrames": 20,
      "stagger": 8
    }
  ],
  "highlights": [
    {
      "blockId": "right_card_0",
      "startFrame": 78,
      "endFrame": 168,
      "color": "#E6A100"
    }
  ]
}
```

---

### Stage 5: Asset Publishing

**File:** `backend/scripts/publish_assets.py`

Copies all generated assets to the frontend `data/` directory.

```python
def publish_assets():
    """Copy backend outputs to frontend src/data folder."""
    
    COPY_MAP = {
        BACKEND_OUTPUT / "narration_manifest.json": FRONTEND_DATA / "narration_manifest.json",
        BACKEND_DATA / "session_questions.json": FRONTEND_DATA / "session_questions.json",
    }
    
    # Copy individual files
    for src, dst in COPY_MAP.items():
        if src.exists():
            shutil.copy2(src, dst)
            print(f"✅ Copied {src.name}")
    
    # Copy directories
    for folder in ["audio", "timings", "choreography"]:
        src_dir = BACKEND_OUTPUT / folder
        dst_dir = FRONTEND_DATA / folder
        if src_dir.exists():
            shutil.copytree(src_dir, dst_dir, dirs_exist_ok=True)
            print(f"✅ Copied {folder}/")
```

---

## Frontend Video Composition

### Remotion Configuration

**File:** `video-app/src/lib/config.ts`

```typescript
export const VIDEO_CONFIG = {
  fps: 30,
  width: 1920,
  height: 1080,
};

// Color themes for content cards
export const CONTENT_THEMES = {
  optionA: {
    cardBackground: '#F7F7F7',
    textColor: '#1A1A1A',
    highlightBorder: '#E6A100',
  },
  optionB: {
    cardBackground: '#E8DCC8',  // Cream/linen
    textColor: '#2B2416',
    highlightBorder: '#E6A100',
  },
  optionC: {
    cardBackground: '#3D3D3D',  // Dark slate
    textColor: '#F4EFE0',
    highlightBorder: '#E6A100',
  },
};

export const PALETTE = {
  darkAzure: '#1e4a6b',
  azure: '#2f6fa1',
  backgroundStart: '#1a2332',
  backgroundEnd: '#1a2332',
  accentGreen: '#00bf63',
};
```

### Root Composition

**File:** `video-app/src/Root.tsx`

```typescript
import { Composition } from 'remotion';
import { FullVideo, fullVideoDurationInFrames } from './compositions/FullVideo';
import { VIDEO_CONFIG } from './lib/config';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="FullVideo"
      component={FullVideo}
      durationInFrames={fullVideoDurationInFrames}
      fps={VIDEO_CONFIG.fps}
      width={VIDEO_CONFIG.width}
      height={VIDEO_CONFIG.height}
    />
  );
};
```

### Main Composition

**File:** `video-app/src/compositions/FullVideo.tsx`

```typescript
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { morphPresentation } from '../components/animations/morphPresentation';

// Load all data
const sessionData = getSessionData();
const manifestEvents = getManifestEvents();

type SlideGroup = {
  id: string;
  slideType: 'intro' | 'case' | 'q_summary' | 'feedback_blocks' | 'thinking_steps';
  questionId: string;
  questionNumber: number;
  events: EventWithTiming[];
  durationInFrames: number;
};

// Build slide groups from manifest
const buildSlideGroups = (): SlideGroup[] => {
  const groups = new Map<string, SlideGroup>();
  
  manifestEvents.forEach((event) => {
    const key = `${event.question_id}-${event.slide_type}`;
    const audioTiming = event.narration?.audio_file 
      ? getAudioTiming(event.narration.audio_file) 
      : undefined;
    const choreography = loadChoreography(event.slide_type, event.question_id);
    
    // Calculate duration from choreography + narration + buffer
    const choreographyDuration = choreography?.totalDurationFrames ?? 0;
    const narrationFrames = audioTiming?.durationSec
      ? secToFrames(audioTiming.durationSec, VIDEO_CONFIG.fps)
      : 0;
    
    const durationInFrames = Math.max(choreographyDuration, narrationFrames + 45);
    
    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        slideType: event.slide_type,
        questionId: event.question_id,
        events: [event],
        durationInFrames,
      });
    }
  });
  
  return Array.from(groups.values());
};

// Render appropriate slide component
const renderSlide = (group: SlideGroup) => {
  const question = sessionData.questions.find(q => q.question_id === group.questionId);
  
  switch (group.slideType) {
    case 'intro':
      return <IntroSlide intro={sessionData.intro} heroTitle={sessionData.case_title} />;
    case 'case':
      return <CaseOverviewSlide caseTitle={sessionData.case_title} question={question} />;
    case 'q_summary':
      return <QuestionSummarySlide caseTitle={sessionData.case_title} question={question} />;
    case 'feedback_blocks':
      return <FeedbackBlocksSlide caseTitle={sessionData.case_title} question={question} />;
    case 'thinking_steps':
      return <ThinkingStepsSlide caseTitle={sessionData.case_title} question={question} />;
  }
};

// Main video composition
export const FullVideo: React.FC = () => {
  const TRANSITION_DURATION = 36;  // ~1.2 seconds
  
  return (
    <TransitionSeries>
      {slideGroups.map((group, index) => (
        <>
          <TransitionSeries.Sequence
            key={group.id}
            durationInFrames={group.durationInFrames}
          >
            {renderSlide(group)}
          </TransitionSeries.Sequence>
          
          {/* Morph transition between case → q_summary */}
          {shouldTransition(index) && (
            <TransitionSeries.Transition
              presentation={morphPresentation()}
              timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
            />
          )}
        </>
      ))}
    </TransitionSeries>
  );
};

// Total duration for Remotion
export const fullVideoDurationInFrames = slideGroups.reduce(
  (total, slide) => total + slide.durationInFrames,
  0,
);
```

---

### Slide Components

Each slide consumes session data and choreography to render animated content.

**File:** `video-app/src/compositions/slides/IntroSlideEnhanced.tsx`

```typescript
import { useCurrentFrame, interpolate, Easing, staticFile } from 'remotion';
import { useSlideChoreography } from '../../hooks/useChoreography';

export const IntroSlideEnhanced: React.FC<{ intro: SessionIntro; heroTitle?: string }> = ({
  intro,
  heroTitle,
}) => {
  const frame = useCurrentFrame();
  const choreography = useSlideChoreography('intro_welcome');
  
  // Camera dolly effect (subtle zoom-out)
  const cameraScale = interpolate(
    frame,
    [0, 90],
    [1.02, 1.0],
    { easing: Easing.out(Easing.exp), extrapolateRight: 'clamp' }
  );
  
  // Logo animation (fade + slide up)
  const logoOpacity = interpolate(frame, [12, 36], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: 'clamp',
  });
  const logoTranslateY = interpolate(frame, [12, 36], [-20, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: 'clamp',
  });
  
  // Headline animation (staggered after logo)
  const headlineOpacity = interpolate(frame, [27, 51], [0, 1], {
    easing: Easing.out(Easing.exp),
    extrapolateRight: 'clamp',
  });
  
  // CTA button with shine effect
  const ctaOpacity = interpolate(frame, [54, 78], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const shinePosition = interpolate(
    frame,
    [90, 150],
    [-100, 200],
    { extrapolateRight: 'clamp' }
  );
  
  return (
    <AbsoluteFill style={{ transform: `scale(${cameraScale})` }}>
      <BackgroundCanvas />
      
      {/* Logo */}
      <Img
        src={staticFile('brand/logo.png')}
        style={{
          opacity: logoOpacity,
          transform: `translateY(${logoTranslateY}px)`,
        }}
      />
      
      {/* Hero Title */}
      <h1 style={{ opacity: headlineOpacity }}>
        {heroTitle ?? intro.headline}
      </h1>
      
      {/* CTA Button with shine */}
      <div style={{ opacity: ctaOpacity, position: 'relative', overflow: 'hidden' }}>
        <span>{intro.cta_text}</span>
        <div
          style={{
            position: 'absolute',
            background: 'linear-gradient(90deg, transparent, white, transparent)',
            transform: `translateX(${shinePosition}%)`,
          }}
        />
      </div>
      
      {/* Narration Audio */}
      <NarrationAudio
        audioFile="audio/intro_welcome.mp3"
        startFrame={choreography?.narration?.startFrame ?? 80}
      />
    </AbsoluteFill>
  );
};
```

---

### Animation System

**File:** `video-app/src/hooks/useChoreography.ts`

```typescript
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimationBlock, SlideChoreography } from '../types/choreography';

export interface AnimationState {
  isVisible: boolean;
  opacity: number;
  transform: string;
}

/**
 * Hook to get choreography data for a slide
 */
export const useSlideChoreography = (slideId: string): SlideChoreography | null => {
  try {
    return require(`../data/choreography/${slideId}.json`) as SlideChoreography;
  } catch {
    return null;
  }
};

/**
 * Calculate animation state based on current frame and animation config
 */
export const useAnimationState = (
  animation: AnimationBlock | undefined,
  childIndex?: number,
): AnimationState => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  if (!animation) {
    return { isVisible: true, opacity: 1, transform: 'none' };
  }
  
  const { startFrame, durationFrames, stagger = 0, delay = 0, easing = 'easeOut' } = animation;
  
  // Calculate actual start with stagger for list items
  const actualStartFrame = startFrame + delay + (childIndex !== undefined ? childIndex * stagger : 0);
  const endFrame = actualStartFrame + durationFrames;
  
  // Not started yet
  if (frame < actualStartFrame) {
    return {
      isVisible: false,
      opacity: 0,
      transform: getInitialTransform(animation.animationType),
    };
  }
  
  // Animation complete
  if (frame >= endFrame) {
    return { isVisible: true, opacity: 1, transform: 'none' };
  }
  
  // Currently animating
  const progress = (frame - actualStartFrame) / durationFrames;
  const easedProgress = applyEasing(progress, easing);
  
  return {
    isVisible: true,
    opacity: easedProgress,
    transform: getAnimationTransform(animation.animationType, easedProgress),
  };
};

const getInitialTransform = (type: AnimationType): string => {
  switch (type) {
    case 'slideFromLeft':
      return 'translate3d(-100%, 0, 0)';
    case 'slideFromRight':
      return 'translate3d(100%, 0, 0)';
    case 'slideFromTop':
      return 'translate3d(0, -100%, 0)';
    case 'slideFromBottom':
      return 'translate3d(0, 100%, 0)';
    case 'scale':
      return 'scale(0.8)';
    case 'fade':
    default:
      return 'none';
  }
};

const getAnimationTransform = (type: AnimationType, progress: number): string => {
  const remaining = 1 - progress;
  switch (type) {
    case 'slideFromLeft':
      return `translate3d(${-100 * remaining}%, 0, 0)`;
    case 'slideFromRight':
      return `translate3d(${100 * remaining}%, 0, 0)`;
    case 'scale':
      return `scale(${0.8 + 0.2 * progress})`;
    default:
      return 'none';
  }
};
```

**Usage Example in Component:**
```typescript
const FeedbackCard: React.FC<{ text: string; index: number }> = ({ text, index }) => {
  const choreography = useSlideChoreography('q1_feedback');
  const cardAnimation = choreography?.animations.find(a => a.blockId === 'right_cards');
  const animState = useAnimationState(cardAnimation, index);  // Pass index for stagger
  
  return (
    <div
      style={{
        opacity: animState.opacity,
        transform: animState.transform,
        transition: 'none',  // Remotion handles frame-by-frame
      }}
    >
      {text}
    </div>
  );
};
```

---

### Audio Synchronization

**File:** `video-app/src/components/audio/NarrationAudio.tsx`

```typescript
import { Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

type NarrationAudioProps = {
  audioFile: string;
  startFrame?: number;
  volume?: number;
};

export const NarrationAudio: React.FC<NarrationAudioProps> = ({
  audioFile,
  startFrame = 0,
  volume = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Only render audio after start frame
  if (frame < startFrame) {
    return null;
  }
  
  // Calculate offset if we're past the start frame
  const startFromSec = (frame - startFrame) / fps;
  
  return (
    <Audio
      src={staticFile(audioFile)}
      startFrom={Math.round(startFromSec * fps)}
      volume={volume}
    />
  );
};
```

---

## Key Data Structures

### Session Question Type

**File:** `video-app/src/types/content.ts`

```typescript
export interface SessionQuestion {
  question_id: string;
  question_number: number;
  topic: string;
  score: number;
  score_text: string;
  question_prompt: string;
  problem_summary: {
    scenario_points: string[];
    scenario_narration: string;
    data: string[];
    data_narration: string;
    business_rules: string[];
    business_rules_narration: string;
    performance_constraints: string[];
    performance_constraints_narration: string;
  };
  feedback_points: string[];
  feedback_summary: string;
  what_went_right: string[];
  what_went_right_narration: string;
  what_went_wrong: string[];
  what_went_wrong_narration: string;
  thinking_steps: {
    steps: string[];
    how_you_thought: string[];
    thinking_advice: string[];
  };
  thinking_advice: string;
}

export interface SessionData {
  session_id: string;
  candidate_name: string;
  case_title: string;
  intro: SessionIntro;
  questions: SessionQuestion[];
}
```

### Choreography Types

**File:** `video-app/src/types/choreography.ts`

```typescript
export type AnimationType = 
  | 'fade'
  | 'slideFromLeft'
  | 'slideFromRight'
  | 'slideFromTop'
  | 'slideFromBottom'
  | 'scale'
  | 'none';

export interface WordTiming {
  word: string;
  startFrame: number;
  endFrame: number;
  durationFrames?: number;
}

export interface AnimationBlock {
  blockId: string;
  animationType?: AnimationType;
  startFrame: number;
  durationFrames: number;
  delay?: number;
  stagger?: number;  // For staggered children
  easing?: 'easeIn' | 'easeOut' | 'easeInOut' | 'linear' | 'spring';
  useSpring?: boolean;
  springConfig?: { damping?: number; mass?: number; stiffness?: number };
}

export interface BlockHighlight {
  blockId: string;
  startFrame: number;
  endFrame: number;
  color?: string;
  segments?: { text?: string; startFrame: number; endFrame: number }[];
}

export interface SlideChoreography {
  slideId: string;
  slideType: string;
  totalDurationFrames: number;
  narration?: {
    audioFile: string;
    startFrame: number;
    durationSec: number;
    endFrame?: number;
    wordTimings: WordTiming[];
  };
  animations: AnimationBlock[];
  highlights?: BlockHighlight[];
}
```

---

## Configuration Reference

### Environment Variables

Create `.env` at project root:

```env
# Azure Cognitive Services (required)
AZURE_SPEECH_KEY=your-speech-api-key
AZURE_SPEECH_REGION=eastus

# Optional overrides
SESSION_JSON_PATH=backend/data/session_questions.json
NARRATION_MANIFEST_PATH=backend/output/narration_manifest.json
```

### Pipeline Skip Flags

```bash
# Full pipeline
python backend/scripts/orchestrate.py

# Skip TTS (reuse existing audio)
python backend/scripts/orchestrate.py --skip-tts

# Skip choreography recalculation
python backend/scripts/orchestrate.py --skip-choreo

# Skip publishing to frontend
python backend/scripts/orchestrate.py --skip-publish

# Combine flags
python backend/scripts/orchestrate.py --skip-tts --skip-choreo
```

### Rendering Commands

```bash
# Preview in browser
cd video-app
npm run dev

# Render single quality
npx remotion render FullVideo output.mp4

# Render with specific settings
npx remotion render FullVideo output.mp4 --codec h264 --crf 18

# Multi-quality render (Python script)
python video-app/render_video_multi_quality.py
```

---

## Debugging Tips

### Check Word Timing Accuracy

```python
# In Python, inspect timing file
import json
timing = json.load(open('backend/output/timings/q1_feedback.json'))
for w in timing['words'][:10]:
    print(f"{w['text']:15} {w['start_sec']:.2f}s - {w['end_sec']:.2f}s")
```

### Verify Choreography Sync

```typescript
// In Remotion component, log frame + animation state
const frame = useCurrentFrame();
const animState = useAnimationState(animation);
console.log(`Frame ${frame}: visible=${animState.isVisible}, opacity=${animState.opacity}`);
```

### Test Specific Slide in Remotion Studio

Open http://localhost:3000, use the timeline scrubber to navigate to specific slides and verify:
- Audio/animation sync
- Highlight timing
- Transition smoothness

---

## File Reference

| Path | Purpose |
|------|---------|
| `backend/scripts/orchestrate.py` | Main pipeline entry point |
| `backend/scripts/convert_input_to_session.py` | JSON transformation |
| `backend/scripts/build_narration.py` | Manifest generation |
| `backend/scripts/generate_tts_and_timings.py` | Azure TTS synthesis |
| `backend/scripts/calculate_choreography.py` | Animation timing calculation |
| `backend/tts/azure_tts.py` | Azure TTS wrapper |
| `video-app/src/Root.tsx` | Remotion entry point |
| `video-app/src/compositions/FullVideo.tsx` | Main video composition |
| `video-app/src/hooks/useChoreography.ts` | Animation state hook |
| `video-app/src/lib/config.ts` | Video/theme configuration |
| `video-app/src/lib/loadData.ts` | Data loading utilities |
