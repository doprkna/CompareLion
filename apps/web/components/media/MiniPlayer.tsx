/**
 * Mini Audio Player
 * v0.22.7 - Persistent bottom-bar audio controls
 * 
 * Features:
 * - Play/Pause/Next/Prev controls
 * - Volume slider with mute toggle
 * - Shuffle & loop modes
 * - Compact, unobtrusive design
 */

"use client";
import React from "react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

export default function MiniPlayer() {
  const { 
    tracks, 
    currentIndex, 
    isPlaying, 
    muted, 
    volume, 
    mode,
    toggle, 
    next, 
    prev, 
    setVolume, 
    toggleMute, 
    setShuffle, 
    setLoop 
  } = useMusicPlayer();

  const t = tracks[currentIndex];
  if (!t) return null;

  // Don't show mini player for placeholder track (silent)
  if (t.id === "silent-1s") return null;

  return (
    <div 
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30
                 rounded-2xl shadow-2xl px-4 py-2 
                 bg-black/70 dark:bg-black/80 text-white
                 backdrop-blur-lg border border-white/10
                 flex items-center gap-3 text-sm"
    >
      {/* Previous */}
      <button 
        onClick={prev} 
        aria-label="Previous track"
        className="hover:scale-110 transition-transform"
      >
        ⏮️
      </button>

      {/* Play/Pause */}
      <button 
        onClick={toggle} 
        aria-label={isPlaying ? "Pause" : "Play"}
        className="hover:scale-110 transition-transform text-lg"
      >
        {isPlaying ? "⏸️" : "▶️"}
      </button>

      {/* Next */}
      <button 
        onClick={next} 
        aria-label="Next track"
        className="hover:scale-110 transition-transform"
      >
        ⏭️
      </button>

      {/* Track Info */}
      <div className="mx-2 truncate max-w-[200px]">
        <div className="font-medium text-sm">{t.title}</div>
        {t.artist && (
          <div className="text-xs text-gray-300">{t.artist}</div>
        )}
      </div>

      {/* Mute Toggle */}
      <button 
        onClick={toggleMute} 
        aria-label={muted ? "Unmute" : "Mute"}
        className="hover:scale-110 transition-transform"
      >
        {muted ? "🔇" : "🔊"}
      </button>

      {/* Volume Slider */}
      <input
        type="range" 
        min={0} 
        max={1} 
        step={0.01}
        value={muted ? 0 : volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="w-24 accent-blue-500"
        aria-label="Volume"
      />

      {/* Shuffle Toggle */}
      <label className="ml-2 text-xs flex items-center gap-1 cursor-pointer hover:text-blue-300 transition-colors">
        <input 
          type="checkbox" 
          checked={mode.shuffle} 
          onChange={(e) => setShuffle(e.target.checked)}
          className="cursor-pointer" 
        />
        <span>🔀</span>
      </label>

      {/* Loop Toggle */}
      <label className="ml-1 text-xs flex items-center gap-1 cursor-pointer hover:text-blue-300 transition-colors">
        <input 
          type="checkbox" 
          checked={mode.loop} 
          onChange={(e) => setLoop(e.target.checked)}
          className="cursor-pointer"
        />
        <span>🔁</span>
      </label>
    </div>
  );
}

