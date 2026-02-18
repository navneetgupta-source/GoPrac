/**
 * API Route: Generate AI Feedback Video
 * POST /api/video/generate
 * 
 * Triggers the ai-feedback-video2 pipeline to generate a video
 * with the provided feedback content.
 */

import { NextRequest, NextResponse } from 'next/server';
import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

interface VideoGenerationRequest {
  feedbackContent: {
    slides: Record<string, any>;
  };
  videoId?: string;
  quality?: 'HD' | '1080p' | '2K'; // 720p, 1080p, etc
}

interface VideoGenerationResponse {
  success: boolean;
  videoId: string;
  message: string;
  videoUrl?: string;
  status?: 'processing' | 'completed' | 'failed';
  error?: string;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<VideoGenerationResponse>> {
  try {
    const body: VideoGenerationRequest = await req.json();
    
    // Validate input
    if (!body.feedbackContent || !body.feedbackContent.slides) {
      return NextResponse.json(
        {
          success: false,
          videoId: '',
          message: 'Invalid request',
          error: 'feedbackContent with slides is required',
        },
        { status: 400 }
      );
    }

    const videoId = body.videoId || `video_${Date.now()}`;
    const quality = body.quality || '1080p';

    // Path to the ai-feedback-video2 project
    const videoGeneratorPath = path.join(
      process.cwd(),
      '..',
      'ai-feedback-video2',
      'ai-feedback-video2'
    );

    // Check if video generator exists
    if (!fs.existsSync(videoGeneratorPath)) {
      return NextResponse.json(
        {
          success: false,
          videoId,
          message: 'Video generator not found',
          error: 'ai-feedback-video2 project path is invalid',
          status: 'failed',
        },
        { status: 500 }
      );
    }

    // Write input content to input.txt for the video generator
    const inputJsonPath = path.join(videoGeneratorPath, 'input.txt');
    fs.writeFileSync(
      inputJsonPath,
      JSON.stringify({ slides: body.feedbackContent.slides }, null, 2),
      'utf-8'
    );

    // Queue the video generation (non-blocking)
    // In production, you'd use a job queue like Bull or RabbitMQ
    generateVideoAsync(videoGeneratorPath, videoId, quality).catch((err) => {
      console.error(`Error generating video ${videoId}:`, err);
    });

    return NextResponse.json(
      {
        success: true,
        videoId,
        message: 'Video generation queued',
        status: 'processing',
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      {
        success: false,
        videoId: '',
        message: 'Video generation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'failed',
      },
      { status: 500 }
    );
  }
}

/**
 * Asynchronously generate video in the background
 * In production, integrate with a proper job queue
 */
async function generateVideoAsync(
  videoGeneratorPath: string,
  videoId: string,
  quality: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Run the orchestrate.py pipeline
      const pythonProcess = spawn('python', 
        [path.join(videoGeneratorPath, 'backend', 'scripts', 'orchestrate.py')],
        {
          cwd: videoGeneratorPath,
          stdio: ['pipe', 'pipe', 'pipe'],
          env: {
            ...process.env,
            VIDEO_ID: videoId,
            VIDEO_QUALITY: quality,
          },
        }
      );

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout?.on('data', (data) => {
        stdout += data.toString();
        console.log(`[${videoId}] Output:`, data.toString());
      });

      pythonProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
        console.error(`[${videoId}] Error:`, data.toString());
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`[${videoId}] Video generation completed successfully`);
          resolve();
        } else {
          console.error(`[${videoId}] Video generation failed with code ${code}`);
          reject(new Error(`Process exited with code ${code}`));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error(`[${videoId}] Process error:`, error);
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}
