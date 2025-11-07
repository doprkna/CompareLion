/**
 * Music Toggle Button
 * v0.22.7 - Now synced with MusicPlayerContext
 * 
 * Keeps existing UI/position but now controls the global audio player.
 * Integrated with mini-player for consistent state management.
 */

"use client";
import { Volume2, VolumeX } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

export default function MusicToggle() {
  const { isPlaying, toggle } = useMusicPlayer();

  return (
    <button
      onClick={toggle}
      className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-slate-800 text-white shadow-lg hover:bg-blue-600 transition"
      aria-label="Toggle music"
      title={isPlaying ? "Pause background music" : "Play background music"}
    >
      {isPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </button>
  );
}
