import React, { CSSProperties, ReactNode } from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { useAnimationState } from '../../hooks/useChoreography';
import { AnimationBlock } from '../../types/choreography';

interface AnimatedBlockProps {
  animation: AnimationBlock | undefined;
  children: ReactNode;
  childIndex?: number;
  style?: CSSProperties;
  className?: string;
  // Narrative highlight support
  highlightStart?: number;
  highlightEnd?: number;
  highlightColor?: string;
}

/**
 * Wrapper component that applies choreographed animations to children
 * Non-invasive: preserves all original styling and layout
 * Supports narrative highlighting with animated glow pulse
 */
export const AnimatedBlock: React.FC<AnimatedBlockProps> = ({
  animation,
  children,
  childIndex,
  style = {},
  className,
  highlightStart,
  highlightEnd,
  highlightColor = '#A7D8FF', // Light blue by default
}) => {
  const frame = useCurrentFrame();
  const animationState = useAnimationState(animation, childIndex);

  // Calculate highlight state
  const isHighlighted = highlightStart !== undefined && highlightEnd !== undefined 
    && frame >= highlightStart && frame <= highlightEnd;

  let highlightOpacity = 0;
  let scaleBoost = 1;
  let ringWidth = 0;

  if (isHighlighted && highlightStart !== undefined && highlightEnd !== undefined) {
    // Static highlight (no fade in/out)
    highlightOpacity = 1;
    scaleBoost = 1.01;
  }

  // If no animation config, render with potential highlight
  if (!animation) {
      // Use full background highlight instead of border
      const highlightBg = isHighlighted
        ? {
            ...style,
            backgroundColor: `rgba(255,243,176,${highlightOpacity})`,
            transform: `scale(${scaleBoost})`,
            transition: 'none',
            willChange: 'background, filter, transform',
          }
        : style;

      if (style && Object.keys(style).length > 0) {
        return <div style={highlightBg} className={className}>{children}</div>;
      }
      return <>{children}</>;
  }

  const animatedStyle: CSSProperties = {
    ...style,
    opacity: animationState.opacity,
    transform: buildTransform(animationState.transform, scaleBoost),
      // Add highlight background effect
      ...(isHighlighted && {
        backgroundColor: `rgba(255,243,176,${highlightOpacity})`,
      }),
    // Ensure smooth transitions
    willChange: 'opacity, transform, box-shadow, border, filter',
  };

  return (
    <div style={animatedStyle} className={className}>
      {children}
    </div>
  );
};

const buildTransform = (baseTransform: string, scaleBoost: number): string => {
  const normalizedBase = baseTransform === 'none' ? '' : baseTransform;
  const scalePart = scaleBoost !== 1 ? ` scale(${scaleBoost})` : '';
  const combined = `${normalizedBase}${scalePart}`.trim();
  return `${combined || ''} translateZ(0)`.trim();
};
