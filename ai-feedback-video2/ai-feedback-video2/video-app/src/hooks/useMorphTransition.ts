import { useCurrentFrame, interpolate } from 'remotion';
import { MorphTransitionConfig } from '../types/morph';

/**
 * Hook to calculate morph animation state
 * Returns transform properties for morphing elements between slides
 */
export const useMorphTransition = (
  config: MorphTransitionConfig | null,
  triggerFrame: number,
  mode: 'exit' | 'enter' = 'enter'
) => {
  const frame = useCurrentFrame();
  
  if (!config) {
    return {
      isMorphing: false,
      getMorphStyle: () => ({}),
    };
  }

  const { durationFrames, easing = 'easeInOut' } = config;
  const relativeFrame = frame - triggerFrame;
  const isMorphing = relativeFrame >= 0 && relativeFrame < durationFrames;

  const getMorphStyle = (elementId: string): React.CSSProperties => {
    const element = config.elements.find((el) => el.elementId === elementId);
    if (!element || !isMorphing) {
      return {};
    }

    const progress = Math.min(1, Math.max(0, relativeFrame / durationFrames));
    const easedProgress = applyEasing(progress, easing);

    const { fromBounds, toBounds, fromStyle = {}, toStyle = {} } = element;

    // For exit mode, morph FROM current position TO next position
    // For enter mode, morph FROM previous position TO current position
    const startBounds = mode === 'exit' ? fromBounds : fromBounds;
    const endBounds = mode === 'exit' ? toBounds : toBounds;

    // Interpolate position and size
    const x = interpolate(easedProgress, [0, 1], [startBounds.x, endBounds.x]);
    const y = interpolate(easedProgress, [0, 1], [startBounds.y, endBounds.y]);
    const width = interpolate(easedProgress, [0, 1], [startBounds.width, endBounds.width]);
    const height = interpolate(easedProgress, [0, 1], [startBounds.height, endBounds.height]);

    // Interpolate opacity
    const fromOpacity = typeof fromStyle.opacity === 'number' ? fromStyle.opacity : 1;
    const toOpacity = typeof toStyle.opacity === 'number' ? toStyle.opacity : 1;
    const opacity = interpolate(easedProgress, [0, 1], [fromOpacity, toOpacity]);

    return {
      position: 'absolute' as const,
      left: x,
      top: y,
      width: width,
      height: height,
      opacity,
      transformOrigin: 'top left',
      transition: 'none',
      overflow: 'hidden',
    };
  };

  return {
    isMorphing,
    getMorphStyle,
    morphProgress: isMorphing ? (frame - triggerFrame) / durationFrames : 0,
  };
};

/**
 * Apply easing function to linear progress
 */
const applyEasing = (
  progress: number,
  easing: MorphTransitionConfig['easing']
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
    case 'linear':
    default:
      return progress;
  }
};
