/**
 * useSound Hook
 * v0.34.5 - Sound feedback system with localStorage persistence
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
// TODO: resolve dependency injection after cleaning @parel/core/config
// Sound utilities need to be moved to @parel/core/config or injected as dependencies
// import {
//   SoundEvent,
//   getSoundEnabled,
//   setSoundEnabled,
//   playSound,
//   audioManager,
// } from '@/lib/ux/sound';

export type SoundEvent = 'click' | 'success' | 'error' | 'notification';

// Temporary audio manager implementation
class AudioManager {
  private enabled: boolean = false;
  private audioContext: AudioContext | null = null;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  play(event: SoundEvent): void {
    if (!this.enabled) return;
    // TODO: Implement actual sound playback
    // For now, just log
    console.log('[Sound]', event);
  }
}

const audioManager = typeof window !== 'undefined' ? new AudioManager() : null;

function getSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('soundEnabled');
  return stored === 'true';
}

function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('soundEnabled', String(enabled));
}

function playSound(event: SoundEvent): void {
  audioManager?.play(event);
}

export interface UseSoundReturn {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  toggle: () => void;
  play: (event: SoundEvent) => void;
}

/**
 * Hook for sound management
 */
export function useSound(): UseSoundReturn {
  const [enabled, setEnabledState] = useState<boolean>(false);

  // Initialize sound preference from localStorage
  useEffect(() => {
    const stored = getSoundEnabled();
    setEnabledState(stored);
    audioManager?.setEnabled(stored);
  }, []);

  // Set sound enabled and persist to localStorage
  const setEnabled = useCallback((newEnabled: boolean) => {
    setEnabledState(newEnabled);
    setSoundEnabled(newEnabled);
    audioManager?.setEnabled(newEnabled);
  }, []);

  // Toggle sound on/off
  const toggle = useCallback(() => {
    setEnabled(!enabled);
  }, [enabled, setEnabled]);

  // Play a sound event
  const play = useCallback((event: SoundEvent) => {
    playSound(event);
  }, []);

  return {
    enabled,
    setEnabled,
    toggle,
    play,
  };
}

