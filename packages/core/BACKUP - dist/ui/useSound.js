/**
 * useSound Hook
 * v0.34.5 - Sound feedback system with localStorage persistence
 */
'use client';
import { useState, useEffect, useCallback } from 'react';
// Temporary audio manager implementation
class AudioManager {
    constructor() {
        this.enabled = false;
        this.audioContext = null;
    }
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    play(event) {
        if (!this.enabled)
            return;
        // TODO: Implement actual sound playback
        // For now, just log
        console.log('[Sound]', event);
    }
}
const audioManager = typeof window !== 'undefined' ? new AudioManager() : null;
function getSoundEnabled() {
    if (typeof window === 'undefined')
        return false;
    const stored = localStorage.getItem('soundEnabled');
    return stored === 'true';
}
function setSoundEnabled(enabled) {
    if (typeof window === 'undefined')
        return;
    localStorage.setItem('soundEnabled', String(enabled));
}
function playSound(event) {
    audioManager?.play(event);
}
/**
 * Hook for sound management
 */
export function useSound() {
    const [enabled, setEnabledState] = useState(false);
    // Initialize sound preference from localStorage
    useEffect(() => {
        const stored = getSoundEnabled();
        setEnabledState(stored);
        audioManager?.setEnabled(stored);
    }, []);
    // Set sound enabled and persist to localStorage
    const setEnabled = useCallback((newEnabled) => {
        setEnabledState(newEnabled);
        setSoundEnabled(newEnabled);
        audioManager?.setEnabled(newEnabled);
    }, []);
    // Toggle sound on/off
    const toggle = useCallback(() => {
        setEnabled(!enabled);
    }, [enabled, setEnabled]);
    // Play a sound event
    const play = useCallback((event) => {
        playSound(event);
    }, []);
    return {
        enabled,
        setEnabled,
        toggle,
        play,
    };
}
