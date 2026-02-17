export type MorphElementConfig = {
  elementId: string;
  // Starting position/size (from previous slide)
  fromBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  // Ending position/size (in current slide)
  toBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  // Optional style transformations
  fromStyle?: React.CSSProperties;
  toStyle?: React.CSSProperties;
};

export type MorphTransitionConfig = {
  // Slide pair identifier (e.g., "case_overview_to_question_summary")
  transitionId: string;
  // Duration of morph animation in frames
  durationFrames: number;
  // Elements to morph between slides
  elements: MorphElementConfig[];
  // Easing function
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
};
