# Video Generator Integration Guide

## Overview

This guide explains how to integrate the AI Feedback Video Generator (from `ai-feedback-video2`) with the GoPrac frontend application. The integration allows you to generate cinematic AI-narrated videos from feedback content and display them in the frontend using an enhanced video player.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        GoPrac Frontend                          │
├─────────────────────────────────────────────────────────────────┤
│  • Video Player Component (video-player.tsx)                    │
│  • Video Generation Hook (useVideoGeneration)                   │
│  • Server Actions (generate-video.ts)                           │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────────────┐
│                   Next.js API Routes                            │
├─────────────────────────────────────────────────────────────────┤
│  POST   /api/video/generate      - Trigger video generation    │
│  GET    /api/video/status/[id]   - Check generation status     │
│  GET    /api/video/stream/[id]   - Stream generated video      │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────────────┐
│              AI Feedback Video Generator                        │
├─────────────────────────────────────────────────────────────────┤
│  • Backend Pipeline (Python)                                    │
│  • Remotion Video Composition                                   │
│  • Azure TTS Integration                                        │
│  • Output Generation                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Components & Files

### 1. **Video Player Component** (`app/(main)/review/_components/video-player.tsx`)

Enhanced component with:
- Play/pause controls
- Progress bar with seeking
- Download functionality
- Fullscreen support
- Status polling for generated videos
- Error handling and loading states

**Props:**
```typescript
interface VideoPlayerProps {
  url?: string;           // Direct video URL
  videoId?: string;       // ID to poll for generated video
  title?: string;         // Display title
  description?: string;   // Display description
  poster?: string;        // Thumbnail image
}
```

**Usage:**
```tsx
import VideoPlayer from '@/app/(main)/review/_components/video-player';

// Display existing video
<VideoPlayer url="https://example.com/video.mp4" />

// Display generated video
<VideoPlayer videoId="video_1708876800" />
```

### 2. **Server Actions** (`actions/generate-video.ts`)

Two main server actions:

#### `generateFeedbackVideo(feedbackContent)`
Triggers video generation with feedback content.

```typescript
import { generateFeedbackVideo } from '@/actions/generate-video';

const result = await generateFeedbackVideo({
  slides: {
    intro: { visual: {...}, narration: "..." },
    case_overview: { visual: {...}, narration: "..." },
    // ... more slides
  }
});

console.log(result.videoId); // Use this to track progress
```

#### `getVideoStatus(videoId)`
Check the status of a video generation.

```typescript
import { getVideoStatus } from '@/actions/generate-video';

const status = await getVideoStatus('video_1708876800');
// Returns: { status: 'completed', videoUrl: '...', error?: '...' }
```

### 3. **Custom Hook** (`hooks/useVideoGeneration.ts`)

Client-side hook for managing video generation workflow.

```typescript
import { useVideoGeneration } from '@/hooks/useVideoGeneration';

function MyComponent() {
  const {
    videoId,
    status,        // 'idle' | 'generating' | 'ready' | 'error'
    videoUrl,
    error,
    progress,      // 0-100
    isLoading,
    generateVideo,
    resetGeneration,
  } = useVideoGeneration();

  const handleGenerate = async () => {
    await generateVideo({
      slides: {
        // ... your feedback content
      }
    });
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? `Generating... ${progress}%` : 'Generate Video'}
      </button>
      
      {error && <div className="error">{error}</div>}
      
      {videoUrl && (
        <VideoPlayer url={videoUrl} videoId={videoId} />
      )}
    </div>
  );
}
```

### 4. **API Routes**

#### POST `/api/video/generate`
**Request:**
```json
{
  "feedbackContent": {
    "slides": {
      "intro": { ... },
      "case_overview": { ... }
    }
  },
  "quality": "1080p"
}
```

**Response:**
```json
{
  "success": true,
  "videoId": "video_1708876800",
  "message": "Video generation queued",
  "status": "processing"
}
```

