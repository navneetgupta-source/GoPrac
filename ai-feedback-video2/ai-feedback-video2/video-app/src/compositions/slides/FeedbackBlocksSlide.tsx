import { CSSProperties } from 'react';
import { useCurrentFrame } from 'remotion';
import { SlideShell } from '../../components/layout/SlideShell';
import { QuestionData } from '../../types/content';
import { PALETTE } from '../../lib/config';
import { NarrationAudio } from '../../components/audio/NarrationAudio';
import { useSlideChoreography } from '../../hooks/useChoreography';
import { BlockHighlight, SlideChoreography } from '../../types/choreography';
import { HighlightedText } from '../../components/text/HighlightedText';
import { getManifestEvents } from '../../lib/loadData';

type FeedbackBlocksSlideProps = {
  caseTitle: string;
  question: QuestionData;
};

const BASE_HEADING_SIZE = 38; // Larger heading
const BASE_BULLET_SIZE = 35; // Larger for 3-item lists

const blockStyle: CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: 32,
  padding: 48,
  minHeight: 720,
  width: 'calc(50% - 36px)',
};

const headingStyle: CSSProperties = {
  fontWeight: 800,
  letterSpacing: 1,
  marginBottom: 18,
  color: '#000000',
  borderBottom: '3px solid #000000',
  display: 'inline-block',
  paddingBottom: 6,
};

