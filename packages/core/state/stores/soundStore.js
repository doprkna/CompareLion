/**
 * Sound Store
 * Zustand store for sound preferences with localStorage persistence
 * v0.41.17 - C3 Step 18: State Migration Batch #1
 */
'use client';
import { createStore } from '../factory';
const STORAGE_KEY = 'soundEnabled';
function getStoredSoundEnabled() {
    if (typeof window === 'undefined')
        return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
}
function setStoredSoundEnabled(enabled) {
    if (typeof window === 'undefined')
        return;
    localStorage.setItem(STORAGE_KEY, String(enabled));
}
// Temporary audio manager (matches useSound.ts implementation)
class AudioManager {
    constructor() {
        this.enabled = false;
    }
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    play(event) {
        if (!this.enabled)
            return;
        // TODO: Implement actual sound playback
        console.log('[Sound]', event);
    }
}
const audioManager = typeof window !== 'undefined' ? new AudioManager() : null;
export const useSoundStore = createStore((set, get) => {
    // Initialize from localStorage
    const initialEnabled = getStoredSoundEnabled();
    if (audioManager) {
        audioManager.setEnabled(initialEnabled);
    }
    return {
        enabled: initialEnabled,
        setEnabled: (enabled) => {
            set({ enabled });
            setStoredSoundEnabled(enabled);
            audioManager?.setEnabled(enabled);
        },
        toggle: () => {
            const current = get().enabled;
            get().setEnabled(!current);
        },
        play: (event) => {
            audioManager?.play(event);
        },
    };
});
