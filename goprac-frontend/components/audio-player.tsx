"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Loader2, Flag } from "lucide-react";
import { generateSpeechFromText } from "@/actions/generate-speech";
import { Badge } from "./ui/badge";

interface AudioPlayerProps extends FlagProps {
  txt: string;
  index?: number;
}

export interface FlagProps {
  flagValue: string;
}


//  function FlagPill({ flagValue }: FlagProps) {
//   console.log("FLAGVALUE:", flagValue);
//   const flagColor = flagColorMap[flagValue.malpracticeName] || 'text-gray-500';
//   return (
//     <Badge className={`bg-blue-100 text-blue-600 text-sm font-medium ${flagColor}`}>
//       {flagValue.malpracticeName} :
//       {flagValue.malpracticeValue}
//     </Badge>
//   );
// }




export default function AudioPlayer({ index, txt, flagValue }: AudioPlayerProps) {
  const [text, setText] = useState("");
  const [audioData, setAudioData] = useState<string | null>(null);
  const [transcription, setTranscription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setText(txt);
  }, [txt]);

  useEffect(() => {
    const callSubmit = () => {
      if (index == 1) {
        handleSubmit();
      }
    };

    callSubmit();
  }, [text]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioData]);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateSpeechFromText(text);

      if (result.success && "audioBytes" in result) {
        // console.log(result);
        const audioBlob = new Blob([new Uint8Array(result.audioBytes)], {
          type: result.mimeType,
        });
        const audioData = URL.createObjectURL(audioBlob);

        setAudioData(audioData);
        // setTranscription(result.text);
      } else {
        setError("Failed to generate speech. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioData) {
      handleSubmit();
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const resetAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };


  // console.log("audioData", audioData);
  // console.log("transcription", transcription);

  // useEffect(() => {
  //   if (!audioData || !audioRef.current) return;

  //   // Automatically play the audio when audioData is set
  //   const playAudio = async () => {
  //     try {
  //       await audioRef.current?.play();
  //       setIsPlaying(true);
  //     } catch (err) {
  //       console.error("Auto-play failed:", err);
  //     }
  //   };

  //   playAudio();
  // }, [audioData]);

  // const malpracticeData = {
  //   malpracticeName: "Genuine",
  //   malpracticeValue: "6"
  // }

  return (
    <Card className="w-full py-3">
      <CardContent className="">
        <div className="space-y-2">
          {/* <h3 className="text-lg font-medium mb-2">Response</h3> */}
          <div className="flex items-center gap-2"><Badge className="bg-blue-100 text-blue-600">Response Text</Badge>

          </div>
          <div className="p-4 bg-muted rounded-md text-sm h-[170px] overflow-y-scroll">{text}</div>
        </div>
        <div className="space-y-2 mt-2">
          <audio ref={audioRef} src={audioData} className="hidden" />
          <Badge className="bg-blue-100 text-blue-600">
            Response Synthetic Voice (For Anonymity)
          </Badge>
          <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-primary rounded-full"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between mx-auto">
            <div className="flex items-center space-x-2 ">
              <form onSubmit={togglePlayPause} className="">
                <Button
                  className="bg-primary text-white hover:bg-primary/90 hover:text-white "
                  variant="outline"
                  size="icon"
                  type="submit"
                  aria-label={isPlaying ? "Pause" : "Play"}
                  disabled={isLoading || !text.trim()}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </form>
              <Button
                className="bg-primary text-white hover:bg-primary/90 hover:text-white "
                variant="outline"
                size="icon"
                onClick={resetAudio}
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              {isLoading && (
                <p className="text-sm text-muted-foreground">Loading...</p>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration || 0)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
