export interface CombatPreferences {
    showDamageNumbers: boolean;
    screenShakeOnCrit: boolean;
    soundEffects: boolean;
    showAnimations: boolean;
    soundEnabled: boolean;
    hapticsEnabled: boolean;
    ambientEnabled: boolean;
}
export declare function useCombatPreferences(): {
    preferences: CombatPreferences;
    updatePreferences: (updates: Partial<CombatPreferences>) => void;
    toggleDamageNumbers: () => void;
    toggleScreenShake: () => void;
    toggleSoundEffects: () => void;
    toggleAnimations: () => void;
    toggleSound: () => void;
    toggleHaptics: () => void;
    toggleAmbient: () => void;
};
