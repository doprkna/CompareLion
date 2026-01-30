/**
 * useSound Hook
 * v0.34.5 - Sound feedback system with localStorage persistence
 * v0.41.17 - Migrated to unified state store
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
 * Now uses unified Zustand store
 */
export declare function useSound(): UseSoundReturn;
