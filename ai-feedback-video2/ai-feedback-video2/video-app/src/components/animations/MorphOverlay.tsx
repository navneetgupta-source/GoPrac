import { MorphElementConfig, MorphTransitionConfig } from '../../types/morph';
import { useMorphTransition } from '../../hooks/useMorphTransition';
import { CSSProperties, ReactNode } from 'react';

type MorphOverlayProps = {
  morphConfig: MorphTransitionConfig;
  triggerFrame: number;
  renderElement: (elementId: string) => ReactNode;
};

/**
 * Overlay layer that renders morphing elements on top of slides
 * This prevents layout disruption in the base slides
 */
export const MorphOverlay: React.FC<MorphOverlayProps> = ({
  morphConfig,
  triggerFrame,
  renderElement,
}) => {
  const { isMorphing, getMorphStyle } = useMorphTransition(morphConfig, triggerFrame, 'enter');

  if (!isMorphing) {
    return null;
  }

  const overlayContainer: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 999,
  };

  return (
    <div style={overlayContainer}>
      {morphConfig.elements.map((element: MorphElementConfig) => {
        const morphStyle = getMorphStyle(element.elementId);
        return (
          <div key={element.elementId} style={morphStyle}>
            {renderElement(element.elementId)}
          </div>
        );
      })}
    </div>
  );
};
