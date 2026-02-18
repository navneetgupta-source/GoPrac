/**
 * Example Component: Video Generation in Interview Review
 * 
 * This demonstrates how to integrate the video generator into
 * your review/feedback pages
 */

"use client";

import React, { useEffect, useState } from "react";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";
import VideoPlayer from "@/app/(main)/review/_components/video-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Loader, CheckCircle } from "lucide-react";
import type { VideoFeedbackContent } from "@/lib/video-types";

interface ReviewDataType {
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  interviewDate: string;
  answers: Array<{
    questionNumber: number;
    question: string;
    answer: string;
    feedback: string;
  }>;
  overallScore: number;
  thinking_score: number;
  communication_score: number;
}

interface ExampleVideoGeneratorProps {
  reviewData: ReviewDataType;
  onVideoGenerated?: (videoUrl: string) => void;
}

/**
 * Helper function to transform review data into video feedback content
 */
function buildFeedbackContent(reviewData: ReviewDataType): VideoFeedbackContent {
  return {
    slides: {
      intro: {
        visual: {
          headline: `Interview Feedback for ${reviewData.candidateName}`,
          subheading: `${reviewData.jobTitle} at ${reviewData.companyName}`,
          cta_text: "Let's Review Your Performance",
        },
        narration: `Welcome to your personalized interview feedback, ${reviewData.candidateName}. In the next few minutes, we'll walk through your interview for the ${reviewData.jobTitle} position and provide constructive insights on your performance.`,
        voice_style: {
          style: "professional",
          rate: 1.0,
        },
      },

      case_overview: {
        visual: {
          title: `${reviewData.jobTitle} Position`,
          context: `${reviewData.companyName} - Interviewed on ${new Date(reviewData.interviewDate).toLocaleDateString()}`,
        },
        narration: `You interviewed for the ${reviewData.jobTitle} position at ${reviewData.companyName}. Let's examine how you responded to our key questions and evaluate your thinking skills.`,
      },

      q1_summary: {
        visual: {
          question: reviewData.answers[0]?.question || "Question 1",
          number: 1,
          answer_preview: reviewData.answers[0]?.answer.substring(0, 100) + "...",
        },
        narration: `In response to the first question, you said: "${reviewData.answers[0]?.answer}". ${reviewData.answers[0]?.feedback}`,
      },

      feedback_blocks: {
        visual: {
          items: [
            {
              title: "Thinking Skills Score",
              description: `${reviewData.thinking_score}/10 - ${reviewData.thinking_score >= 7 ? "Strong analytical thinking" : "Room for improvement in problem-solving"}`,
            },
            {
              title: "Communication Score",
              description: `${reviewData.communication_score}/10 - ${reviewData.communication_score >= 7 ? "Clear and articulate" : "Could be more concise"}`,
            },
            {
              title: "Overall Performance",
              description: `${reviewData.overallScore}/10 - ${getPerformanceLevel(reviewData.overallScore)}`,
            },
          ],
        },
        narration: `Here's a summary of your performance. Your thinking skills score was ${reviewData.thinking_score} out of 10, and your communication skills scored ${reviewData.communication_score} out of 10. Your overall performance rating is ${reviewData.overallScore} out of 10.`,
      },

      thinking_steps: {
        visual: {
          rows: reviewData.answers.map((answer, index) => ({
            criterion: `Question ${index + 1}`,
            observation: answer.feedback,
            score: Math.min(10, Math.max(1, Math.floor(Math.random() * 5 + 5))), // Mock score
          })),
        },
        narration: `Let's examine your thinking process in detail. We evaluated your responses based on clarity, depth of analysis, and problem-solving approach.`,
      },
    },
  };
}

function getPerformanceLevel(score: number): string {
  if (score >= 8) return "Exceptional performance";
  if (score >= 7) return "Strong performance";
  if (score >= 6) return "Good performance";
  if (score >= 5) return "Acceptable performance";
  return "Needs improvement";
}

export default function ExampleVideoGenerator({
  reviewData,
  onVideoGenerated,
}: ExampleVideoGeneratorProps) {
  const {
    videoId,
    status,
    videoUrl,
    error,
    progress,
    isLoading,
    generateVideo,
    resetGeneration,
  } = useVideoGeneration();

  const [autoGenerate, setAutoGenerate] = useState(false);

  // Auto-generate video on mount if enabled
  useEffect(() => {
    if (autoGenerate && status === "idle") {
      const feedbackContent = buildFeedbackContent(reviewData);
      generateVideo(feedbackContent);
    }
  }, [autoGenerate]);

  // Notify parent when video is ready
  useEffect(() => {
    if (videoUrl && onVideoGenerated) {
      onVideoGenerated(videoUrl);
    }
  }, [videoUrl]);

  const handleGenerateVideo = async () => {
    const feedbackContent = buildFeedbackContent(reviewData);
    await generateVideo(feedbackContent);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-2xl">
            {reviewData.candidateName}'s Interview Feedback Video
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-600">Position</p>
              <p className="font-semibold text-slate-900">{reviewData.jobTitle}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Company</p>
              <p className="font-semibold text-slate-900">{reviewData.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Interview Date</p>
              <p className="font-semibold text-slate-900">
                {new Date(reviewData.interviewDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Overall Score</p>
              <p className="font-semibold text-slate-900">
                {reviewData.overallScore}/10
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate Feedback Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Generate a personalized AI-narrated video summarizing the interview feedback.
            Video generation typically takes 5-15 minutes.
          </p>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {status === "idle" && !videoUrl && (
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateVideo}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Generate Video Now
              </Button>
              <Button variant="outline" onClick={() => setAutoGenerate(!autoGenerate)}>
                {autoGenerate ? "Auto-generation: On" : "Auto-generation: Off"}
              </Button>
            </div>
          )}

          {status === "generating" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader className="h-5 w-5 animate-spin text-blue-600" />
                <span className="font-medium">
                  Generating video... {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-slate-600">
                Please don't close this page while the video is being generated.
              </p>
            </div>
          )}

          {status === "ready" && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span>Video generated successfully!</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Player */}
      {(videoUrl || status === "generating") && (
        <div>
          <VideoPlayer
            url={videoUrl}
            videoId={videoId || undefined}
            title={`Interview Feedback - ${reviewData.candidateName}`}
            description={`Personalized feedback for ${reviewData.jobTitle} position at ${reviewData.companyName}`}
            poster="/images/interview-feedback-poster.jpg"
          />
        </div>
      )}

      {/* Action Buttons */}
      {status === "ready" && videoUrl && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6 space-y-3">
            <div className="flex gap-2">
              <Button
                onClick={resetGeneration}
                variant="outline"
                className="flex-1"
              >
                Generate Another Video
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (videoUrl) {
                    window.open(videoUrl, "_blank");
                  }
                }}
              >
                Open in New Tab
              </Button>
            </div>
            <p className="text-xs text-slate-600 text-center">
              Videos are cached for 1 hour. Download to keep permanently.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
