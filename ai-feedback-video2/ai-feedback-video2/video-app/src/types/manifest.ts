export type SlideType =
  | 'intro'
  | 'case'
  | 'q_summary'
  | 'thinking_steps'
  | 'feedback_blocks';

export type AnimationType =
  | 'fade_in'
  | 'slide_in_left'
  | 'slide_in_right'
  | 'slide_in_up'
  | 'slide_in_down'
  | 'brush_reveal'
  | string;

export interface AnimationSpec {
  type: AnimationType;
  duration_sec: number;
  delay_sec?: number;
}

export interface KeywordSpec {
  text: string;
  importance?: 'low' | 'medium' | 'high' | number;
}

export interface VoiceStyleSpec {
  style?: string;
  rate?: string;
  pitch?: string;
}

export interface NarrationSpec {
  text: string;
  audio_file: string;
  voice_style?: VoiceStyleSpec;
  keywords?: KeywordSpec[];
}

export interface ManifestEvent {
  question_id: string;
  question_number: number;
  slide_type: SlideType;
  slide_index: number;
  anim_num: number;
  shape_id: string;
  animation: AnimationSpec;
  narration?: NarrationSpec;
}

