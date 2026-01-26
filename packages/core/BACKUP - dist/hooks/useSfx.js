'use client';
// sanity-fix
/**
 * Sound Effects & Haptic Feedback Hook
 * Lightweight SFX layer for RPG actions
 * v0.26.13 - Sound & Haptic Feedback Layer
 */
'use client';
import { useRef } from 'react';
// Debounce map to prevent spam
const playDebounceMap = new Map();
const DEBOUNCE_MS = 100; // 100ms debounce per sound
export function useSfx(soundEnabled = true, hapticsEnabled = true) {
    // Cache audio elements for better performance
    const audioCache = useRef(new Map());
    const play = (key, volume = 0.4) => {
        if (!soundEnabled)
            return;
        // Debounce: prevent spam
        const now = Date.now();
        if (!playDebounceMap || typeof playDebounceMap.get !== 'function')
            return; // sanity-fix
        const lastPlay = playDebounceMap.get(key) || 0;
        if (now - lastPlay < DEBOUNCE_MS)
            return;
        if (typeof playDebounceMap.set === 'function') { // sanity-fix
            playDebounceMap.set(key, now);
        }
        try {
            if (typeof window === 'undefined' || typeof Audio === 'undefined')
                return; // sanity-fix
            if (!audioCache.current || typeof audioCache.current.get !== 'function')
                return; // sanity-fix
            // Get or create audio element
            let audio = audioCache.current.get(key);
            if (!audio) {
                audio = new Audio(`/sfx/${key}.mp3`);
                audio.volume = Math.min(0.4, Math.max(0, volume)); // Cap at 0.4 default
                audio.preload = 'auto';
                if (typeof audioCache.current.set === 'function') { // sanity-fix
                    audioCache.current.set(key, audio);
                }
            }
            // Reset to start and play
            if (!audio)
                return; // sanity-fix
            audio.currentTime = 0;
            audio.volume = Math.min(0.4, Math.max(0, volume));
            audio.play().catch(() => {
                // Silently fail if autoplay is blocked or file missing
            });
        }
        catch (err) {
            // Silently fail
        }
    };
    const vibrate = (pattern) => {
        if (!hapticsEnabled || typeof navigator === 'undefined' || !navigator.vibrate)
            return; // sanity-fix
        try {
            navigator.vibrate(pattern ?? [30]);
        }
        catch (err) {
            // Silently fail if not supported
        }
    };
    return { play, vibrate };
}
