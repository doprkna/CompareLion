/**
 * Sound Store
 * Zustand store for sound preferences with localStorage persistence
 * v0.41.17 - C3 Step 18: State Migration Batch #1
 */

'use client';

import { createStore } from '../factory';

interface SoundState {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  toggle: () => void;
  play: (event: 'click' | 'success' | 'error' | 'notification') => void;
}

const STORAGE_KEY = 'soundEnabled';

function getStoredSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'true';
}

function setStoredSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, String(enabled));
}

// Temporary audio manager (matches useSound.ts implementation)
class AudioManager {
  private enabled: boolean = false;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  play(event: 'click' | 'success' | 'error' | 'notification'): void {
    if (!this.enabled) return;
    // TODO: Implement actual sound playback
    console.log('[Sound]', event);
  }
}

const audioManager = typeof window !== 'undefined' ? new AudioManager() : null;

export const useSoundStore = createStore<SoundState>((set, get) => {
  // Initialize from localStorage
  const initialEnabled = getStoredSoundEnabled();
  if (audioManager) {
    audioManager.setEnabled(initialEnabled);
  }

  return {
    enabled: initialEnabled,

    setEnabled: (enabled: boolean) => {
      set({ enabled });
      setStoredSoundEnabled(enabled);
      audioManager?.setEnabled(enabled);
    },

    toggle: () => {
      const current = get().enabled;
      get().setEnabled(!current);
    },

    play: (event: 'click' | 'success' | 'error' | 'notification') => {
      audioManager?.play(event);
    },
  };
});

