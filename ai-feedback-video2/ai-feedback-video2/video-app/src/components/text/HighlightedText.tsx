import { CSSProperties } from 'react';
import { useCurrentFrame } from 'remotion';
import { PALETTE } from '../../lib/config';
import { HighlightStyle } from '../../types/choreography';

type HighlightedTextProps = {
  text: string;
  keywords?: string[];
  wordTimings?: Array<{ word: string; startFrame: number; endFrame: number }>;
  style?: CSSProperties;
  highlightStyle?: HighlightStyle;
  color?: string;
};

/**
 * Component that highlights keywords as they're spoken in the narration
 */
export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  keywords = [],
  wordTimings = [],
  style,
  highlightStyle = 'underline',
  color = PALETTE.azure,
}) => {
  const frame = useCurrentFrame();

  // Normalize text for matching - remove punctuation and lowercase
  const normalizeForMatch = (str: string) => 
    str.toLowerCase().replace(/[.,!?;:]/g, '').trim();

  // Create a set of normalized keywords
  const normalizedKeywords = new Set(
    keywords.map((k) => normalizeForMatch(k))
  );

  // Split text into words while preserving spaces and punctuation
  const words = text.split(/(\s+)/);

  return (
    <span style={style}>
      {words.map((word, index) => {
        if (!word.trim()) {
          // Preserve whitespace
          return <span key={index}>{word}</span>;
        }

        const cleanWord = normalizeForMatch(word);
        
        // Check if this word is a keyword or part of a keyword phrase
        const isKeyword = normalizedKeywords.has(cleanWord) || 
          Array.from(normalizedKeywords).some(kw => 
            kw.includes(cleanWord) || cleanWord.includes(kw)
          );
        
        // Find timing for this word (match without punctuation)
        const timing = wordTimings.find(
          (t) => normalizeForMatch(t.word) === cleanWord
        );
        
        const isActive = timing 
          ? frame >= timing.startFrame && frame <= timing.endFrame
          : false;

        // Highlight style when word is being spoken AND is a keyword
        const highlightStyleObj: CSSProperties = isActive && isKeyword
          ? getHighlightStyle(highlightStyle, color)
          : {};

        return (
          <span key={index} style={highlightStyleObj}>
            {word}
          </span>
        );
      })}
    </span>
  );
};

const getHighlightStyle = (style: HighlightStyle, color: string): CSSProperties => {
  switch (style) {
    case 'background':
      return {
        backgroundColor: color,
        borderRadius: 4,
        padding: '0 4px',
        transition: 'background-color 120ms ease',
      };
    case 'underline':
      return {
        borderBottom: `3px solid ${color}`,
        transition: 'border-bottom 120ms ease',
      };
    case 'bold':
      return {
        fontWeight: 800,
        color,
        transition: 'all 120ms ease',
      };
    case 'color':
      return {
        color,
        transition: 'color 120ms ease',
      };
    case 'none':
    default:
      return {};
  }
};
