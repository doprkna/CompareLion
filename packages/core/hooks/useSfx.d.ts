/**
 * Sound Effects & Haptic Feedback Hook
 * Lightweight SFX layer for RPG actions
 * v0.26.13 - Sound & Haptic Feedback Layer
 */
interface UseSfxReturn {
    play: (key: string, volume?: number) => void;
    vibrate: (pattern?: number[]) => void;
}
export declare function useSfx(soundEnabled?: boolean, hapticsEnabled?: boolean): UseSfxReturn;
export {};
