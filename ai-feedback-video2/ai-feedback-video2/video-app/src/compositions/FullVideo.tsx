import { AbsoluteFill } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { VIDEO_CONFIG } from '../lib/config';
import { getAudioTiming, getManifestEvents, getSessionData } from '../lib/loadData';
import { secToFrames } from '../lib/time';
import { IntroSlideEnhanced as IntroSlide } from './slides/IntroSlideEnhanced';
import { CaseOverviewSlide } from './slides/CaseOverviewSlide';
import { QuestionSummarySlide } from './slides/QuestionSummarySlide';
import { FeedbackBlocksSlide } from './slides/FeedbackBlocksSlide';
import { ThinkingStepsSlide } from './slides/ThinkingStepsSlide';
import { ManifestEvent } from '../types/manifest';
import { AudioTiming } from '../types/timings';
import { morphPresentation } from '../components/animations/morphPresentation';
import { SlideChoreography } from '../types/choreography';

const sessionData = getSessionData();
const manifestEvents = getManifestEvents();
const FEEDBACK_SLIDE_CAP_FRAMES = 6000;

type EventWithTiming = ManifestEvent & { audioTiming?: AudioTiming };

const loadChoreography = (
  slideType: ManifestEvent['slide_type'],
  questionId: string,
): SlideChoreography | null => {
  try {
    switch (slideType) {
      case 'intro':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('../data/choreography/intro_welcome.json') as SlideChoreography;
      case 'case':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('../data/choreography/case_overview.json') as SlideChoreography;
      case 'q_summary':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require(`../data/choreography/${questionId}_summary.json`) as SlideChoreography;
      case 'feedback_blocks':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require(`../data/choreography/${questionId}_feedback.json`) as SlideChoreography;
      case 'thinking_steps':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require(`../data/choreography/${questionId}_thinking.json`) as SlideChoreography;
      default:
        return null;
    }
  } catch {
    return null;
  }
};

type SlideGroup = {
  id: string;
  slideType: ManifestEvent['slide_type'];
  questionId: string;
  questionNumber: number;
  slideIndex: number;
  events: EventWithTiming[];
  durationInFrames: number;
};

const DEFAULT_SLIDE_DURATION_SEC = 6;
const BUFFER_FRAMES = 45; // tighter safety window so slides feel snappier
const FEEDBACK_END_BUFFER = 12; // small tail after choreography ends
// No fixed duration; compute from narration/choreo + buffer
const BASE_NARRATION_START_FRAMES: Partial<Record<ManifestEvent['slide_type'], number>> = {
  intro: 80, // intro narration delayed to let hero animate in
  case: 80, // case narration delayed for block entrances
  q_summary: 60, // delay so narration starts near question block entrance
  feedback_blocks: 30, // let cards settle before speaking
  thinking_steps: 24, // small lead-in for table headers
};

const buildSlideGroups = (): SlideGroup[] => {
  if (manifestEvents.length === 0) {
    return [];
  }

  const groups = new Map<string, SlideGroup>();

  manifestEvents.forEach((event) => {
    const key = `${event.question_id}-${event.slide_type}-${event.slide_index}`;
    const audioTiming =
      event.narration?.audio_file ? getAudioTiming(event.narration.audio_file) : undefined;
    const choreography = loadChoreography(event.slide_type, event.question_id);
    const choreographyDuration = choreography?.totalDurationFrames ?? 0;
    const choreographyNarrStart = choreography?.narration?.startFrame ?? 0;
    const narrationFrames = audioTiming?.durationSec
      ? secToFrames(audioTiming.durationSec, VIDEO_CONFIG.fps)
      : 0;
    const narrationStartFrame =
      choreographyNarrStart > 0
        ? choreographyNarrStart
        : BASE_NARRATION_START_FRAMES[event.slide_type] ?? 0;
    const narrationTotalFrames = narrationStartFrame + narrationFrames;
    const bufferFrames =
      event.slide_type === 'feedback_blocks' ? FEEDBACK_END_BUFFER : BUFFER_FRAMES;

    const enriched: EventWithTiming = { ...event, audioTiming };
    const durationSec =
      (event.animation.delay_sec ?? 0) + (event.animation.duration_sec ?? DEFAULT_SLIDE_DURATION_SEC);
    const durationFramesFromAnim = secToFrames(durationSec, VIDEO_CONFIG.fps);

    // Ensure slide lasts at least narration/choreo + a small buffer
    // For feedback blocks, prefer the choreography duration to avoid over-padding when audio timings are longer than the visual choreo.
    const calcDuration =
      event.slide_type === 'feedback_blocks' && choreographyDuration > 0
        ? choreographyDuration + FEEDBACK_END_BUFFER
        : Math.max(
            choreographyDuration || durationFramesFromAnim,
            narrationTotalFrames + bufferFrames,
          );

    const cappedDurationFrames =
      event.slide_type === 'feedback_blocks'
        ? Math.min(calcDuration, FEEDBACK_SLIDE_CAP_FRAMES)
        : calcDuration;

    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        slideType: event.slide_type,
        questionId: event.question_id,
        questionNumber: event.question_number,
        slideIndex: event.slide_index,
        events: [enriched],
        durationInFrames: cappedDurationFrames,
      });
    } else {
      const existing = groups.get(key)!;
      existing.events.push(enriched);
      existing.durationInFrames = Math.max(existing.durationInFrames, cappedDurationFrames);
    }
  });

  return Array.from(groups.values()).sort((a, b) => a.slideIndex - b.slideIndex);
};

