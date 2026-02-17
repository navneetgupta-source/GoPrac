import { CSSProperties, useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { SlideShell } from '../../components/layout/SlideShell';
import { QuestionData } from '../../types/content';
import { PALETTE } from '../../lib/config';
import { NarrationAudio } from '../../components/audio/NarrationAudio';
import { useSlideChoreography } from '../../hooks/useChoreography';
import { BlockHighlight, SlideChoreography } from '../../types/choreography';
import { HighlightedText } from '../../components/text/HighlightedText';
import { getManifestEvents } from '../../lib/loadData';

type ThinkingStepsSlideProps = {
  caseTitle: string;
  question: QuestionData;
};

const gridTemplate = '1.1fr 1.45fr 1.45fr';

const BASE_HEADER_SIZE = 36;
const BASE_TEXT_SIZE = 26;

const columnHeaderStyle: CSSProperties = {
  borderRadius: 8,
  border: `3px solid ${PALETTE.darkAzure}`,
  padding: '22px 28px',
  fontWeight: 700,
  color: '#FFFFFF',
  textAlign: 'center',
  backgroundColor: PALETTE.darkAzure,
};

const rowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: gridTemplate,
  gap: 32,
  alignItems: 'stretch',
};

const rowCardStyle: CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: 14,
  padding: 36,
  lineHeight: 1.6,
  color: PALETTE.textBlack,
  fontWeight: 600,
  minHeight: 200,
  display: 'flex',
  alignItems: 'center',
  border: `3px solid ${PALETTE.darkAzure}`,
};

const headerRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: gridTemplate,
  gap: 32,
  marginBottom: 54,
};

