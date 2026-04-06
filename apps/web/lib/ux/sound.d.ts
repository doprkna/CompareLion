/**
 * Sound Utilities
 * v0.34.5 - Lightweight sound feedback system
 */
export type SoundEvent = 'xp_gain' | 'mission_complete' | 'error' | 'level_up' | 'click' | 'success';
export interface SoundConfig {
    event: SoundEvent;
    file: string;
    volume: number;
}
/**
 * Sound event configurations
 */
export declare const SOUNDS: Record<SoundEvent, SoundConfig>;
/**
 * LocalStorage key for sound preference
 */
export declare const SOUND_STORAGE_KEY = "soundEnabled";
/**
 * Get sound preference from localStorage
 */
export declare function getSoundEnabled(): boolean;
/**
 * Store sound preference in localStorage
 */
export declare function setSoundEnabled(enabled: boolean): void;
/**
 * Audio manager class (singleton)
 */
declare class AudioManager {
    private audioCache;
    private enabled;
    constructor();
    /**
     * Preload all sound files
     */
    private preloadSounds;
    /**
     * Play a sound event
     */
    play(event: SoundEvent): void;
    /**
     * Enable/disable all sounds
     */
    setEnabled(enabled: boolean): void;
    /**
     * Get current enabled status
     */
    isEnabled(): boolean;
    /**
     * Set volume for a specific sound
     */
    setVolume(event: SoundEvent, volume: number): void;
}
/**
 * Global audio manager instance
 */
export declare const audioManager: AudioManager | null;
/**
 * Helper function to play a sound
 */
export declare function playSound(event: SoundEvent): void;
export {};
