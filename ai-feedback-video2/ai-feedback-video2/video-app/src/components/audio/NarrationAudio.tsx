import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';

interface NarrationAudioProps {
  audioFile: string;
  startFrame: number;
  volume?: number;
  enabled?: boolean;
}

/**
 * Component to play narration audio synchronized with animations
 * Non-invasive: doesn't affect visual layout
 */
export const NarrationAudio: React.FC<NarrationAudioProps> = ({
  audioFile,
  startFrame,
  volume = 1.0,
  enabled = true,
}) => {
  if (!enabled || !audioFile) {
    return null;
  }

  try {
    return (
      <Sequence from={startFrame}>
        <Audio
          src={staticFile(audioFile)}
          startFrom={0}
          volume={volume}
        />
      </Sequence>
    );
  } catch {
    console.warn(`Audio file not found: ${audioFile}`);
    return null;
  }
};
