/**
 * Dynamic Feature Flags Layer
 * C6 Step 7: Dynamic Feature Flags + Plugin Extension Points
 * v0.42.23
 * 
 * Provides dynamic flag resolution with multiple layers:
 * 1. Static defaults from config.features.*
 * 2. Environment variable overrides (PAREL_FLAG_*)
 * 3. Remote flag service (stubbed for future implementation)
 * 
 * Includes in-memory cache and evaluation hooks for targeting.
 */

import type { UnifiedConfig, FeaturesConfig } from './schema';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Feature flag name (key of FeaturesConfig, excluding 'environment')
 */
export type FeatureFlagName = Exclude<keyof FeaturesConfig, 'environment'>;

/**
 * Flag evaluation context (for future targeting)
 */
export interface FlagEvaluationContext {
  userId?: string;
  region?: string;
  userSegment?: string;
  [key: string]: unknown;
}

/**
 * Remote flag source (stubbed for future implementation)
 */
interface RemoteFlagSource {
  getFlag(name: FeatureFlagName): Promise<boolean | null>;
  getAllFlags(): Promise<Partial<Record<FeatureFlagName, boolean>> | null>;
}

// ============================================================================
// IN-MEMORY CACHE
// ============================================================================

/**
 * In-memory cache for flag lookups
 * Key: flag name, Value: resolved flag value
 */
const flagCache = new Map<FeatureFlagName, boolean>();

/**
 * Cache TTL in milliseconds (default: 5 minutes)
 */
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Cache entry with timestamp
 */
interface CacheEntry {
  value: boolean;
  timestamp: number;
}

const flagCacheWithTTL = new Map<FeatureFlagName, CacheEntry>();

/**
 * Get cached flag value if still valid
 */
function getCachedFlag(name: FeatureFlagName): boolean | null {
  const entry = flagCacheWithTTL.get(name);
  if (!entry) {
    return null;
  }

  const age = Date.now() - entry.timestamp;
  if (age > CACHE_TTL_MS) {
    flagCacheWithTTL.delete(name);
    return null;
  }

  return entry.value;
}

/**
 * Cache a flag value
 */
function cacheFlag(name: FeatureFlagName, value: boolean): void {
  flagCacheWithTTL.set(name, {
    value,
    timestamp: Date.now(),
  });
}

/**
 * Clear flag cache (useful for testing or forced refresh)
 */
export function clearFlagCache(): void {
  flagCache.clear();
  flagCacheWithTTL.clear();
}

// ============================================================================
// ENVIRONMENT VARIABLE OVERRIDES
// ============================================================================

/**
 * Get flag override from environment variable
 * Format: PAREL_FLAG_<FLAG_NAME>
 * Example: PAREL_FLAG_ENABLE_THEMES=true
 */
function getEnvFlagOverride(name: FeatureFlagName): boolean | null {
  const envKey = `PAREL_FLAG_${name.toUpperCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '')}`;
  const envValue = process.env[envKey];
  
  if (envValue === undefined) {
    return null;
  }

  // Parse boolean from env var
  if (envValue === 'true' || envValue === '1') {
    return true;
  }
  if (envValue === 'false' || envValue === '0') {
    return false;
  }

  // Invalid value, return null
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[Flags] Invalid env value for ${envKey}: ${envValue}. Expected 'true'/'1' or 'false'/'0'.`);
  }
  
  return null;
}

// ============================================================================
// REMOTE FLAG SERVICE (STUBBED)
// ============================================================================

/**
 * Remote flag service instance (stubbed)
 * Future implementation will fetch from API or remote config service
 */
let remoteFlagSource: RemoteFlagSource | null = null;

/**
 * Set remote flag source (for future implementation)
 */
export function setRemoteFlagSource(source: RemoteFlagSource): void {
  remoteFlagSource = source;
}

/**
 * Get flag from remote source (stubbed, returns null)
 */
async function getRemoteFlag(name: FeatureFlagName): Promise<boolean | null> {
  if (!remoteFlagSource) {
    return null;
  }

  try {
    return await remoteFlagSource.getFlag(name);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Flags] Failed to fetch remote flag ${name}:`, error);
    }
    return null;
  }
}

// ============================================================================
// FLAG RESOLUTION
// ============================================================================

