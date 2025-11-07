"use client";
import { useState, useEffect } from "react";

export interface CombatPreferences {
  showDamageNumbers: boolean;
  screenShakeOnCrit: boolean;
  soundEffects: boolean;
  showAnimations: boolean; // v0.26.12 - Enable battle animations
  soundEnabled: boolean; // v0.26.13 - Sound effects enabled
  hapticsEnabled: boolean; // v0.26.13 - Haptic feedback enabled
  ambientEnabled: boolean; // v0.26.14 - Animated background ambience
}

const DEFAULT_PREFERENCES: CombatPreferences = {
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
  const [preferences, setPreferences] = useState<CombatPreferences>(DEFAULT_PREFERENCES);
  const [isClient, setIsClient] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch (e) {
        console.warn("[CombatPrefs] Invalid stored preferences, using defaults");
      }
    }
  }, []);

  // Save preferences to localStorage
  const updatePreferences = (updates: Partial<CombatPreferences>) => {
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    if (isClient) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
    }
  };

  const toggleDamageNumbers = () =>
    updatePreferences({ showDamageNumbers: !preferences.showDamageNumbers });

  const toggleScreenShake = () =>
    updatePreferences({ screenShakeOnCrit: !preferences.screenShakeOnCrit });

  const toggleSoundEffects = () =>
    updatePreferences({ soundEffects: !preferences.soundEffects });

  const toggleAnimations = () =>
    updatePreferences({ showAnimations: !preferences.showAnimations });

  const toggleSound = () =>
    updatePreferences({ soundEnabled: !preferences.soundEnabled });

  const toggleHaptics = () =>
    updatePreferences({ hapticsEnabled: !preferences.hapticsEnabled });

  const toggleAmbient = () =>
    updatePreferences({ ambientEnabled: !preferences.ambientEnabled });

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


