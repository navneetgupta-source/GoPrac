/**
 * Server Action: Generate Video from Feedback
 * Call this from the backend to trigger video generation
 * and track progress
 */

"use server";

interface VideoGenerationPayload {
  slides: Record<string, any>;
}

interface GenerateVideoResponse {
  success: boolean;
  videoId: string;
  message: string;
  status: "processing" | "completed" | "failed";
}

/**
 * Server action to generate a feedback video
 * @param feedbackContent The feedback content with slides structure
 * @returns Video generation result with videoId for tracking
 */
export async function generateFeedbackVideo(
  feedbackContent: VideoGenerationPayload
): Promise<GenerateVideoResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/video/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedbackContent,
          quality: "1080p",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        videoId: "",
        message: "Failed to generate video",
        status: "failed",
      };
    }

    const data: GenerateVideoResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error in generateFeedbackVideo:", error);
    return {
      success: false,
      videoId: "",
      message: "Error generating video",
      status: "failed",
    };
  }
}

/**
 * Get the current status of a video generation
 * @param videoId The video ID returned from generateFeedbackVideo
 */
export async function getVideoStatus(
  videoId: string
): Promise<{
  status: "processing" | "completed" | "failed" | "not_found";
  videoUrl?: string;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/video/status/${videoId}`
    );

    if (!response.ok) {
      return {
        status: "failed",
        error: "Failed to fetch status",
      };
    }

    const data = await response.json();
    return {
      status: data.status,
      videoUrl: data.videoUrl,
      error: data.error,
    };
  } catch (error) {
    console.error("Error getting video status:", error);
    return {
      status: "failed",
      error: "Error fetching video status",
    };
  }
}
