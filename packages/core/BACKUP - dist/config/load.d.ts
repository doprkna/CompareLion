/**
 * Config Runtime Loader
 * C6 Step 6: Validation Engine + Environment Layering
 * v0.42.22
 *
 * Orchestrates config loading, merging, validation, and freezing.
 * This is the main entrypoint for loading the unified config.
 */
import type { UnifiedConfig, PartialUnifiedConfig, ConfigValidationResult } from './schema';
import { validateConfig } from './schema';
/**
 * Deep merge utility for config overrides
 * Arrays are replaced (not merged), objects are deep merged
 */
declare function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T;
/**
 * Deep freeze for immutability guarantees
 * Prevents any runtime modifications to config
 */
declare function deepFreeze<T>(obj: T): T;
/**
 * Load and validate unified config
 *
 * Process:
 * 1. Start with base defaults
 * 2. Apply environment layer (dev/stage/prod)
 * 3. Apply runtime overrides (env vars)
 * 4. Apply user overrides
 * 5. Apply plugin extensions
 * 6. Enforce required fields (crash if missing)
 * 7. Validate config
 * 8. Freeze for immutability
 * 9. Return final config
 *
 * @param userOverrides - Optional user-provided overrides (highest priority before plugins)
 * @returns Validated, frozen config
 */
export declare function loadConfig(userOverrides?: PartialUnifiedConfig): Readonly<UnifiedConfig>;
export type { ConfigValidationResult };
export { validateConfig, deepMerge, deepFreeze };
export { applyPlugins } from './plugins';
