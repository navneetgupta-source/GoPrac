import { TransitionPresentation } from '@remotion/transitions';
import { interpolate, Easing } from 'remotion';

/**
 * Highly optimized smooth morph transition
 * Uses easing curves for natural, polished motion
 */
export const morphPresentation = (): TransitionPresentation<Record<string, unknown>> => {
  return {
    component: ({ children, presentationDirection, presentationProgress }) => {
      const isEntering = presentationDirection === 'entering';
      const progress = presentationProgress;
      
      if (isEntering) {
        // Entering slide: smooth fade in with gentle scale
        const opacity = interpolate(
          progress, 
          [0, 0.4], 
          [0, 1], 
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smooth ease-out
          }
        );
        
        const scale = interpolate(
          progress, 
          [0, 0.5], 
          [0.98, 1], 
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.34, 1.56, 0.64, 1), // Gentle bounce
          }
        );

        return (
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              willChange: 'transform, opacity',
            }}
          >
            {children}
          </div>
        );
      } else {
        // Exiting slide: smooth fade out
        const opacity = interpolate(
          progress, 
          [0.5, 1], 
          [1, 0], 
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.42, 0, 0.58, 1), // Smooth ease-in
          }
        );
        
        const scale = interpolate(
          progress, 
          [0.5, 1], 
          [1, 1.02], 
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.42, 0, 1, 1), // Ease-in
          }
        );

        return (
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              willChange: 'transform, opacity',
            }}
          >
            {children}
          </div>
        );
      }
    },
    props: {},
  };
};
