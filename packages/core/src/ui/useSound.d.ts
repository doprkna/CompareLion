/**
 * useSound Hook
 * v0.34.5 - Sound feedback system with localStorage persistence
 */
export type SoundEvent = 'click' | 'success' | 'error' | 'notification';
export interface UseSoundReturn {
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
    toggle: () => void;
    play: (event: SoundEvent) => void;
}
/**
 * Hook for sound management
 */
export declare function useSound(): UseSoundReturn;
