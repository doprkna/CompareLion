/**
 * useSound Hook
 * v0.34.5 - Sound feedback system with localStorage persistence
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  SoundEvent,
  getSoundEnabled,
  setSoundEnabled,
  playSound,
  audioManager,
} from '@/lib/ux/sound';

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



