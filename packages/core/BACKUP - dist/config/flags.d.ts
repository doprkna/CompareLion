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
/**
 * Clear flag cache (useful for testing or forced refresh)
 */
export declare function clearFlagCache(): void;
/**
 * Set remote flag source (for future implementation)
 */
export declare function setRemoteFlagSource(source: RemoteFlagSource): void;
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
export declare function getFeatureFlag(name: FeatureFlagName, config: UnifiedConfig): Promise<boolean>;
/**
 * Synchronous version of getFeatureFlag (uses static config only)
 * For use cases where async is not possible
 */
export declare function getFeatureFlagSync(name: FeatureFlagName, config: UnifiedConfig): boolean;
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
export declare function evaluateFlag(name: FeatureFlagName, config: UnifiedConfig, context?: FlagEvaluationContext): Promise<boolean>;
/**
 * Synchronous version of evaluateFlag
 */
export declare function evaluateFlagSync(name: FeatureFlagName, config: UnifiedConfig, context?: FlagEvaluationContext): boolean;
/**
 * Get multiple flags at once (async)
 */
export declare function getFeatureFlags(names: FeatureFlagName[], config: UnifiedConfig): Promise<Record<FeatureFlagName, boolean>>;
/**
 * Get multiple flags at once (sync)
 */
export declare function getFeatureFlagsSync(names: FeatureFlagName[], config: UnifiedConfig): Record<FeatureFlagName, boolean>;
export type { FeatureFlagName, FlagEvaluationContext, RemoteFlagSource };
