import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimationBlock, AnimationType, SlideChoreography } from '../types/choreography';

export interface AnimationState {
  isVisible: boolean;
  opacity: number;
  transform: string;
}

/**
 * Calculate animation state based on current frame and animation config
 */
const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export const useAnimationState = (
  animation: AnimationBlock | undefined,
  childIndex?: number
): AnimationState => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  if (!animation) {
    return {
      isVisible: true,
      opacity: 1,
      transform: 'none',
    };
  }

  const { 
    startFrame, 
    durationFrames, 
    stagger = 0, 
    delay = 0, 
    easing = 'easeOut', 
    useSpring = false, 
    springConfig 
  } = animation;
  const resolvedType = normalizeAnimationType(animation);
  const actualStartFrame =
    startFrame + delay + (childIndex !== undefined ? childIndex * stagger : 0);
  const endFrame = actualStartFrame + durationFrames;

  // Not started yet
  if (frame < actualStartFrame) {
    return {
      isVisible: false,
      opacity: 0,
      transform: getInitialTransform(resolvedType),
    };
  }

  // Animation complete
  if (frame >= endFrame) {
    return {
      isVisible: true,
      opacity: 1,
      transform: 'none',
    };
  }

  // Currently animating
  const localFrame = frame - actualStartFrame;
  const linearProgress = clamp01(localFrame / durationFrames);
  const shouldUseSpring = useSpring || easing === 'spring';
  const easedProgress = shouldUseSpring
    ? getSpringProgress(localFrame, durationFrames, fps, springConfig)
    : applyEasing(linearProgress, easing);

  return {
    isVisible: true,
    opacity: easedProgress,
    transform: getAnimationTransform(resolvedType, easedProgress),
  };
};

/**
 * Get initial transform for animation type
 */
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
    case 'none':
    default:
      return 'none';
  }
};

/**
 * Get transform at current progress
 */
const getAnimationTransform = (
  type: AnimationType,
  progress: number
): string => {
  const inverseProgress = 1 - progress;
  
  switch (type) {
    case 'slideFromLeft':
      return `translate3d(${-100 * inverseProgress}%, 0, 0)`;
    case 'slideFromRight':
      return `translate3d(${100 * inverseProgress}%, 0, 0)`;
    case 'slideFromTop':
      return `translate3d(0, ${-100 * inverseProgress}%, 0)`;
    case 'slideFromBottom':
      return `translate3d(0, ${100 * inverseProgress}%, 0)`;
    case 'scale':
      return `scale(${0.8 + 0.2 * progress})`;
    case 'fade':
    case 'none':
    default:
      return 'none';
  }
};

/**
 * Apply easing function to linear progress
 */
const applyEasing = (
  progress: number,
  easing: AnimationBlock['easing']
): number => {
  switch (easing) {
    case 'easeIn':
      return progress * progress;
    case 'easeOut':
      return 1 - Math.pow(1 - progress, 2);
    case 'easeInOut':
      return progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    case 'spring':
      // Fallback spring behavior if config missing; treat as easeOut
      return 1 - Math.pow(1 - progress, 2);
    case 'linear':
    default:
      return progress;
  }
};

const getSpringProgress = (
  localFrame: number,
  durationFrames: number,
  fps: number,
  config?: AnimationBlock['springConfig']
): number => {
  const springValue = spring({
    frame: localFrame,
    fps,
    durationInFrames: durationFrames,
    from: 0,
    to: 1,
    config: {
      damping: config?.damping ?? 16,
      mass: config?.mass ?? 0.9,
      stiffness: config?.stiffness ?? 120,
    },
  });
  return clamp01(springValue);
};

const normalizeAnimationType = (animation?: AnimationBlock): AnimationType => {
  if (!animation) return 'none';
  if (animation.animationType) return animation.animationType;
  switch (animation.type) {
    case 'fadeIn':
    case 'fade':
      return 'fade';
    case 'slideInLeft':
      return 'slideFromLeft';
    case 'slideInRight':
      return 'slideFromRight';
    case 'slideInTop':
      return 'slideFromTop';
    case 'slideInBottom':
      return 'slideFromBottom';
    case 'scaleIn':
    case 'scale':
      return 'scale';
    default:
      return 'none';
  }
};

/**
 * Hook to get choreography data for a slide
 */
export const useSlideChoreography = (slideId?: string): SlideChoreography | null => {
  if (!slideId) return null;
  try {
    // Dynamic import based on slideId
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const choreography = require(`../data/choreography/${slideId}.json`);
    return choreography as SlideChoreography;
  } catch {
    console.warn(`No choreography found for slide: ${slideId}`);
    return null;
  }
};
