'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { MusicTheme } from '@/lib/music/musicThemes';

export function usePlayTrack() {
  const [currentTrack, setCurrentTrack] = useState<MusicTheme | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load volume from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('parel-music-volume');
    if (saved !== null) {
      setVolume(parseFloat(saved));
    }
  }, []);

  // Save volume to localStorage on change
  useEffect(() => {
    localStorage.setItem('parel-music-volume', String(volume));
  }, [volume]);

  const play = useCallback(async (theme: MusicTheme) => {
    try {
      // Stop current track if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Create new audio element
      const audio = new Audio(theme.url);
      audio.loop = theme.loop;
      audio.volume = volume * theme.volumeDefault;

      // Handle errors gracefully
      audio.onerror = (e) => {
        console.error('[MUSIC] Audio error:', e);
      };

      audioRef.current = audio;

      // Play track
      try {
        await audio.play();
        setCurrentTrack(theme);
        setIsPlaying(true);
      } catch (e) {
        // Auto-play might be blocked, handle gracefully
        console.warn('[MUSIC] Auto-play blocked, user interaction required');
      }
    } catch (e) {
      console.error('[MUSIC] Failed to play track:', e);
    }
  }, [volume]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTrack(null);
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.error('[MUSIC] Failed to resume:', e);
      }
    } else if (currentTrack) {
      // Resume with current track
      await play(currentTrack);
    }
  }, [currentTrack, play]);

  const setTrackVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current && currentTrack) {
      audioRef.current.volume = newVolume * currentTrack.volumeDefault;
    }
  }, [currentTrack]);

  // Update volume when track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.volume = volume * currentTrack.volumeDefault;
    }
  }, [volume, currentTrack]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    currentTrack,
    isPlaying,
    volume,
    play,
    stop,
    pause,
    resume,
    setVolume: setTrackVolume,
  };
}

