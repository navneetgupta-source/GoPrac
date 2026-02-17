import "./index.css";
// import { Composition } from 'remotion';
import { Player } from "@remotion/player";
import { FullVideo, fullVideoDurationInFrames } from "./compositions/FullVideo";
import { VIDEO_CONFIG } from "./lib/config";

export const VideoPlayer: React.FC = () => {
  return (
    <>
      <Player
        component={FullVideo}
        durationInFrames={120}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={30}
        style={{
          width: 1280,
          height: 720,
        }}
      />
    </>
  );
};
