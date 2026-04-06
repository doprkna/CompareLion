/**
 * Sound Effects System (v0.10.4)
 *
 * PLACEHOLDER: Reactive sound cues for user interactions.
 */
export interface SoundConfig {
    eventType: string;
    filePath: string;
    volume: number;
    category: "ui" | "achievement" | "combat" | "ambient";
}
export declare const SOUND_EFFECTS: SoundConfig[];
export declare const AMBIENT_THEMES: {
    theme: string;
    name: string;
    filePath: string;
    volume: number;
    loop: boolean;
}[];
/**
 * PLACEHOLDER: Play sound effect
 */
export declare function playSoundEffect(_eventType: string, _userPreferences?: {
    soundEnabled: boolean;
    soundVolume: number;
}): null;
/**
 * PLACEHOLDER: Play ambient music
 */
export declare function playAmbientMusic(_theme: string, _userPreferences?: {
    ambientMusicEnabled: boolean;
    soundVolume: number;
}): null;