/**
 * Resolve feature flag value with layer priority:
 * 1. Cache (if valid)
 * 2. Environment variable override (PAREL_FLAG_*)
 * 3. Remote flag service (async, stubbed)
 * 4. Static default from config.features.*
 * 
 * @param name - Flag name
 * @param config - Unified config (for static defaults)
 * @returns Resolved flag value
 */
export async function getFeatureFlag(
  name: FeatureFlagName,
  config: UnifiedConfig
): Promise<boolean> {
  // Check cache first
  const cached = getCachedFlag(name);
  if (cached !== null) {
    return cached;
  }

  // Layer 1: Environment variable override (highest priority)
  const envOverride = getEnvFlagOverride(name);
  if (envOverride !== null) {
    cacheFlag(name, envOverride);
    return envOverride;
  }

  // Layer 2: Remote flag service (async, stubbed for now)
  const remoteFlag = await getRemoteFlag(name);
  if (remoteFlag !== null) {
    cacheFlag(name, remoteFlag);
    return remoteFlag;
  }

  // Layer 3: Static default from config.features.* (fallback)
  const staticValue = config.features[name];
  if (typeof staticValue === 'boolean') {
    cacheFlag(name, staticValue);
    return staticValue;
  }

  // Fallback to false if flag doesn't exist
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[Flags] Flag ${name} not found, defaulting to false`);
  }
  
  const defaultValue = false;
  cacheFlag(name, defaultValue);
  return defaultValue;
}

/**
 * Synchronous version of getFeatureFlag (uses static config only)
 * For use cases where async is not possible
 */
export function getFeatureFlagSync(
  name: FeatureFlagName,
  config: UnifiedConfig
): boolean {
  // Check cache first
  const cached = getCachedFlag(name);
  if (cached !== null) {
    return cached;
  }

  // Layer 1: Environment variable override
  const envOverride = getEnvFlagOverride(name);
  if (envOverride !== null) {
    cacheFlag(name, envOverride);
    return envOverride;
  }

  // Layer 2: Static default from config.features.*
  const staticValue = config.features[name];
  if (typeof staticValue === 'boolean') {
    cacheFlag(name, staticValue);
    return staticValue;
  }

  // Fallback to false
  const defaultValue = false;
  cacheFlag(name, defaultValue);
  return defaultValue;
}

// ============================================================================
// FLAG EVALUATION (FOR FUTURE TARGETING)
// ============================================================================

/**
 * Evaluate feature flag with context (for future targeting)
 * Currently returns the same as getFeatureFlag, but can be extended
 * to support user segments, regions, A/B testing, etc.
 * 
 * @param name - Flag name
 * @param config - Unified config
 * @param context - Evaluation context (user, region, segment, etc.)
 * @returns Resolved flag value
 */
export async function evaluateFlag(
  name: FeatureFlagName,
  config: UnifiedConfig,
  context?: FlagEvaluationContext
): Promise<boolean> {
  // For now, just delegate to getFeatureFlag
  // Future: Add targeting logic based on context
  // Example: if (context?.userSegment === 'beta') return true;
  
  return getFeatureFlag(name, config);
}

/**
 * Synchronous version of evaluateFlag
 */
export function evaluateFlagSync(
  name: FeatureFlagName,
  config: UnifiedConfig,
  context?: FlagEvaluationContext
): boolean {
  // For now, just delegate to getFeatureFlagSync
  // Future: Add targeting logic based on context
  
  return getFeatureFlagSync(name, config);
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Get multiple flags at once (async)
 */
export async function getFeatureFlags(
  names: FeatureFlagName[],
  config: UnifiedConfig
): Promise<Record<FeatureFlagName, boolean>> {
  const results: Partial<Record<FeatureFlagName, boolean>> = {};
  
  await Promise.all(
    names.map(async (name) => {
      results[name] = await getFeatureFlag(name, config);
    })
  );
  
  return results as Record<FeatureFlagName, boolean>;
}

/**
 * Get multiple flags at once (sync)
 */
export function getFeatureFlagsSync(
  names: FeatureFlagName[],
  config: UnifiedConfig
): Record<FeatureFlagName, boolean> {
  const results: Partial<Record<FeatureFlagName, boolean>> = {};
  
  for (const name of names) {
    results[name] = getFeatureFlagSync(name, config);
  }
  
  return results as Record<FeatureFlagName, boolean>;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { FeatureFlagName, FlagEvaluationContext, RemoteFlagSource };
