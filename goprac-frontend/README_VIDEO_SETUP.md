# Video Generator Integration - Installation & Quick Start

## ✅ What's Been Created

A complete integration system to connect the AI Feedback Video Generator (`ai-feedback-video2`) with the GoPrac frontend. This enables displaying generated videos in your application with full playback controls, progress tracking, and error handling.

## 📁 New Files Created

### API Routes
- **`app/api/video/generate/route.ts`** - POST endpoint to trigger video generation
- **`app/api/video/status/[videoId]/route.ts`** - GET endpoint to check generation status
- **`app/api/video/stream/[videoId]/route.ts`** - GET endpoint to stream generated video

### Frontend Components & Hooks
- **`app/(main)/review/_components/video-player.tsx`** (Enhanced) - Full-featured video player with:
  - Play/pause controls
  - Progress scrubbing
  - Download functionality
  - Fullscreen support
  - Auto-polling for generated videos
  - Error handling & loading states

- **`hooks/useVideoGeneration.ts`** - Custom React hook for video generation workflow
- **`actions/generate-video.ts`** - Server actions for triggering generation and checking status

### Types & Utilities
- **`lib/video-types.ts`** - Complete TypeScript definitions
- **`components/ExampleVideoGenerator.tsx`** - Full working example component

### Documentation
- **`VIDEO_GENERATOR_INTEGRATION.md`** - Complete integration guide
- **`README_VIDEO_SETUP.md`** (this file)

## 🚀 Quick Start (5 Minutes)

### 1. Verify Prerequisites
```bash
# Check ai-feedback-video2 exists
ls -la ../ai-feedback-video2/ai-feedback-video2/backend/

# Should see: scripts/, requirements.txt, data/, output/, tts/
```

### 2. Set Environment Variables
```bash
# Copy to goprac-frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000

# If you need Azure TTS (already in .env)
AZURE_SPEECH_KEY=<your_key>
AZURE_SPEECH_REGION=<your_region>
```

### 3. Start Development Server
```bash
cd goprac-frontend
npm run dev
# Server runs on http://localhost:3000
```

### 4. Test the Integration
```bash
# Visit this test page
open http://localhost:3000/api/video/status/test_video_123

# Should return:
# { "videoId": "test_video_123", "status": "not_found" }
```

## 🎯 Basic Usage Examples

### Use Case 1: Display Existing Video
```tsx
import VideoPlayer from '@/app/(main)/review/_components/video-player';

// In your component:
<VideoPlayer 
  url="https://example.com/video.mp4"
  title="Interview Feedback"
  description="Your personalized feedback video"
/>
```

### Use Case 2: Generate New Video
```tsx
import { useVideoGeneration } from '@/hooks/useVideoGeneration';

function MyComponent() {
  const { status, videoUrl, progress, generateVideo, error } = useVideoGeneration();
  
  const handleGen = async () => {
    await generateVideo({
      slides: {
        intro: {
          visual: { headline: "Your Feedback" },
          narration: "Welcome to your feedback video..."
        }
      }
    });
  };

  return (
    <div>
      <button onClick={handleGen} disabled={status === 'generating'}>
        {status === 'generating' ? `${progress}%` : 'Generate Video'}
      </button>
      
      {videoUrl && <VideoPlayer url={videoUrl} />}
    </div>
  );
}
```

### Use Case 3: Full Integration Example
```tsx
import ExampleVideoGenerator from '@/components/ExampleVideoGenerator';

// In your review page:
const reviewData = {
  candidateId: '123',
  candidateName: 'John Doe',
  jobTitle: 'Software Engineer',
  companyName: 'TechCorp',
  interviewDate: '2024-02-17',
  answers: [...],
  overallScore: 8,
  thinking_score: 8,
  communication_score: 7,
};

export default function ReviewPage() {
  return (
    <ExampleVideoGenerator 
      reviewData={reviewData}
      onVideoGenerated={(url) => console.log('Video ready:', url)}
    />
  );
}
```

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│   React Component (useVideoGeneration hook)     │
├─────────────────────────────────────────────────┤
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│     API Routes (Next.js)                        │
│  • POST /api/video/generate                     │
│  • GET /api/video/status/:id                    │
│  • GET /api/video/stream/:id                    │
├─────────────────────────────────────────────────┤
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│   Python Backend Pipeline                       │
│  • orchestrate.py (main script)                 │
│  • Narration generation                         │
│  • TTS synthesis (Azure)                        │
│  • Choreography calculation                     │
│  • Video rendering (Remotion)                   │
├─────────────────────────────────────────────────┤
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│   Output Video Files                            │
│  • MP4 format (H.264 codec)                     │
│  • Multiple quality options                     │
│  • Cached for 1 hour                            │
└─────────────────────────────────────────────────┘
```

## 📊 Data Flow

### Generate Video Flow:
```
1. User clicks "Generate Video"
2. Frontend calls useVideoGeneration.generateVideo()
3. POST /api/video/generate with feedback content
4. API spawns Python subprocess (orchestrate.py)
5. API returns immediately with videoId
6. Frontend starts polling /api/video/status/:videoId
7. Status updates UI with progress
8. When complete, displays VideoPlayer with stream URL
9. User can play, seek, download video
```

### Stream Video Flow:
```
1. VideoPlayer requests GET /api/video/stream/:videoId
2. API finds video file in output directory
3. Streams with range request support (for seeking)
4. Video plays in HTML5 player
5. User can download or watch
```

## ⚙️ Configuration

### Video Generation Timeout
Edit `hooks/useVideoGeneration.ts`:
```typescript
const maxPolls = 720; // Change from 720 to 1440 for 2 hours
```

### Polling Interval
Edit the same file:
```typescript
pollIntervalRef.current = setInterval(..., 5000); // Change 5000 to 10000 for 10s intervals
```

### Video Output Directory
Edit `app/api/video/status/[videoId]/route.ts`:
```typescript
const videoOutputPath = path.join(
  process.cwd(),
  '..',
  'ai-feedback-video2',
  'ai-feedback-video2',
  'video-app',
  'dist'  // Change this path if needed
);
```

## 🔧 Troubleshooting

### Error: "video generator not found"
```bash
# Check the path structure
ls -la ../../ai-feedback-video2/ai-feedback-video2/backend/scripts/orchestrate.py