#### GET `/api/video/status/:videoId`
**Response:**
```json
{
  "videoId": "video_1708876800",
  "status": "completed",
  "videoUrl": "/api/video/stream/video_1708876800",
  "completedAt": "2024-02-17T12:30:00Z"
}
```

#### GET `/api/video/stream/:videoId`
Streams the video file with support for range requests (seeking).

## Workflow Examples

### Example 1: Generate and Display Interview Feedback Video

```tsx
"use client";

import { useState } from 'react';
import { useVideoGeneration } from '@/hooks/useVideoGeneration';
import VideoPlayer from '@/app/(main)/review/_components/video-player';
import { Button } from '@/components/ui/button';

export function InterviewFeedback({ reviewData }) {
  const { 
    videoUrl, 
    status, 
    progress, 
    error, 
    generateVideo 
  } = useVideoGeneration();

  const handleGenerateFeedbackVideo = async () => {
    const feedbackContent = {
      slides: {
        intro: {
          visual: { headline: "Interview Feedback" },
          narration: "Let's review your interview performance..."
        },
        case_overview: {
          visual: { title: reviewData.jobTitle },
          narration: "You applied for the position of..."
        },
        q1_summary: {
          visual: { question: "Tell us about yourself" },
          narration: "In response to the first question..."
        },
        // Add more slides as needed
      }
    };

    await generateVideo(feedbackContent);
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleGenerateFeedbackVideo}
        disabled={status === 'generating'}
      >
        {status === 'generating' ? `Generating... ${progress}%` : 'Generate Feedback Video'}
      </Button>

      {error && <div className="error">{error}</div>}

      {status === 'generating' && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <p>Video generation in progress...</p>
        </div>
      )}

      {status === 'ready' && (
        <VideoPlayer 
          videoId="" 
          url={videoUrl}
          title="Your Interview Feedback"
          description="Personalized feedback on your interview performance"
          poster="/images/interview-poster.jpg"
        />
      )}
    </div>
  );
}
```

### Example 2: From Review Component

```tsx
// In app/(main)/review/_components/report.tsx

export default function Report({ reviewData }) {
  const { videoUrl, generateVideo, progress } = useVideoGeneration();

  useEffect(() => {
    // Auto-generate video on mount if not already generated
    if (!reviewData.videoUrl && !videoUrl) {
      generateVideo({
        slides: {
          // Build slides from reviewData
          intro: { ... },
          // ...
        }
      });
    }
  }, []);

  return (
    <div>
      {/* ... other report content ... */}
      
      <VideoPlayer 
        videoId={reviewData.videoSessionId}
        url={videoUrl || reviewData.videoUrl}
      />
    </div>
  );
}
```

## Setup & Configuration

### 1. Ensure ai-feedback-video2 is Available

```bash
# Your workspace should have this structure:
/workspaces/GoPrac/
├── ai-feedback-video2/
│   └── ai-feedback-video2/
│       ├── backend/
│       │   ├── scripts/
│       │   │   └── orchestrate.py
│       │   └── requirements.txt
│       └── video-app/
│           ├── dist/  # Where videos are output
│           └── src/
└── goprac-frontend/
```

### 2. Set Environment Variables

In `goprac-frontend/.env.local`:
```env
# Video generation
NEXT_PUBLIC_API_URL=http://localhost:3000

# Azure TTS (if not already set)
AZURE_SPEECH_KEY=your_azure_key_here
AZURE_SPEECH_REGION=your_region
```

### 3. Install Python Dependencies (if not already done)

```bash
cd ai-feedback-video2/ai-feedback-video2
pip install -r backend/requirements.txt
```

### 4. Run the Frontend

```bash
cd goprac-frontend
npm run dev
```

The API routes will automatically be available at:
- `POST /api/video/generate`
- `GET /api/video/status/:videoId`
- `GET /api/video/stream/:videoId`

## Data Structure: Feedback Content

The `feedbackContent.slides` object should follow this structure:

