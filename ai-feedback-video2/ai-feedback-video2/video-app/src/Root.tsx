import './index.css';
import { Composition } from 'remotion';
import { FullVideo, fullVideoDurationInFrames } from './compositions/FullVideo';
import { VIDEO_CONFIG } from './lib/config';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FullVideo"
        component={FullVideo}
        durationInFrames={fullVideoDurationInFrames}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
      />
    </>
  );
};