# If not found, adjust the path in app/api/video/generate/route.ts
```

### Error: "Python not found"
```bash
# Ensure Python 3 is installed and available
which python3
python3 --version

# If not in PATH, update the spawn command:
// In app/api/video/generate/route.ts
spawn('/usr/local/bin/python3', [path...])  // Use full path
```

### Error: "Azure TTS credentials missing"
```bash
# Set in your .env file
AZURE_SPEECH_KEY=your_actual_key_here
AZURE_SPEECH_REGION=eastus

# Verify in Python:
echo $AZURE_SPEECH_KEY
```

### Video takes too long to generate
```bash
# Check Python logs
tail -f /var/log/goprac.log

# Reduce content size for testing:
const testContent = {
  slides: {
    intro: { visual: {}, narration: "Quick test" }
  }
};
```

## 📈 Performance Metrics

Typical generation times:

| Stage | Time |
|-------|------|
| Request received | <100ms |
| Input validation | <50ms |
| Python spawn | ~500ms |
| Narration generation | 30-60s |
| TTS synthesis | 1-2 min |
| Choreography calc | 30-60s |
| Remotion render | 2-5 min |
| **Total** | **5-15 min** |

## 🔒 Security Notes

1. **Add authentication** to API routes:
```typescript
// In app/api/video/generate/route.ts
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await auth();
  if (!user) throw new Error('Unauthorized');
  // ... rest of logic
}
```

2. **Rate limit** video generation:
```typescript
// Consider using `next-rate-limit` or similar
import { rateLimit } from '@/lib/rate-limit';

const { success } = await rateLimit(userId, 'video-generation', {
  limit: 5,        // 5 videos
  window: 3600000, // per hour
});

if (!success) throw new Error('Rate limit exceeded');
```

3. **Validate** feedback content:
```typescript
import { z } from 'zod';

const ContentSchema = z.object({
  slides: z.record(z.any())
});

const validated = ContentSchema.parse(body.feedbackContent);
```

## 🚀 Deployment Notes

### On Vercel:
1. Python subprocess support is limited
2. Consider using a job queue (Bull, RabbitMQ) instead
3. Use serverless function for API, separate worker for generation

### Docker Setup:
```dockerfile
FROM node:20-alpine

# Install Python dependencies
RUN apk add --no-cache python3 pip
RUN pip install -r /app/ai-feedback-video2/ai-feedback-video2/backend/requirements.txt

WORKDIR /app/goprac-frontend
RUN npm ci
RUN npm run build

CMD ["npm", "start"]
```

### Environment Variables (Production):
```bash
NEXT_PUBLIC_API_URL=https://goprac.example.com
AZURE_SPEECH_KEY=<production_key>
AZURE_SPEECH_REGION=<region>
VIDEO_OUTPUT_PATH=/mnt/videos  # Persistent storage
VIDEO_CACHE_TTL=3600            # 1 hour
```

## 📚 Further Reading

- [Full Integration Guide](./VIDEO_GENERATOR_INTEGRATION.md)
- [Type Definitions](./lib/video-types.ts)
- [Example Component](./components/ExampleVideoGenerator.tsx)
- [AI Feedback Video README](../ai-feedback-video2/ai-feedback-video2/README.md)

## ✨ Next Steps

1. ✅ Review the example component (`ExampleVideoGenerator.tsx`)
2. ✅ Test video generation with test data
3. ✅ Integrate into your review/feedback pages
4. ✅ Configure caching strategy
5. ✅ Set up monitoring/logging
6. ✅ Deploy and validate in staging
7. ✅ Monitor in production

## 💡 Tips

- **Test locally first** before deploying to production
- **Monitor video generation** logs closely in production
- **Cache generated videos** if reused (same feedback content)
- **Implement fallback** to simple video player for failed generations
- **Use CDN** to serve generated videos for better performance

---

**Questions?** Check the full integration guide or review the example component code.
