"use server"

import { experimental_generateSpeech as generateSpeech } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateSpeechFromText(text: string) {
  try {
    const result = await generateSpeech({
      model: openai.speech("gpt-4o-mini-tts"),
      text,
      voice: "alloy",
      providerOptions: {
        openai: {
          response_format: "mp3",
          speed: 1.0,
        },
      },
    })

    // const audioBytes = result.audio.uint8Array;
    // const mimeType = result.audio.mimeType || "audio/mpeg";

    // Create a Blob and a URL for playback
    // const audioBlob = new Blob([audioBytes], { type: mimeType });
    // const audioUrl = URL.createObjectURL(audioBlob);

      return {
    success: true,
    audioBytes: result.audio.uint8Array,
    mimeType: result.audio.mimeType || "audio/mpeg",
    text,
  };

    // return {
    //   success: true,
    //   audioData: audioUrl,
    //   text,
    // };
  } catch (error) {
    console.error("Error generating speech:", error)
    return {
      success: false,
      error: "Failed to generate speech",
    }
  }
}
