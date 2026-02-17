import { CSSProperties, ReactNode } from 'react';
import { PALETTE } from '../../lib/config';
import { BackgroundCanvas } from './BackgroundCanvas';
import { AnimatedBlock } from '../animations/AnimatedBlock';
import { useSlideChoreography } from '../../hooks/useChoreography';
import { AnimationBlock } from '../../types/choreography';

type SlideShellProps = {
  title?: string;
  children: ReactNode;
  slideId?: string;
};

const innerStyle: CSSProperties = {
  padding: '0 60px 60px 60px',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  boxSizing: 'border-box',
};

const headerStyle: CSSProperties = {
  backgroundColor: PALETTE.darkAzure,
  color: '#fdfefe',
  borderRadius: '0 0 52px 52px',
  padding: '26px 0',
  fontSize: 54, // Restored to original for better fit
  fontWeight: 600,
  textAlign: 'center',
  margin: '0 0 36px 0',
  letterSpacing: 1,
  alignSelf: 'stretch',
};

export const SlideShell: React.FC<SlideShellProps> = ({ title, children, slideId }) => {
  const choreography = useSlideChoreography(slideId);
  const titleAnimation = choreography?.animations?.find(
    (anim: AnimationBlock) => anim.blockId === 'slide_title'
  );
  
  return (
    <BackgroundCanvas>
      <div style={innerStyle}>
        {title ? (
          <AnimatedBlock animation={titleAnimation}>
            <div style={headerStyle}>{title}</div>
          </AnimatedBlock>
        ) : null}
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </BackgroundCanvas>
  );
};
