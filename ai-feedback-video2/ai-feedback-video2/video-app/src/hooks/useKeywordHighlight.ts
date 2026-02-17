import { useCurrentFrame, useVideoConfig } from 'remotion';
import { KeywordSpec } from '../types/manifest';
import { AudioTiming } from '../types/timings';
import { secToFrames } from '../lib/time';

const normalize = (value?: string) => (value ?? '').trim().toLowerCase();

export const useKeywordHighlight = (
  timing?: AudioTiming,
  keywords: KeywordSpec[] = [],
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!timing) {
    return [];
  }

  const keywordSet = new Set(keywords.map((k) => normalize(k.text)).filter(Boolean));

  return timing.words.map((word) => {
    const startFrame = secToFrames(word.start, fps);
    const endFrame = secToFrames(word.end, fps);
    const isActive = frame >= startFrame && frame <= endFrame;
    const isKeyword = keywordSet.has(normalize(word.text));
    return {
      text: word.text,
      startFrame,
      endFrame,
      isActive,
      isKeyword,
    };
  });
};