const renderSlide = (group: SlideGroup) => {
  const question = sessionData.questions.find((q) => q.question_id === group.questionId);

  switch (group.slideType) {
    case 'intro':
      return (
        <IntroSlide
          intro={sessionData.intro}
          heroTitle={sessionData.case_title}
        />
      );
    case 'case':
      return (
        <CaseOverviewSlide
          caseTitle={sessionData.case_title}
          question={sessionData.questions[0]}
        />
      );
    case 'q_summary':
      if (!question) return null;
      return (
        <QuestionSummarySlide
          caseTitle={sessionData.case_title}
          question={question}
        />
      );
    case 'thinking_steps':
      if (!question) return null;
      return (
        <ThinkingStepsSlide
          caseTitle={sessionData.case_title}
          question={question}
        />
      );
    case 'feedback_blocks':
      if (!question) return null;
      return (
        <FeedbackBlocksSlide
          caseTitle={sessionData.case_title}
          question={question}
        />
      );
    default:
      return null;
  }
};

const slideGroups = buildSlideGroups();

export const fullVideoDurationInFrames = slideGroups.reduce(
  (total, slide) => total + slide.durationInFrames,
  0,
);

export const FullVideo: React.FC = () => {
  if (slideGroups.length === 0) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: '#0b1f33',
          color: '#f8fbff',
          fontSize: 48,
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Inter", "Segoe UI", sans-serif',
        }}
      >
        No narration manifest found. Run the backend pipeline.
      </AbsoluteFill>
    );
  }

  // Define transition duration (36 frames ≈ 1.2s) to keep cadence lively
  const TRANSITION_DURATION = 36;
  
// Breathing room: add short 0.2s pause after each narration ends
const BREATHING_PAUSE = 6;
// Case slide gets a smaller extra pause to keep momentum
const CASE_EXTRA_PAUSE = 20;
// Add a 1s cushion before the last slide (feedback -> thinking)
const FEEDBACK_TO_THINKING_PAUSE = VIDEO_CONFIG.fps; // 1 second at current fps

  // Check if transition should be applied between slides
  const shouldTransition = (currentIndex: number) => {
    const currentSlide = slideGroups[currentIndex];
    const nextSlide = slideGroups[currentIndex + 1];
    if (!nextSlide) return false;
    // Apply morph transition between slides with shared elements
    return (
      (currentSlide.slideType === 'case' && nextSlide.slideType === 'q_summary')
    );
  };

  return (
    <TransitionSeries>
      {slideGroups.map((slideGroup, index) => {
        // Intro needs extra breathing room so CTA + shine finish before transition
        const MIN_INTRO_DURATION = 320; // frames (~10.6s) keeps hero visible without long dead pause
        const baseDuration =
          slideGroup.slideType === 'intro'
            ? Math.max(slideGroup.durationInFrames, MIN_INTRO_DURATION)
            : slideGroup.durationInFrames;

        // Add breathing pause; cases get extra padding
        const isFeedbackSlide = slideGroup.slideType === 'feedback_blocks';
        const pauseFrames =
          isFeedbackSlide
            ? FEEDBACK_TO_THINKING_PAUSE
            : BREATHING_PAUSE + (slideGroup.slideType === 'case' ? CASE_EXTRA_PAUSE : 0);
        let slideWithPause = baseDuration + pauseFrames;
        if (isFeedbackSlide) {
          slideWithPause = Math.min(slideWithPause, FEEDBACK_SLIDE_CAP_FRAMES);
        }
        
        return (
          <>
            <TransitionSeries.Sequence
              key={slideGroup.id}
              durationInFrames={slideWithPause}
            >
              {renderSlide(slideGroup)}
            </TransitionSeries.Sequence>
            {shouldTransition(index) && (
              <TransitionSeries.Transition
                key={`transition-${slideGroup.id}`}
                presentation={morphPresentation()}
                timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
              />
            )}
          </>
        );
      })}
    </TransitionSeries>
  );
};