```typescript
{
  intro: {
    visual: {
      headline: string;         // Main heading
      subheading?: string;       // Optional subheading
      cta_text?: string;         // Call-to-action text
    };
    narration: string;           // AI narration text
  };
  
  case_overview: {
    visual: {
      title: string;
      context?: string;
    };
    narration: string;
  };
  
  q_summary: {
    visual: {
      question: string;
      number?: number;
    };
    narration: string;
  };
  
  feedback_blocks: {
    visual: {
      items: Array<{
        title: string;
        description: string;
      }>;
    };
    narration: string;
  };
  
  thinking_steps: {
    visual: {
      rows: Array<{
        criterion: string;
        observation: string;
        score?: number;
      }>;
    };
    narration: string;
  };
}
```

## Performance Considerations

### Video Generation Time
- Initial setup: ~10 seconds
- Pipeline execution: 2-5 minutes (depends on content length)
- Rendering: 1-10 minutes (depends on length and quality)
- **Total typical time: 5-15 minutes**

### Optimization Tips
1. **Use background processing** - Don't block user on generation
2. **Cache videos** - Store generated videos and reuse when possible
3. **Quality selection** - Use fallback qualities if user has slow connection
4. **Polling interval** - Balance between responsiveness and server load

### Caching Strategy
Generated videos are cached for 1 hour. For longer-term storage:
1. Download the video after generation
2. Store in permanent storage (S3, Cloud Storage)
3. Update the video URL in your database
4. Reference the permanent URL instead

## Error Handling

The system handles several error scenarios:

```typescript
// In your component
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Video Generation Failed</AlertTitle>
    <AlertDescription>
      {error === 'Timeout' && 
        'Generation took too long. Try with shorter content.'}
      {error === 'Invalid content' && 
        'Please ensure all required fields are filled.'}
      {error === 'Server error' && 
        'Please try again later.'}
    </AlertDescription>
  </Alert>
)}
```

## Troubleshooting

### Issue: "Video generator not found"
**Solution:** Ensure `ai-feedback-video2` is in the correct path relative to `goprac-frontend`. Check the path construction in `app/api/video/generate/route.ts`.

### Issue: "Azure TTS credentials missing"
**Solution:** Set `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` in your `.env` file. Get keys from Azure Portal.

### Issue: Video generation times out
**Solution:** Check Python process logs. Ensure all dependencies are installed. Reduce content length.

### Issue: "Process error: ENOENT: no such file or directory"
**Solution:** Verify paths are correct. Run `npm run build` in video-app folder. Check file permissions.

## Advanced: Custom Video Properties

To customize video output:

```typescript
// Modify the generateVideo call
const payload = {
  feedbackContent: { slides: {...} },
  quality: '1080p',     // 'HD', '1080p', or '4K'
  fps: 30,              // Frame rate (30 or 60)
  bgColor: '#0b1f33',   // Background color
  duration: 300,        // Max duration in seconds
};
```

Requires modifications to the API route to support these parameters.

## Monitoring & Logging

Monitor video generation in server logs:

```bash
# Backend logs from Python
tail -f /path/to/video-generator-logs.txt

# Frontend API logs
# Check Next.js server console output
```

For production, integrate with your monitoring service (DataDog, Sentry, etc.).

## Security Considerations

1. **Rate Limiting** - Add rate limits to video generation API
2. **Authentication** - Ensure user is authenticated before generating
3. **Authorization** - Validate user owns the feedback content
4. **File Cleanup** - Implement cleanup job for old generated videos
5. **Virus Scanning** - Optionally scan generated files

Example auth check:

```typescript
// In app/api/video/generate/route.ts
import { auth } from '@/lib/auth';  // Your auth library

export async function POST(req: NextRequest) {
  const user = await auth();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... rest of generation logic
}
```

---

## Next Steps

1. ✅ Review the VideoPlayer component
2. ✅ Explore the useVideoGeneration hook
3. ✅ Test with sample feedback content
4. ✅ Integrate into your review/feedback pages
5. ✅ Configure caching and storage strategy
6. ✅ Set up monitoring and alerts
7. ✅ Deploy and monitor in production