export const FeedbackBlocksSlide: React.FC<FeedbackBlocksSlideProps> = ({
  caseTitle,
  question,
}) => {
  const choreography = useSlideChoreography('q1_feedback');
  const frame = useCurrentFrame();
  const wordTimings = choreography?.narration?.wordTimings || [];
  
  // Get keywords from manifest for highlighting
  const manifestEvents = getManifestEvents();
  const feedbackEvent = manifestEvents.find(e => e.slide_type === 'feedback_blocks');
  const keywords = (feedbackEvent?.narration?.keywords || []).map(k => typeof k === 'string' ? k : k.text);
  
  // Simple font sizing
  const rightFontSize = BASE_BULLET_SIZE;
  const wrongFontSize = BASE_BULLET_SIZE;

  const getHighlight = (blockId: string): BlockHighlight | undefined => {
    if (!choreography?.highlights) return undefined;
    return (choreography as SlideChoreography).highlights?.find((h) => h.blockId === blockId);
  };
  
  const deriveSegments = (
    highlight: BlockHighlight | undefined,
    totalItems: number,
  ) => {
    if (!highlight || totalItems <= 0) return [];
    const hydrated = (highlight.segments || [])
      .filter(
        (segment): segment is { startFrame: number; endFrame: number } =>
          typeof segment?.startFrame === 'number' && typeof segment?.endFrame === 'number',
      )
      .slice(0, totalItems);
    if (hydrated.length >= totalItems) {
      return hydrated;
    }
    const blockStart = highlight.startFrame ?? hydrated[0]?.startFrame ?? 0;
    const blockEnd = highlight.endFrame ?? Math.max(blockStart + totalItems * 24, blockStart + 1);
    const slot = Math.max((blockEnd - blockStart) / totalItems, 1);
    const segments = [...hydrated];
    for (let idx = hydrated.length; idx < totalItems; idx += 1) {
      const segStart = Math.round(blockStart + slot * idx);
      const segEnd = Math.round(
        idx === totalItems - 1 ? blockEnd : Math.min(segStart + slot, blockEnd),
      );
      segments.push({ startFrame: segStart, endFrame: segEnd });
    }
    return segments;
  };

  const rightHighlight = getHighlight('right_box');
  const wrongHighlight = getHighlight('wrong_box');
  // Use highlight segments directly for bullet timing (one segment per bullet)
  const rightSegments = rightHighlight?.segments?.length === question.what_went_right.length
    ? rightHighlight.segments
    : deriveSegments(rightHighlight, question.what_went_right.length);
  const wrongSegments = wrongHighlight?.segments?.length === question.what_went_wrong.length
    ? wrongHighlight.segments
    : deriveSegments(wrongHighlight, question.what_went_wrong.length);
  const rightActiveStart = rightHighlight?.startFrame ?? 0;
  const rightActiveEndRaw = rightHighlight?.endFrame ?? Number.MAX_SAFE_INTEGER;
  const BULLET_FADE_FRAMES = 6;
  const BULLET_LEAD_FRAMES = 12; // show bullets well before the ordinal completes
  const ORDINAL_LOOKBACK_FRAMES = 72; // allow a wider pickup window for the "missed" handoff

  const buildBlockEntrance = (startFrame: number | undefined, direction: 'left' | 'right') => {
    const appearFrame = startFrame ?? 0;
    const progress = Math.min(Math.max((frame - appearFrame) / 14, 0), 1);
    const delta = (1 - progress) * 28 * (direction === 'left' ? -1 : 1);
    return {
      opacity: progress,
      transform: progress >= 1 ? 'none' : `translateX(${delta}px)`,
      visibility: frame < appearFrame ? 'hidden' : 'visible',
    } as CSSProperties;
  };

  const getBulletState = (
    segment: { startFrame: number; endFrame: number } | undefined,
    index: number,
    segments: Array<{ startFrame: number; endFrame: number }>,
  ): { isVisible: boolean; isHighlighted: boolean; opacity: number } => {
    if (!segment) return { isVisible: false, isHighlighted: false, opacity: 0 };
    const appearFrame = segment.startFrame;
    // Only show this bullet if its narration has started
    // Previous bullets remain visible
    let isVisible = false;
    if (frame >= appearFrame) {
      isVisible = true;
    } else if (index > 0 && frame >= segments[index - 1].startFrame) {
      // Previous bullet remains visible
      isVisible = true;
    }
    const isHighlighted = frame >= appearFrame && frame < segment.endFrame;
    let opacity = 1;
    if (frame < appearFrame + BULLET_FADE_FRAMES) {
      opacity = Math.min(Math.max((frame - appearFrame) / BULLET_FADE_FRAMES, 0), 1);
    }
    return { isVisible, isHighlighted, opacity };
  };

  const normalizeToken = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

  const findWindow = (
    tokens: string[],
    phraseTokens: string[],
    startIdx: number,
    maxGap = 3,
  ): { start: number; end: number } | null => {
    if (!phraseTokens.length) return null;
    let i = startIdx;
    while (i < tokens.length) {
      if (tokens[i] !== phraseTokens[0]) {
        i += 1;
        continue;
      }
      let j = 0;
      let k = i;
      let lastMatch = i;
      while (k < tokens.length && j < phraseTokens.length) {
        if (tokens[k] === phraseTokens[j]) {
          lastMatch = k;
          j += 1;
        } else if ((k - lastMatch) > maxGap) {
          break;
        }
        k += 1;
      }
      if (j === phraseTokens.length) {
        return { start: i, end: lastMatch };
      }
      i += 1;
    }
    return null;
  };

  const ordinalTokens = ['first', 'second', 'third', 'fourth', 'fifth', 'one', 'two', 'three', 'four', 'five'];

  const findFirstTokenFrame = (token: string, minFrame: number) => {
    const norm = normalizeToken(token);
    const match = wordTimings.find((w) => normalizeToken(w.word) === norm && w.startFrame >= minFrame);
    return match?.startFrame;
  };

  // Keep the wrong block dormant until its highlight window starts to avoid pre-empting the right block
  // Anchor the "what went wrong" entrance to the narration phrase to avoid pre-empting the right block
  const narrationTokens = wordTimings.map((w) => normalizeToken(w.word));
  const wrongCueWindow = findWindow(
    narrationTokens,
    ['now', 'lets', 'see', 'what', 'went', 'wrong'],
    0,
  );
  const wrongCueFrame = wrongCueWindow?.start !== undefined
    ? wordTimings[wrongCueWindow.start]?.startFrame
    : findFirstTokenFrame('wrong', 0);
  const wrongEntranceFrame = wrongCueFrame !== undefined
    ? Math.max(wrongCueFrame - 6, 0)
    : wrongHighlight?.startFrame ?? 0;
  const wrongActiveStart = Math.max(wrongEntranceFrame, wrongHighlight?.startFrame ?? 0);
  const wrongActiveEnd = wrongHighlight?.endFrame ?? Number.MAX_SAFE_INTEGER;
  const isWrongActive = frame >= wrongActiveStart && frame < wrongActiveEnd;
  // Keep right block active until just before wrong block entrance to avoid early drop-off
  const rightActiveEnd = Math.max(rightActiveEndRaw, wrongActiveStart - 6);
  const isRightActive = frame >= rightActiveStart && frame < rightActiveEnd;

  const collectOrdinalAnchors = (blockStart: number | undefined) => {
    const anchors: number[] = [];
    const startGate = Math.max((blockStart ?? 0) - ORDINAL_LOOKBACK_FRAMES, 0);
    for (const word of wordTimings) {
      if (word.startFrame < startGate) continue;
      const token = normalizeToken(word.word);
      if (ordinalTokens.includes(token)) {
        anchors.push(word.startFrame);
        if (anchors.length >= 5) break;
      }
    }
    return anchors;
  };

  const buildSegmentsFromOrdinals = (
    items: string[],
    fallbackSegments: Array<{ startFrame: number; endFrame: number }>,
    blockStart: number | undefined,
    introCueFrame?: number,
    leadFrames = BULLET_LEAD_FRAMES,
  ) => {
    const anchors = collectOrdinalAnchors(blockStart);
    const segments: { startFrame: number; endFrame: number }[] = [];
    for (let idx = 0; idx < items.length; idx += 1) {
      let startFrame;
      if (wordTimings.length > 0) {
        // For each bullet, use the startFrame of the first word in its phrase
        const phrase = items[idx];
        const firstWord = phrase.split(' ')[0];
        const normFirstWord = normalizeToken(firstWord);
        const match = wordTimings.find((w) => normalizeToken(w.word) === normFirstWord);
        startFrame = match?.startFrame ?? fallbackSegments[idx]?.startFrame ?? 0;
      } else if (anchors[idx] !== undefined) {
        startFrame = Math.max(anchors[idx] - leadFrames, 0);
      } else {
        startFrame = fallbackSegments[idx]?.startFrame ?? 0;
      }
      const adjustedStart =
        idx === 0 && introCueFrame !== undefined
          ? Math.max(startFrame, introCueFrame)
          : startFrame;
      const nextStart = anchors[idx + 1] !== undefined ? anchors[idx + 1] - leadFrames : undefined;
      const fallbackEnd = fallbackSegments[idx]?.endFrame ?? adjustedStart + 30;
      const endFrame =
        nextStart !== undefined
          ? Math.max(Math.min(nextStart - 2, fallbackEnd), adjustedStart + 6)
          : Math.max(fallbackEnd, adjustedStart + 12);
      segments.push({ startFrame: adjustedStart, endFrame });
    }
    return segments;
  };

  // For feedback blocks, use the highlight segments directly for bullet timing
  const findAnchorsForWords = (words: string[], start: number, end: number | undefined) => {
    const anchors: number[] = [];
    const targets = words.map(normalizeToken);
    let targetIdx = 0;
    for (const w of wordTimings) {
      if (w.startFrame < start) continue;
      if (end !== undefined && w.startFrame > end) break;
      if (normalizeToken(w.word) === targets[targetIdx]) {
        anchors.push(w.startFrame);
        targetIdx += 1;
        if (targetIdx >= targets.length) break;
      }
    }
    return anchors;
  };

  const buildSegmentsFromAnchors = (
    items: string[],
    fallbackSegments: Array<{ startFrame: number; endFrame: number }>,
    anchors: number[],
  ) => {
    const segments: { startFrame: number; endFrame: number }[] = [];
    for (let idx = 0; idx < items.length; idx += 1) {
      const startFrame = anchors[idx] ?? fallbackSegments[idx]?.startFrame ?? 0;
      const nextStart = anchors[idx + 1] ?? fallbackSegments[idx + 1]?.startFrame;
      const fallbackEnd = fallbackSegments[idx]?.endFrame ?? startFrame + 30;
      const endFrame =
        nextStart !== undefined
          ? Math.max(Math.min(nextStart - 2, fallbackEnd), startFrame + 6)
          : Math.max(fallbackEnd, startFrame + 12);
      segments.push({ startFrame, endFrame });
    }
    return segments;
  };

  // Use ordinal words as anchor points for bullet timing
  const ordinalWords = ['first', 'second', 'third', 'fourth', 'fifth', 'one', 'two', 'three', 'four', 'five'];
  const findOrdinalsForBullets = (count: number, start: number, end: number | undefined) => {
    const anchors: number[] = [];
    let found = 0;
    for (const word of wordTimings) {
      if (word.startFrame < start) continue;
      if (end !== undefined && word.startFrame > end) break;
      if (ordinalWords.includes(normalizeToken(word.word))) {
        anchors.push(word.startFrame);
        found += 1;
        if (found >= count) break;
      }
    }
    return anchors;
  };

  const rightOrdinals = findOrdinalsForBullets(question.what_went_right.length, rightActiveStart, rightActiveEndRaw);
  const wrongOrdinals = findOrdinalsForBullets(question.what_went_wrong.length, wrongActiveStart, wrongActiveEnd);

  const rightBulletSegments = buildSegmentsFromAnchors(
    question.what_went_right,
    rightSegments,
    rightOrdinals,
  );
  const wrongBulletSegments = buildSegmentsFromAnchors(
    question.what_went_wrong,
    wrongSegments,
    wrongOrdinals,
  );

  // Extend the last "right" bullet so its highlight persists until the wrong block begins
  const rightBulletSegmentsExtended = rightBulletSegments.map((segment, idx) => {
    const isLast = idx === rightBulletSegments.length - 1;
    if (!isLast) return segment;
    const targetEnd = Math.max(segment.endFrame, wrongActiveStart - 4);
    return { ...segment, endFrame: targetEnd };
  });

  return (
    <SlideShell title={caseTitle} slideId="feedback_blocks_slide">
      {/* Narration Audio Layer - Non-invasive */}
      {choreography?.narration && (
        <NarrationAudio
          audioFile={choreography.narration.audioFile}
          startFrame={choreography.narration.startFrame}
          enabled={true}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 32 }}>
          {/* WHAT WENT RIGHT Block */}
          <div
            style={{
              ...blockStyle,
              backgroundColor: isRightActive ? 'rgba(255,243,176,0.9)' : blockStyle.backgroundColor,
              border: isRightActive ? `3px solid ${PALETTE.darkAzure}` : 'none',
              ...buildBlockEntrance(rightHighlight?.startFrame, 'left'),
            }}
          >
            <div style={{...headingStyle, fontSize: BASE_HEADING_SIZE, color: PALETTE.textBlack}}>WHAT WENT RIGHT</div>
            
            {question.what_went_right.map((item, index) => {
              const state = getBulletState(rightBulletSegmentsExtended[index], index, rightBulletSegmentsExtended);
              const bulletStyle: CSSProperties = {
                fontSize: rightFontSize,
                color: PALETTE.textBlack,
                marginBottom: 18,
                lineHeight: 1.6,
                fontWeight: 600,
                visibility: state.isVisible ? 'visible' : 'hidden',
                opacity: state.opacity,
                backgroundColor: 'transparent',
                padding: 0,
                transition: 'opacity 160ms ease',
              };
              return (
                <div key={item} style={bulletStyle}>
                  •{' '}
                  <HighlightedText
                    text={item}
                    keywords={keywords}
                    wordTimings={choreography?.narration?.wordTimings}
                    highlightStyle="none"
                  />
                </div>
              );
            })}
          </div>

          {/* WHAT WENT WRONG Block */}
          <div
            style={{
              ...blockStyle,
              backgroundColor: isWrongActive ? 'rgba(255,243,176,0.9)' : blockStyle.backgroundColor,
              border: isWrongActive ? `3px solid ${PALETTE.darkAzure}` : 'none',
              ...buildBlockEntrance(wrongEntranceFrame, 'right'),
            }}
          >
            <div style={{...headingStyle, fontSize: BASE_HEADING_SIZE, color: PALETTE.textBlack}}>WHAT WENT WRONG</div>
            
            {question.what_went_wrong.map((item, index) => {
              const state = getBulletState(wrongBulletSegments[index], index, wrongBulletSegments);
              const bulletStyle: CSSProperties = {
                fontSize: wrongFontSize,
                color: PALETTE.textBlack,
                marginBottom: 18,
                lineHeight: 1.6,
                fontWeight: 600,
                visibility: state.isVisible ? 'visible' : 'hidden',
                opacity: state.opacity,
                backgroundColor: 'transparent',
                padding: 0,
                transition: 'opacity 160ms ease',
              };
              return (
                <div key={item} style={bulletStyle}>
                  •{' '}
                  <HighlightedText
                    text={item}
                    keywords={keywords}
                    wordTimings={choreography?.narration?.wordTimings}
                    highlightStyle="none"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SlideShell>
  );
};
