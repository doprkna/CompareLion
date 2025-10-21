/**
 * Performance Mode System (v0.11.4)
 * 
 * Toggle for heavy visual effects on low-power devices.
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
 * Detect device capabilities
 */
function detectDeviceCapabilities() {
  if (typeof window === 'undefined') {
    return {
      isLowPower: false,
      prefersReducedMotion: false,
    };
  }
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Check for low-power mode (battery API)
  const isLowPower = 'getBattery' in navigator
    ? false // Will be checked async
    : false;
  
  // Check hardware concurrency (cores)
  const cores = navigator.hardwareConcurrency || 4;
  const isLowEndDevice = cores <= 2;
  
  // Check memory (if available)
  const memory = (navigator as any).deviceMemory;
  const isLowMemory = memory ? memory <= 4 : false;
  
  return {
    isLowPower: isLowEndDevice || isLowMemory,
    prefersReducedMotion,
  };
}

/**
 * Performance mode store
 */
export const usePerformanceMode = create<PerformanceModeState>()(
  persist(
    (set, get) => ({
      performanceMode: false,
      reducedMotion: false,
      particlesEnabled: true,
      glowEffects: true,
      
      setPerformanceMode: (enabled) => {
        set({ 
          performanceMode: enabled,
          particlesEnabled: !enabled,
          glowEffects: !enabled,
        });
      },
      
      setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
      setParticlesEnabled: (enabled) => set({ particlesEnabled: enabled }),
      setGlowEffects: (enabled) => set({ glowEffects: enabled }),
      
      detectAndApply: () => {
        const { isLowPower, prefersReducedMotion } = detectDeviceCapabilities();
        
        if (prefersReducedMotion) {
          set({ reducedMotion: true });
        }
        
        if (isLowPower) {
          set({
            performanceMode: true,
            particlesEnabled: false,
            glowEffects: false,
          });
        }
      },
    }),
    {
      name: 'performance-mode-storage',
    }
  )
);

/**
 * Hook for conditional rendering based on performance mode
 */
export function usePerformanceCheck() {
  const { performanceMode, reducedMotion, particlesEnabled, glowEffects } =
    usePerformanceMode();
  
  return {
    performanceMode,
    reducedMotion,
    particlesEnabled,
    glowEffects,
    
    // Convenience checks
    canAnimate: !reducedMotion && !performanceMode,
    canShowParticles: particlesEnabled && !performanceMode,
    canShowGlow: glowEffects && !performanceMode,
  };
}

/**
 * Get optimized animation duration based on mode
 */
export function getAnimationDuration(
  baseMs: number,
  mode?: 'performanceMode' | 'reducedMotion'
): number {
  const state = usePerformanceMode.getState();
  
  if (state.reducedMotion) return 0;
  if (state.performanceMode) return baseMs * 0.5; // 50% faster
  
  return baseMs;
}

/**
 * Get optimized spring config
 */
export function getSpringConfig(mode?: 'performanceMode') {
  const state = usePerformanceMode.getState();
  
  if (state.reducedMotion) {
    return { duration: 0 };
  }
  
  if (state.performanceMode) {
    return {
      type: 'tween' as const,
      duration: 0.1,
    };
  }
  
  return {
    type: 'spring' as const,
    stiffness: 400,
    damping: 17,
  };
}











