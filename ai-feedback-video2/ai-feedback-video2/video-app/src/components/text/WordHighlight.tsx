import React, { CSSProperties } from 'react';
import { useCurrentFrame } from 'remotion';
import { WordTiming, HighlightStyle } from '../../types/choreography';

interface WordHighlightProps {
  text: string;
  wordTimings: WordTiming[];
  audioStartFrame: number;
  style?: HighlightStyle;
  color?: string;
  baseStyle?: CSSProperties;
}

/**
 * Component that highlights words in sync with narration
 * Supports multiple highlighting styles without changing layout
 */
export const WordHighlight: React.FC<WordHighlightProps> = ({
  text,
  wordTimings,
  audioStartFrame,
  style = 'background',
  color = '#FFD700',
  baseStyle = {},
}) => {
  const frame = useCurrentFrame();
  
  // If no word timings, render plain text
  if (!wordTimings || wordTimings.length === 0) {
    return <div style={baseStyle}>{text}</div>;
  }

  // Calculate current frame relative to audio start
  const currentFrame = frame - audioStartFrame;

  // Find currently active word
  const activeWordIndex = wordTimings.findIndex(
    (word) => currentFrame >= word.startFrame && currentFrame <= word.endFrame
  );

  // Split text into words (simple approach for POC)
  const words = text.split(/(\s+)/);
  
  return (
    <div style={baseStyle}>
      {words.map((word, index) => {
        const isActive = index === activeWordIndex;
        const wordStyle = isActive ? getHighlightStyle(style, color) : {};
        
        return (
          <span key={index} style={wordStyle}>
            {word}
          </span>
        );
      })}
    </div>
  );
};

/**
 * Get highlight style based on selected style type
 */
const getHighlightStyle = (style: HighlightStyle, color: string): CSSProperties => {
  switch (style) {
    case 'background':
      return {
        backgroundColor: color,
        borderRadius: '4px',
        padding: '0 4px',
        transition: 'background-color 0.1s ease',
      };
    case 'underline':
      return {
        borderBottom: `3px solid ${color}`,
        transition: 'border-bottom 0.1s ease',
      };
    case 'bold':
      return {
        fontWeight: 800,
        color: color,
        transition: 'all 0.1s ease',
      };
    case 'color':
      return {
        color: color,
        transition: 'color 0.1s ease',
      };
    case 'none':
    default:
      return {};
  }
};
