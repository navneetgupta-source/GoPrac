/**
 * Type Definitions for Video Generation System
 */

export interface VideoSlide {
  visual: {
    [key: string]: any;
  };
  narration: string;
  voice_style?: {
    style?: string;
    rate?: number;
    pitch?: number;
  };
}

export interface VideoFeedbackContent {
  slides: {
    intro?: VideoSlide;
    case_overview?: VideoSlide;
    q1_summary?: VideoSlide;
    q2_summary?: VideoSlide;
    q3_summary?: VideoSlide;
    [key: string]: VideoSlide | undefined;
  };
}

export interface VideoGenerationRequest {
  feedbackContent: VideoFeedbackContent;
  videoId?: string;
  quality?: 'HD' | '1080p' | '2K' | '4K';
  fps?: number;
}

export interface VideoGenerationResponse {
  success: boolean;
  videoId: string;
  message: string;
  videoUrl?: string;
  status: 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface VideoStatusResponse {
  videoId: string;
  status: 'processing' | 'completed' | 'failed' | 'not_found';
  videoUrl?: string;
  outputPath?: string;
  error?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface VideoPlayerProps {
  url?: string;
  videoId?: string;
  title?: string;
  description?: string;
  poster?: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: string) => void;
}

export interface UseVideoGenerationState {
  videoId: string | null;
  status: 'idle' | 'generating' | 'ready' | 'error';
  videoUrl: string | null;
  error: string | null;
  progress: number;
  isLoading: boolean;
}

export interface UseVideoGenerationActions {
  generateVideo: (content: VideoFeedbackContent) => Promise<void>;
  resetGeneration: () => void;
  pollStatus: () => Promise<void>;
}

/**
 * Sample feedback content structure for reference
 */
export const SAMPLE_VIDEO_CONTENT: VideoFeedbackContent = {
  slides: {
    intro: {
      visual: {
        headline: "Interview Feedback",
        subheading: "Your AI-Powered Assessment",
        cta_text: "Let's Review Your Performance",
      },
      narration: "Welcome to your personalized interview feedback. In the next few minutes, we'll walk through your responses and provide constructive insights.",
      voice_style: {
        style: "professional",
        rate: 1.0,
        pitch: 0,
      },
    },

    case_overview: {
      visual: {
        title: "Software Engineer Position",
        context: "Cloud Infrastructure Team",
      },
      narration: "You interviewed for the Software Engineer position in our Cloud Infrastructure team. Let's examine how you responded to our key questions.",
    },

    q1_summary: {
      visual: {
        question: "Tell us about your experience with cloud technologies",
        number: 1,
      },
      narration: "In your first response, you discussed your experience with AWS and Kubernetes. You provided specific examples which was excellent.",
    },

    feedback_blocks: {
      visual: {
        items: [
          {
            title: "Strengths",
            description: "Clear communication and technical depth",
          },
          {
            title: "Areas for Growth",
            description: "Could provide more specific metrics and outcomes",
          },
          {
            title: "Recommendations",
            description: "Focus on quantifiable achievements in future interviews",
          },
        ],
      },
      narration: "Here's a summary of your performance across key dimensions...",
    },

    thinking_steps: {
      visual: {
        rows: [
          {
            criterion: "Technical Knowledge",
            observation: "Demonstrated solid understanding of cloud concepts",
            score: 4,
          },
          {
            criterion: "Communication",
            observation: "Articulated thoughts clearly and concisely",
            score: 4,
          },
          {
            criterion: "Problem Solving",
            observation: "Approached problems systematically",
            score: 3,
          },
        ],
      },
      narration: "Your thinking process evaluation shows strong technical knowledge with good communication skills.",
    },
  },
};

/**
 * Helper type for building feedback content progressively
 */
export type VideoContentBuilder = Partial<VideoFeedbackContent>;

/**
 * Quality presets with resolution and bitrate info
 */
export const VIDEO_QUALITY_PRESETS = {
  HD: { width: 1280, height: 720, bitrate: '2500k' },
  '1080p': { width: 1920, height: 1080, bitrate: '5000k' },
  '2K': { width: 2560, height: 1440, bitrate: '8000k' },
  '4K': { width: 3840, height: 2160, bitrate: '15000k' },
};

/**
 * Video status polling configuration
 */
export const VIDEO_POLLING_CONFIG = {
  INITIAL_INTERVAL: 5000, // 5 seconds
  MAX_POLLS: 720, // 1 hour with 5 second intervals
  TIMEOUT_MS: 3600000, // 1 hour total timeout
};
