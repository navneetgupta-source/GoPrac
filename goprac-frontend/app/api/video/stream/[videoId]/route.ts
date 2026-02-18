/**
 * API Route: Stream Generated Video
 * GET /api/video/stream/[videoId]
 * 
 * Streams the generated MP4 video with proper headers
 * Supports range requests for seeking
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
  req: NextRequest,
  { params }: { params: { videoId: string } }
): Promise<NextResponse> {
  try {
    const { videoId } = params;

    // Path to find the video
    const videoOutputPath = path.join(
      process.cwd(),
      '..',
      'ai-feedback-video2',
      'ai-feedback-video2',
      'video-app',
      'dist'
    );

    // Try to find the video file
    const videoPath = path.join(videoOutputPath, `output_${videoId}.mp4`);
    const fallbackPath = path.join(videoOutputPath, 'output.mp4');

    let filePath = videoPath;
    if (!fs.existsSync(filePath) && fs.existsSync(fallbackPath)) {
      filePath = fallbackPath;
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Get file size
    const fileSize = fs.statSync(filePath).size;
    const rangeHeader = req.headers.get('range');

    // Handle range requests for seeking
    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            'Content-Range': `bytes */${fileSize}`,
          },
        });
      }

      const chunksize = end - start + 1;
      const stream = fs.createReadStream(filePath, { start, end });

      return new NextResponse(stream as any, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': 'video/mp4',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Return full file
    const stream = fs.createReadStream(filePath);

    return new NextResponse(stream as any, {
      headers: {
        'Content-Length': fileSize.toString(),
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': `inline; filename="${videoId}.mp4"`,
      },
    });
  } catch (error) {
    console.error('Error streaming video:', error);
    return NextResponse.json(
      { error: 'Failed to stream video' },
      { status: 500 }
    );
  }
}
