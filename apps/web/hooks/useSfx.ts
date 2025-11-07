/**
 * Sound Effects & Haptic Feedback Hook
 * Lightweight SFX layer for RPG actions
 * v0.26.13 - Sound & Haptic Feedback Layer
 */

'use client';

import { useRef } from 'react';

interface UseSfxReturn {
  play: (key: string, volume?: number) => void;
  vibrate: (pattern?: number[]) => void;
}

// Debounce map to prevent spam
const playDebounceMap = new Map<string, number>();
const DEBOUNCE_MS = 100; // 100ms debounce per sound

export function useSfx(
  soundEnabled: boolean = true,
  hapticsEnabled: boolean = true
): UseSfxReturn {
  // Cache audio elements for better performance
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());
  
  const play = (key: string, volume: number = 0.4) => {
    if (!soundEnabled) return;
    
    // Debounce: prevent spam
    const now = Date.now();
    const lastPlay = playDebounceMap.get(key) || 0;
    if (now - lastPlay < DEBOUNCE_MS) return;
    playDebounceMap.set(key, now);
    
    try {
      // Get or create audio element
      let audio = audioCache.current.get(key);
      if (!audio) {
        audio = new Audio(`/sfx/${key}.mp3`);
        audio.volume = Math.min(0.4, Math.max(0, volume)); // Cap at 0.4 default
        audio.preload = 'auto';
        audioCache.current.set(key, audio);
      }
      
      // Reset to start and play
      audio.currentTime = 0;
      audio.volume = Math.min(0.4, Math.max(0, volume));
      audio.play().catch(() => {
        // Silently fail if autoplay is blocked or file missing
      });
    } catch (err) {
      // Silently fail
    }
  };
  
  const vibrate = (pattern?: number[]) => {
    if (!hapticsEnabled || !navigator.vibrate) return;
    
    try {
      navigator.vibrate(pattern ?? [30]);
    } catch (err) {
      // Silently fail if not supported
    }
  };
  
  return { play, vibrate };
}









