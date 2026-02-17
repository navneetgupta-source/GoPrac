import { useMemo } from 'react';
import { KeywordSpec } from '../types/manifest';
import { AudioTiming } from '../types/timings';
import { useKeywordHighlight } from './useKeywordHighlight';

type Segment = {
  text: string;
  isActive: boolean;
  isKeyword: boolean;
};

export const useHighlightedParagraph = (
  text: string,
  timing?: AudioTiming,
  keywords: KeywordSpec[] = [],
) => {
  const wordHighlights = useKeywordHighlight(timing, keywords);

  return useMemo<Segment[]>(() => {
    if (!timing || wordHighlights.length === 0) {
      return [{ text, isActive: false, isKeyword: false }];
    }

    const rawWords = text.split(/\s+/);
    return rawWords.map((word, index) => {
      const highlight = wordHighlights[index];
      return {
        text: word,
        isActive: highlight?.isActive ?? false,
        isKeyword: highlight?.isKeyword ?? false,
      };
    });
  }, [text, timing, wordHighlights]);
};
