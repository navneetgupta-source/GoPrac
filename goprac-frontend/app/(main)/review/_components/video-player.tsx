"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Download,
  AlertCircle,
  Loader,
  Volume2,
  Maximize,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

interface VideoPlayerProps {
  url?: string;
  videoId?: string;
  title?: string;
  description?: string;
  poster?: string;
}

interface VideoStatus {
  videoId: string;
  status: "processing" | "completed" | "failed" | "not_found";
  videoUrl?: string;
  error?: string;
}

export default function VideoPlayer({
  url,
  videoId,
  title = "Interview Feedback Video",
  description,
  poster,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>(url || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoStatus, setVideoStatus] = useState<"loading" | "ready" | "error">(
    url ? "ready" : "loading"
  );

  // Poll for video generation status if videoId is provided
  useEffect(() => {
    if (!videoId || url) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/video/status/${videoId}`);
        const status: VideoStatus = await response.json();

        if (status.status === "completed" && status.videoUrl) {
          setVideoUrl(status.videoUrl);
          setVideoStatus("ready");
          setError("");
          clearInterval(pollInterval);
        } else if (status.status === "failed") {
          setError(status.error || "Video generation failed");
          setVideoStatus("error");
          clearInterval(pollInterval);
        }
        // Keep polling if still processing
      } catch (err) {
        console.error("Error checking video status:", err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [videoId, url]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = async () => {
    if (!videoUrl) {
      toast.error("Video URL not available");
      return;
    }

    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${videoId || 'interview'}-feedback.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Video downloaded successfully");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download video");
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
          setIsFullscreen(false);
        } else {
          videoRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (videoStatus === "error") {
    return (
      <Card className="my-6 border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Video Failed to Load</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (videoStatus === "loading" || isLoading) {
    return (
      <Card className="my-6">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
            <div className="text-center">
              <p className="font-medium text-slate-900">
                {videoId ? "Generating your video..." : "Loading video..."}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {videoId
                  ? "This may take a few moments. We'll notify you when it's ready."
                  : "Please wait while we prepare your video."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-6 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <p className="text-sm text-slate-600 mt-1">{description}</p>
            )}
          </div>
          {videoUrl && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Ready to Play
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Video Container */}
          <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              src={videoUrl}
              poster={poster}
              className="w-full h-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedMetadata={(e) => {
                const video = e.currentTarget;
                setDuration(video.duration);
              }}
              onTimeUpdate={(e) => {
                setCurrentTime(e.currentTarget.currentTime);
              }}
            />

            {/* Custom Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 space-y-2">
              {/* Progress Bar */}
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => {
                    const newTime = Number(e.target.value);
                    if (videoRef.current) {
                      videoRef.current.currentTime = newTime;
                    }
                  }}
                  className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer accent-blue-500"
                />
                <span className="text-xs text-white font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={handlePlayPause}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        setCurrentTime(0);
                      }
                    }}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition"
                    aria-label="Restart"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>

                  <button
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition"
                    aria-label="Volume"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={handleFullscreen}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition"
                  aria-label="Fullscreen"
                >
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Download Button */}
          {videoUrl && (
            <div className="flex justify-end">
              <Button
                onClick={handleDownload}
                size="sm"
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Download Video
              </Button>
            </div>
          )}

          {/* Info */}
          {videoUrl && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                Video is cached for 1 hour. Download to save permanently.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}