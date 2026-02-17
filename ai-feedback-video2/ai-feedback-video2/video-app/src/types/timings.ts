export interface WordTiming {
  text: string;
  start: number;
  end: number;
}

export interface AudioTiming {
  audio_file: string;
  durationSec: number;
  words: WordTiming[];
}