export const ThinkingStepsSlide: React.FC<ThinkingStepsSlideProps> = ({
  caseTitle,
  question,
}) => {
  const choreography = useSlideChoreography('q1_thinking');
  const frame = useCurrentFrame();
  
  const manifestEvents = getManifestEvents();
  const thinkingEvent = manifestEvents.find(e => e.slide_type === 'thinking_steps');
  const keywords = (thinkingEvent?.narration?.keywords || []).map(k => typeof k === 'string' ? k : k.text);
  
  const getHighlight = (blockId: string): BlockHighlight | undefined => {
    if (!choreography?.highlights) return undefined;
    return (choreography as SlideChoreography).highlights?.find((h) => h.blockId === blockId);
  };

  const stepsHighlight = getHighlight('col_steps');
  const thoughtHighlight = getHighlight('col_thought');
  const adviceHighlight = getHighlight('col_advice');

  const isColumnWise = !Array.isArray(question.thinking_steps) && question.thinking_steps && typeof question.thinking_steps === 'object';
  const rowCount = isColumnWise
    ? Math.max(
        (typeof question.thinking_steps === 'object' && 'steps' in question.thinking_steps && Array.isArray((question.thinking_steps as { steps?: string[] }).steps)
          ? (question.thinking_steps as { steps?: string[] }).steps?.length || 0
          : 0),
        (typeof question.thinking_steps === 'object' && 'how_you_thought' in question.thinking_steps && Array.isArray((question.thinking_steps as { how_you_thought?: string[] }).how_you_thought)
          ? (question.thinking_steps as { how_you_thought?: string[] }).how_you_thought?.length || 0
          : 0),
        (typeof question.thinking_steps === 'object' && 'thinking_advice' in question.thinking_steps && Array.isArray((question.thinking_steps as { thinking_advice?: string[] }).thinking_advice)
          ? (question.thinking_steps as { thinking_advice?: string[] }).thinking_advice?.length || 0
          : 0)
      )
    : (question.thinking_steps?.length || 0);

  type SegmentWindow = { startFrame: number; endFrame: number; text?: string | null };

  const sanitizeSegments = (highlight?: BlockHighlight): SegmentWindow[] =>
    (highlight?.segments || [])
      .filter(
        (segment): segment is SegmentWindow =>
          typeof segment?.startFrame === 'number' && typeof segment?.endFrame === 'number',
      )
      .map((segment) => ({
        startFrame: segment.startFrame,
        endFrame: segment.endFrame,
        text: segment.text ?? null,
      }));

  const computeFallbackSegments = (
    highlight: BlockHighlight | undefined,
    total: number,
  ): SegmentWindow[] => {
    if (!highlight || total <= 0) return [];
    const sanitized = sanitizeSegments(highlight);
    if (sanitized.length >= total) {
      return sanitized.slice(0, total);
    }
    const blockStart = highlight.startFrame ?? sanitized[0]?.startFrame ?? 0;
    const blockEnd = highlight.endFrame ?? Math.max(blockStart + total * 30, blockStart + 1);
    const slot = Math.max((blockEnd - blockStart) / total, 1);
    const segments = [...sanitized];
    for (let idx = sanitized.length; idx < total; idx += 1) {
      const segStart = Math.round(blockStart + slot * idx);
      const segEnd = Math.round(idx === total - 1 ? blockEnd : Math.min(segStart + slot, blockEnd));
      segments.push({ startFrame: segStart, endFrame: segEnd, text: null });
    }
    return segments.slice(0, total);
  };

  const normalized = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
  const findFirstTokenFrame = (token: string, minFrame: number) => {
    const norm = normalized(token);
    const match = choreography?.narration?.wordTimings?.find(
      (w) => normalized(w.word) === norm && w.startFrame >= minFrame,
    );
    return match?.startFrame;
  };
  const findAnchorForText = (text: string, minFrame: number) => {
    const token = (text.split(/\s+/).find((t) => t.length > 4) ?? text).toLowerCase();
    return findFirstTokenFrame(token, minFrame);
  };

  const bucketSegmentsByLabel = (
    segments: SegmentWindow[],
    fallback: SegmentWindow[],
    labels: string[],
  ): SegmentWindow[][] =>
    labels.map((label, index) => {
      const target = normalized(label);
      const matches = target
        ? segments.filter((segment) => normalized(segment.text ?? '').includes(target))
        : [];
      if (matches.length) {
        return matches;
      }
      const fallbackSegment = fallback[index];
      return fallbackSegment ? [fallbackSegment] : [];
    });

  const stepTitles = isColumnWise
    ? (typeof question.thinking_steps === 'object' && !Array.isArray(question.thinking_steps) && 'steps' in question.thinking_steps
        ? (question.thinking_steps as { steps?: string[] }).steps || []
        : [])
    : (Array.isArray(question.thinking_steps)
        ? question.thinking_steps.map((step) => step.step_title)
        : []);
  
  type ThinkingStepsColumnWise = {
    steps?: string[];
    how_you_thought?: string[];
    thinking_advice?: string[];
  };

  const yourApproaches: string[] = isColumnWise
    ? (
        typeof question.thinking_steps === 'object' &&
        !Array.isArray(question.thinking_steps) &&
        'how_you_thought' in question.thinking_steps &&
        Array.isArray((question.thinking_steps as ThinkingStepsColumnWise).how_you_thought)
          ? (question.thinking_steps as ThinkingStepsColumnWise).how_you_thought || []
          : []
      )
    : (Array.isArray(question.thinking_steps)
        ? question.thinking_steps.map((step) => step.your_approach)
        : []);
        
  const ideals = isColumnWise
    ? (typeof question.thinking_steps === 'object' &&
        !Array.isArray(question.thinking_steps) &&
        'thinking_advice' in question.thinking_steps &&
        Array.isArray((question.thinking_steps as ThinkingStepsColumnWise).thinking_advice)
        ? (question.thinking_steps as ThinkingStepsColumnWise).thinking_advice
        : [])
    : (Array.isArray(question.thinking_steps)
        ? question.thinking_steps.map((step) => step.ideal)
        : []);

  const stepsBuckets = useMemo(() => {
    const rawSegments = sanitizeSegments(stepsHighlight);
    const fallbackSegments = computeFallbackSegments(stepsHighlight, rowCount);
    return bucketSegmentsByLabel(
      rawSegments,
      fallbackSegments,
      stepTitles,
    );
  }, [stepsHighlight, stepTitles, rowCount]);

  const thoughtBuckets = useMemo(
    () => computeFallbackSegments(thoughtHighlight, rowCount).map((segment) => [segment]),
    [thoughtHighlight, rowCount],
  );

  const adviceBuckets = useMemo(
    () => computeFallbackSegments(adviceHighlight, rowCount).map((segment) => [segment]),
    [adviceHighlight, rowCount],
  );

  // Get the column start frames (when "How You Thought:" and "Thinking Advice:" are spoken)
  const thoughtColumnStart = thoughtHighlight?.startFrame ?? 0;
  const adviceColumnStart = adviceHighlight?.startFrame ?? 0;

  type CellPresentation = {
    isVisible: boolean;
    isHighlighted: boolean;
  };

  /**
   * FIXED: Determine cell visibility based on:
   * 1. Column has been introduced (columnStartFrame)
   * 2. This specific row's segment has started
   */
  const getCellPresentation = (
    rowSegments: SegmentWindow[],
    columnStartFrame: number,
    rowIndex: number
  ): CellPresentation => {
    const firstSegment = rowSegments[0];
    
    if (!firstSegment) {
      return { isVisible: false, isHighlighted: false };
    }

    // Cell becomes visible when:
    // 1. The column has been introduced (frame >= columnStartFrame)
    // 2. AND this specific row's content is being narrated (frame >= firstSegment.startFrame)
    const isVisible = frame >= columnStartFrame && frame >= firstSegment.startFrame;
    
    // Cell is highlighted when actively being narrated
    const isHighlighted = rowSegments.some(
      (segment) => frame >= segment.startFrame && frame < segment.endFrame,
    );
    
    return { isVisible, isHighlighted };
  };

  const makeCellTextStyle = (state: CellPresentation): CSSProperties => ({
    visibility: state.isVisible ? 'visible' : 'hidden',
    transition: 'none',
  });

  const applyCardHighlight = (
    base: CSSProperties,
    state: CellPresentation,
  ): CSSProperties => ({
    ...base,
    backgroundColor: state.isHighlighted ? 'rgba(255,243,176,0.9)' : base.backgroundColor,
    border: state.isHighlighted ? `3px solid ${PALETTE.darkAzure}` : base.border,
  });

  // Remove the title and shift the table up for the last slide
  return (
    <SlideShell title="" slideId="thinking_steps_slide">
      {choreography?.narration && (
        <NarrationAudio
          audioFile={choreography.narration.audioFile}
          startFrame={choreography.narration.startFrame}
          enabled={true}
        />
      )}

      <div style={{ ...headerRowStyle, marginTop: 80, marginBottom: 54 }}>
        <div
          style={{ ...columnHeaderStyle, fontSize: BASE_HEADER_SIZE, textTransform: 'uppercase' }}
          data-morph-id="nav_thinking_steps"
        >
          THINKING STEPS
        </div>
        <div
          style={{ ...columnHeaderStyle, fontSize: BASE_HEADER_SIZE, textTransform: 'uppercase' }}
          data-morph-id="nav_how_thought"
        >
          HOW YOU THOUGHT
        </div>
        <div
          style={{ ...columnHeaderStyle, fontSize: BASE_HEADER_SIZE, textTransform: 'uppercase' }}
          data-morph-id="nav_thinking_advice"
        >
          THINKING ADVICE
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 80 }}>
        {Array.from({ length: rowCount }).map((_, index) => {
          const stepTitleSize = 35;
          const approachSize = BASE_TEXT_SIZE;
          const idealSize = BASE_TEXT_SIZE;
          
          const stepBucket = stepsBuckets[index] ?? [];
          const thoughtBucket = thoughtBuckets[index] ?? [];
          const adviceBucket = adviceBuckets[index] ?? [];
          
          // For steps column, use original logic (no column start constraint)
          const stepFirstSegment = stepBucket[0];
          const stepState: CellPresentation = stepFirstSegment
            ? {
                isVisible: frame >= stepFirstSegment.startFrame,
                isHighlighted: stepBucket.some(
                  (segment) => frame >= segment.startFrame && frame < segment.endFrame
                ),
              }
            : { isVisible: true, isHighlighted: false };

          // For thought and advice columns, use the new logic with column start frames
          const thoughtState = getCellPresentation(thoughtBucket, thoughtColumnStart, index);
          const adviceState = getCellPresentation(adviceBucket, adviceColumnStart, index);

          return (
            <div key={stepTitles[index] || index} style={rowStyle}>
              {/* Steps Column */}
              <div
                style={applyCardHighlight(
                  {
                    ...rowCardStyle,
                    fontSize: stepTitleSize,
                    fontWeight: 700,
                    textAlign: 'center',
                    justifyContent: 'center',
                  },
                  stepState,
                )}
              >
                <div style={{ width: '100%', ...makeCellTextStyle(stepState) }}>
                  <HighlightedText
                    text={stepTitles[index] || ''}
                    keywords={keywords}
                    wordTimings={choreography?.narration?.wordTimings}
                    highlightStyle="background"
                  />
                </div>
              </div>

              {/* How You Thought Column */}
              <div
                style={applyCardHighlight(
                  {
                    ...rowCardStyle,
                    fontSize: approachSize,
                  },
                  thoughtState,
                )}
              >
                <div style={{ width: '100%', ...makeCellTextStyle(thoughtState) }}>
                  <HighlightedText
                    text={yourApproaches[index] || ''}
                    keywords={keywords}
                    wordTimings={choreography?.narration?.wordTimings}
                    highlightStyle="none"
                  />
                </div>
              </div>

              {/* Thinking Advice Column */}
              <div
                style={applyCardHighlight(
                  {
                    ...rowCardStyle,
                    fontSize: idealSize,
                  },
                  adviceState,
                )}
              >
                <div style={{ width: '100%', ...makeCellTextStyle(adviceState) }}>
                  <HighlightedText
                    text={(ideals?.[index] ?? '')}
                    keywords={keywords}
                    wordTimings={choreography?.narration?.wordTimings}
                    highlightStyle="none"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SlideShell>
  );
};
