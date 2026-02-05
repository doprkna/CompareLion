"use client";
import { useState, useEffect } from "react";
const DEFAULT_PREFERENCES = {
    showDamageNumbers: true,
    screenShakeOnCrit: true,
    soundEffects: false, // Legacy: Off by default to avoid annoyance
    showAnimations: true, // v0.26.12 - Animations enabled by default
    soundEnabled: true, // v0.26.13 - Sound enabled by default
    hapticsEnabled: typeof window !== 'undefined' && 'vibrate' in navigator, // v0.26.13 - Haptics enabled on mobile
    ambientEnabled: true, // v0.26.14 - Ambient backgrounds enabled by default
};
const STORAGE_KEY = "parel_combat_prefs";
export function useCombatPreferences() {
    const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
    const [isClient, setIsClient] = useState(false);
    // Load preferences on mount
    // v0.41.21 - Conflict zone hardening: added null guards
    useEffect(() => {
        setIsClient(true);
        if (typeof window === 'undefined')
            return; // sanity-fix
        const stored = localStorage.getItem(STORAGE_KEY);
        // Guard: ensure stored value exists and is not empty
        if (stored && stored.trim().length > 0) {
            try {
                const parsed = JSON.parse(stored);
                // Guard: ensure parsed result is valid object
                if (parsed && typeof parsed === 'object') {
                    setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
                }
                else {
                    console.warn("[CombatPrefs] Invalid stored preferences format, using defaults");
                }
            }
            catch (e) {
                // Consistent error handling (keep console.warn but add null guards)
                console.warn("[CombatPrefs] Invalid stored preferences, using defaults:", e instanceof Error ? e.message : 'Unknown error');
            }
        }
    }, []);
    // Save preferences to localStorage
    const updatePreferences = (updates) => {
        const newPrefs = { ...preferences, ...updates };
        setPreferences(newPrefs);
        if (isClient) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
        }
    };
    const toggleDamageNumbers = () => updatePreferences({ showDamageNumbers: !preferences.showDamageNumbers });
    const toggleScreenShake = () => updatePreferences({ screenShakeOnCrit: !preferences.screenShakeOnCrit });
    const toggleSoundEffects = () => updatePreferences({ soundEffects: !preferences.soundEffects });
    const toggleAnimations = () => updatePreferences({ showAnimations: !preferences.showAnimations });
    const toggleSound = () => updatePreferences({ soundEnabled: !preferences.soundEnabled });
    const toggleHaptics = () => updatePreferences({ hapticsEnabled: !preferences.hapticsEnabled });
    const toggleAmbient = () => updatePreferences({ ambientEnabled: !preferences.ambientEnabled });
    return {
        preferences,
        updatePreferences,
        toggleDamageNumbers,
        toggleScreenShake,
        toggleSoundEffects,
        toggleAnimations, // v0.26.12
        toggleSound, // v0.26.13
        toggleHaptics, // v0.26.13
        toggleAmbient, // v0.26.14
    };
}
