import { AbsoluteFill, Img, staticFile } from 'remotion';
import { CSSProperties, ReactNode } from 'react';
import { PALETTE } from '../../lib/config';

type BackgroundCanvasProps = {
  children: ReactNode;
};

const baseStyle: CSSProperties = {
  backgroundImage: `linear-gradient(135deg, ${PALETTE.backgroundStart}, ${PALETTE.backgroundEnd})`,
  position: 'relative',
  overflow: 'hidden',
};

const overlayStyle = (options: Partial<CSSProperties>): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  pointerEvents: 'none',
  ...options,
});

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({ children }) => {
  return (
    <AbsoluteFill style={baseStyle}>
      <Img
        src={staticFile('backgrounds/gradient-full.png')}
        style={overlayStyle({ opacity: 0.35 })}
      />
      <Img
        src={staticFile('backgrounds/gradient-half.png')}
        style={overlayStyle({
          opacity: 0.45,
          transform: 'scale(1.2)',
          mixBlendMode: 'multiply',
        })}
      />
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>{children}</div>
    </AbsoluteFill>
  );
};

