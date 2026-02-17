import React from "react";

interface VideoPlayerProps {
  url?: string;
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  const videoUrl = url || "";

  return (
    <div className="my-6 flex justify-center">
      <video
        controls
        width="100%"
        src={videoUrl}
        className="rounded-lg shadow-md"
      />
    </div>
  );
}