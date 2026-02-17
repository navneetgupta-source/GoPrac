/**
 * Choreography Type Definitions
 * Defines the timing and animation orchestration schema
 */

export type AnimationType = 
  | 'fade'
  | 'slideFromLeft'
  | 'slideFromRight'
  | 'slideFromTop'
  | 'slideFromBottom'
  | 'scale'
  | 'none';

export type RawAnimationType =
  | 'fade'
  | 'fadeIn'
  | 'slideInLeft'
  | 'slideInRight'
  | 'slideInTop'
  | 'slideInBottom'
  | 'scaleIn'
  | 'scale'
  | 'counterAnimation'
  | 'none';

export type AnimationEasing = 'easeIn' | 'easeOut' | 'easeInOut' | 'linear' | 'spring';

export interface SpringConfig {
  damping?: number;
  mass?: number;
  stiffness?: number;
}

export type HighlightStyle = 
  | 'background'
  | 'underline'
  | 'bold'
  | 'color'
  | 'none';

export interface WordTiming {
  word: string;
  startFrame: number;
  endFrame: number;
  durationFrames?: number;
}

export interface AnimationBlock {
  blockId: string;
  animationType?: AnimationType;
  type?: RawAnimationType;
  startFrame: number;
  durationFrames: number;
  delay?: number;  // delay before animation starts (in frames)
  stagger?: number; // for staggered children (in frames)
  easing?: AnimationEasing;
  useSpring?: boolean;
  springConfig?: SpringConfig;
}

export interface NarrationConfig {
  audioFile: string;
  startFrame: number;
  durationSec: number;
  endFrame?: number;
  wordTimings: WordTiming[];
}

export interface HighlightConfig {
  enabled: boolean;
  style: HighlightStyle;
  targetBlockId?: string;  // which block to highlight text in
  color?: string;
}

export interface BlockHighlight {
  blockId: string;
  startFrame: number;
  endFrame: number;
  color?: string;
  segments?: HighlightSegment[];
}

export interface HighlightSegment {
  text?: string | null;
  startFrame: number;
  endFrame: number;
}

export interface SlideChoreography {
  slideId: string;
  slideType: string;
  totalDurationFrames: number;
  narration?: NarrationConfig;
  animations: AnimationBlock[];
  highlighting?: HighlightConfig;
  highlights?: BlockHighlight[];  // Narrative-driven block highlights
}

export interface ChoreographyManifest {
  version: string;
  fps: number;
  slides: SlideChoreography[];
}
