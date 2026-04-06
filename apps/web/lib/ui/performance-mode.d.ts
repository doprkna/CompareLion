/**
 * Performance Mode System (v0.11.4)
 *
 * Toggle for heavy visual effects on low-power devices.
 */
interface PerformanceModeState {
    performanceMode: boolean;
    reducedMotion: boolean;
    particlesEnabled: boolean;
    glowEffects: boolean;
    setPerformanceMode: (enabled: boolean) => void;
    setReducedMotion: (enabled: boolean) => void;
    setParticlesEnabled: (enabled: boolean) => void;
    setGlowEffects: (enabled: boolean) => void;
    detectAndApply: () => void;
}
/**
 * Performance mode store
 */
export declare const usePerformanceMode: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<PerformanceModeState>, "setState" | "persist"> & {
    setState(partial: PerformanceModeState | Partial<PerformanceModeState> | ((state: PerformanceModeState) => PerformanceModeState | Partial<PerformanceModeState>), replace?: false | undefined): unknown;
    setState(state: PerformanceModeState | ((state: PerformanceModeState) => PerformanceModeState), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<PerformanceModeState, PerformanceModeState, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: PerformanceModeState) => void) => () => void;
        onFinishHydration: (fn: (state: PerformanceModeState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<PerformanceModeState, PerformanceModeState, unknown>>;
    };
}>;
/**
 * Hook for conditional rendering based on performance mode
 */
export declare function usePerformanceCheck(): {
    performanceMode: boolean;
    reducedMotion: boolean;
    particlesEnabled: boolean;
    glowEffects: boolean;
    canAnimate: boolean;
    canShowParticles: boolean;
    canShowGlow: boolean;
};
/**
 * Get optimized animation duration based on mode
 */
export declare function getAnimationDuration(baseMs: number, mode?: 'performanceMode' | 'reducedMotion'): number;
/**
 * Get optimized spring config
 */
export declare function getSpringConfig(mode?: 'performanceMode'): {
    duration: number;
    type?: undefined;
    stiffness?: undefined;
    damping?: undefined;
} | {
    type: "tween";
    duration: number;
    stiffness?: undefined;
    damping?: undefined;
} | {
    type: "spring";
    stiffness: number;
    damping: number;
    duration?: undefined;
};
export {};
