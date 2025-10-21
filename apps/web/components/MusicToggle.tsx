"use client";
import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function MusicToggle() {
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = new Audio("/audio/lofi-loop.mp3");
    el.loop = true;
    el.volume = 0.25;
    setAudio(el);
    return () => {
      el.pause();
      el.src = "";
    };
  }, []);

  useEffect(() => {
    if (!audio) return;
    if (playing) {
      audio.play().catch(() => {
        console.warn("Audio playback blocked by browser");
        setPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [playing, audio]);

  return (
    <button
      onClick={() => setPlaying((p) => !p)}
      className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-slate-800 text-white shadow-lg hover:bg-blue-600 transition"
      aria-label="Toggle music"
      title={playing ? "Mute background music" : "Play background music"}
    >
      {playing ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </button>
  );
}
