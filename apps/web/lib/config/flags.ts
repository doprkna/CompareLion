/**
 * Feature Flags Configuration
 * Centralized feature toggle system
 * v0.34.9 - Feature Flags File
 * 
 * Usage:
 * ```ts
 * import { getFlags } from '@/lib/config/flags';
 * const flags = getFlags();
 * if (flags.enableThemes) { ... }
 * ```
 */

/**
 * Get all feature flags
 * This is the single source of truth for feature toggles
 */
export const getFlags = () => ({
  // Core features
  enableBase: true,
  enableTrials: true,
  enableThemes: true,
  enableEconomyV2: false,
  
  // Analytics & monitoring
  enableAnalytics: process.env.ENABLE_ANALYTICS === '1' || process.env.ENABLE_ANALYTICS === 'true',
  
  // Environment
  environment: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
});

/**
 * Type definition for feature flags
 * Auto-generated from getFlags return type
 */
export type FeatureFlags = ReturnType<typeof getFlags>;

/**
 * Get a specific flag value
 * @param flagName - Name of the flag to retrieve
 * @returns The flag value or undefined if not found
 */
export const getFlag = <K extends keyof FeatureFlags>(flagName: K): FeatureFlags[K] => {
  const flags = getFlags();
  return flags[flagName];
};

/**
 * Check if we are in development mode
 */
export const isDevelopment = (): boolean => {
  return getFlags().environment === 'development';
};

/**
 * Check if we are in production mode
 */
export const isProduction = (): boolean => {
  return getFlags().environment === 'production';
};
