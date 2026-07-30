import React, { useState, useRef } from "react";
import { Play, Square, Loader2, Volume2 } from "lucide-react";
import { motion } from "motion/react";

interface StoryViewProps {
  imageBase64: string;
  openingParagraph: string;
}

export default function StoryView({ imageBase64, openingParagraph }: StoryViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleReadAloud = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) {
      // Audio already fetched, just play
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    setIsLoadingAudio(true);
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: openingParagraph }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate audio");
      }

      const data = await response.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/pcm;rate=24000;base64,${data.audio}`);
        audioRef.current = audio;
        
        audio.onended = () => setIsPlaying(false);
        audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Audio generation failed:", error);
      alert("Failed to generate audio.");
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-950">
        <img 
          src={imageBase64} 
          alt="Story prompt" 
          className="w-full h-full object-cover opacity-90 transition-opacity duration-700 ease-in-out" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      
      <div className="p-8 flex flex-col flex-1 relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-serif text-neutral-900 dark:text-neutral-100">
            The Opening Scene
          </h2>
          <button
            onClick={handleReadAloud}
            disabled={isLoadingAudio}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isPlaying
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {isLoadingAudio ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <Square className="w-4 h-4 fill-current" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            {isLoadingAudio ? "Preparing Audio..." : isPlaying ? "Stop Audio" : "Read Aloud"}
          </button>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg leading-relaxed font-serif text-neutral-800 dark:text-neutral-200 first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-amber-500 dark:first-letter:text-amber-400">
            {openingParagraph}
          </p>
        </div>
      </div>
    </div>
  );
}
