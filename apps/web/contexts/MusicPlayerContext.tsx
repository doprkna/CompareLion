/**
 * Music Player Context
 * v0.22.7 - Centralized audio state management
 * 
 * Single source of truth for audio player:
 * - Queue management (tracks, current index)
 * - Playback state (playing/paused)
 * - Volume & mute controls
 * - Shuffle & loop modes
 * - localStorage persistence
 */

"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_TRACKS, type Track } from "@/lib/audio/tracks";

type Mode = { shuffle: boolean; loop: boolean }; // loop = loop current track

type MusicPlayerState = {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  muted: boolean;
  volume: number; // 0..1
  mode: Mode;
  // actions
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  setVolume: (v: number) => void;
  setMuted: (m: boolean) => void;
  toggleMute: () => void;
  setShuffle: (s: boolean) => void;
  setLoop: (l: boolean) => void;
  setTracks: (t: Track[], startIndex?: number) => void;
};

const MusicPlayerContext = createContext<MusicPlayerState | null>(null);

const LS_KEYS = {
  volume: "mp_volume",
  muted: "mp_muted",
  index: "mp_index",
  shuffle: "mp_shuffle",
  loop: "mp_loop",
};

export const MusicPlayerProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracksState] = useState<Track[]>(DEFAULT_TRACKS);
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return Number(localStorage.getItem(LS_KEYS.index) ?? 0);
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMutedState] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(LS_KEYS.muted) === "true";
  });
  const [volume, setVolumeState] = useState<number>(() => {
    if (typeof window === 'undefined') return 0.25; // Match existing MusicToggle default
    const v = Number(localStorage.getItem(LS_KEYS.volume));
    return isNaN(v) ? 0.25 : Math.max(0, Math.min(1, v));
  });
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === 'undefined') return { shuffle: false, loop: false };
    return {
      shuffle: localStorage.getItem(LS_KEYS.shuffle) === "true",
      loop: localStorage.getItem(LS_KEYS.loop) === "true",
    };
  });

  const safeIndex = useMemo(() => {
    if (!tracks.length) return 0;
    return Math.max(0, Math.min(currentIndex, tracks.length - 1));
  }, [tracks, currentIndex]);

  const src = tracks[safeIndex]?.src;

  // init audio element once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
    }
  }, []);

  // apply src on index or list change
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !src) return;
    a.src = src;
    a.loop = mode.loop || !!tracks[safeIndex]?.loop;
    a.muted = muted;
    a.volume = muted ? 0 : volume;
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_KEYS.index, String(safeIndex));
    }
    // do not auto-play on source switch unless already playing
    if (isPlaying) a.play().catch(() => {});
  }, [src, mode.loop, muted, volume, isPlaying, safeIndex, tracks]);

  // persist prefs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_KEYS.volume, String(volume));
    }
  }, [volume]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_KEYS.muted, String(muted));
    }
  }, [muted]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_KEYS.shuffle, String(mode.shuffle));
    }
  }, [mode.shuffle]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_KEYS.loop, String(mode.loop));
    }
  }, [mode.loop]);

  // auto-advance
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnded = () => {
      if (mode.loop || tracks[safeIndex]?.loop) return; // handled by loop
      next();
    };
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode.loop, safeIndex, tracks]);

  const play = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, []);
  
  const pause = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    setIsPlaying(false);
  }, []);
  
  const toggle = useCallback(() => (isPlaying ? pause() : play()), [isPlaying, play, pause]);

  const next = useCallback(() => {
    if (!tracks.length) return;
    if (mode.shuffle) {
      const r = Math.floor(Math.random() * tracks.length);
      setCurrentIndex(r);
      return;
    }
    setCurrentIndex((i) => (i + 1) % tracks.length);
  }, [tracks, mode.shuffle]);

  const prev = useCallback(() => {
    if (!tracks.length) return;
    setCurrentIndex((i) => (i - 1 + tracks.length) % tracks.length);
  }, [tracks]);

  const setVolume = useCallback((v: number) => {
    const a = audioRef.current;
    const nv = Math.max(0, Math.min(1, v));
    setVolumeState(nv);
    if (a) a.volume = muted ? 0 : nv;
  }, [muted]);

  const setMuted = useCallback((m: boolean) => {
    const a = audioRef.current;
    setMutedState(m);
    if (a) {
      a.muted = m;
      a.volume = m ? 0 : volume;
    }
  }, [volume]);

  const toggleMute = useCallback(() => setMuted(!muted), [muted, setMuted]);
  const setShuffle = useCallback((s: boolean) => setMode((p) => ({ ...p, shuffle: s })), []);
  const setLoop = useCallback((l: boolean) => setMode((p) => ({ ...p, loop: l })), []);

  const setTracks = useCallback((t: Track[], startIndex = 0) => {
    setTracksState(t.length ? t : DEFAULT_TRACKS);
    setCurrentIndex(startIndex);
  }, []);

  const value = useMemo<MusicPlayerState>(() => ({
    tracks, 
    currentIndex: safeIndex, 
    isPlaying, 
    muted, 
    volume, 
    mode,
    play, 
    pause, 
    toggle, 
    next, 
    prev, 
    setVolume, 
    setMuted, 
    toggleMute, 
    setShuffle, 
    setLoop, 
    setTracks
  }), [
    tracks, safeIndex, isPlaying, muted, volume, mode, 
    play, pause, toggle, next, prev, setVolume, setMuted, 
    toggleMute, setShuffle, setLoop, setTracks
  ]);

  return <MusicPlayerContext.Provider value={value}>{children}</MusicPlayerContext.Provider>;
};

export const useMusicPlayer = () => {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error("useMusicPlayer must be used within <MusicPlayerProvider>");
  return ctx;
};

