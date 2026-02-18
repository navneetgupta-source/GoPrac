/**
 * API Route: Get Video Status
 * GET /api/video/status/[videoId]
 * 
 * Returns the status and details of a generated video
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

interface VideoStatus {
  videoId: string;
  status: 'processing' | 'completed' | 'failed' | 'not_found';
  videoUrl?: string;
  outputPath?: string;
  error?: string;
  createdAt?: string;
  completedAt?: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { videoId: string } }
): Promise<NextResponse<VideoStatus>> {
  try {
    const { videoId } = params;

    // Path to the ai-feedback-video2 project output
    const videoOutputPath = path.join(
      process.cwd(),
      '..',
      'ai-feedback-video2',
      'ai-feedback-video2',
      'video-app',
      'dist'
    );

    // Check for generated video files (multiple quality formats)
    const videoFormats = ['mp4', 'webm'];
    let foundVideo: { format: string; path: string } | null = null;

    for (const format of videoFormats) {
      const videoPath = path.join(videoOutputPath, `output_${videoId}.${format}`);
      if (fs.existsSync(videoPath)) {
        foundVideo = { format, path: videoPath };
        break;
      }
    }

    // Also check for standard output format
    if (!foundVideo) {
      const standardPath = path.join(videoOutputPath, 'output.mp4');
      if (fs.existsSync(standardPath)) {
        foundVideo = { format: 'mp4', path: standardPath };
      }
    }

    if (foundVideo) {
      const stats = fs.statSync(foundVideo.path);
      return NextResponse.json({
        videoId,
        status: 'completed',
        videoUrl: `/api/video/stream/${videoId}`,
        outputPath: foundVideo.path,
        completedAt: stats.mtimeString,
      });
    }

    // Check if video is still processing
    const processingIndicatorPath = path.join(
      videoOutputPath,
      `.${videoId}.processing`
    );
    if (fs.existsSync(processingIndicatorPath)) {
      return NextResponse.json({
        videoId,
        status: 'processing',
      });
    }

    // Check if there was an error
    const errorLogPath = path.join(videoOutputPath, `.${videoId}.error`);
    if (fs.existsSync(errorLogPath)) {
      const errorContent = fs.readFileSync(errorLogPath, 'utf-8');
      return NextResponse.json({
        videoId,
        status: 'failed',
        error: errorContent,
      });
    }

    return NextResponse.json({
      videoId,
      status: 'not_found',
      error: 'Video not found. It may not have been generated yet.',
    });
  } catch (error) {
    console.error('Error checking video status:', error);
    return NextResponse.json(
      {
        videoId: params.videoId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
