/**
 * Hook: useVideoGeneration
 * 
 * Client-side hook for managing video generation workflow
 * Handles triggering generation, polling for status, and error handling
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface VideoGenerationPayload {
  slides: Record<string, any>;
}

interface UseVideoGenerationState {
  videoId: string | null;
  status: "idle" | "generating" | "ready" | "error";
  videoUrl: string | null;
  error: string | null;
  progress: number; // 0-100
  isLoading: boolean;
}

interface UseVideoGenerationActions {
  generateVideo: (content: VideoGenerationPayload) => Promise<void>;
  resetGeneration: () => void;
  pollStatus: () => Promise<void>;
}

export function useVideoGeneration(): UseVideoGenerationState & UseVideoGenerationActions {
  const [state, setState] = useState<UseVideoGenerationState>({
    videoId: null,
    status: "idle",
    videoUrl: null,
    error: null,
    progress: 0,
    isLoading: false,
  });

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const pollStatus = useCallback(async () => {
    if (!state.videoId) return;

    try {
      const response = await fetch(`/api/video/status/${state.videoId}`);
      const data = await response.json();

      if (data.status === "completed" && data.videoUrl) {
        setState((prev) => ({
          ...prev,
          status: "ready",
          videoUrl: data.videoUrl,
          progress: 100,
          isLoading: false,
          error: null,
        }));

        // Stop polling
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      } else if (data.status === "failed") {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: data.error || "Video generation failed",
          isLoading: false,
          progress: 0,
        }));

        // Stop polling
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
      // If still processing, continue polling
    } catch (error) {
      console.error("Error polling video status:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to check video status",
      }));
    }
  }, [state.videoId]);

  const generateVideo = useCallback(
    async (content: VideoGenerationPayload) => {
      try {
        setState({
          videoId: null,
          status: "generating",
          videoUrl: null,
          error: null,
          progress: 10,
          isLoading: true,
        });

        const response = await fetch("/api/video/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            feedbackContent: content,
            quality: "1080p",
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          setState((prev) => ({
            ...prev,
            status: "error",
            error: error.message || "Failed to generate video",
            isLoading: false,
            progress: 0,
          }));
          return;
        }

        const data = await response.json();

        setState((prev) => ({
          ...prev,
          videoId: data.videoId,
          progress: 20,
        }));

        // Start polling for status
        let pollCount = 0;
        const maxPolls = 720; // 1 hour with 5 second intervals

        pollIntervalRef.current = setInterval(async () => {
          pollCount++;

          if (pollCount > maxPolls) {
            clearInterval(pollIntervalRef.current!);
            setState((prev) => ({
              ...prev,
              status: "error",
              error: "Video generation timeout",
              isLoading: false,
            }));
            return;
          }

          // Update progress based on polling count
          const newProgress = Math.min(20 + (pollCount * 60) / maxPolls, 90);
          setState((prev) => ({
            ...prev,
            progress: newProgress,
          }));

          await pollStatus();
        }, 5000);

        // First poll immediately
        await pollStatus();
      } catch (error) {
        console.error("Error generating video:", error);
        setState((prev) => ({
          ...prev,
          status: "error",
          error: error instanceof Error ? error.message : "Error generating video",
          isLoading: false,
          progress: 0,
        }));
      }
    },
    [pollStatus]
  );

  const resetGeneration = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setState({
      videoId: null,
      status: "idle",
      videoUrl: null,
      error: null,
      progress: 0,
      isLoading: false,
    });
  }, []);

  return {
    ...state,
    generateVideo,
    resetGeneration,
    pollStatus,
  };
}
