/**
 * Config Plugin Extension System
 * C6 Step 7: Dynamic Feature Flags + Plugin Extension Points
 * v0.42.23
 *
 * Provides a plugin-based system for extending config safely.
 * Plugins can add new config values or override existing ones.
 *
 * Constraints:
 * - No side effects (pure config extension)
 * - No circular dependencies
 * - Plugins are applied in registration order
 */
import type { UnifiedConfig, PartialUnifiedConfig } from './schema';
/**
 * Config plugin interface
 * Plugins extend the config by returning partial config overrides
 */
export interface ConfigPlugin {
    /**
     * Plugin name (for debugging and logging)
     */
    name: string;
    /**
     * Plugin version (optional, for tracking)
     */
    version?: string;
    /**
     * Extend config with plugin-specific values
     *
     * Constraints:
     * - Must be pure (no side effects)
     * - Must not cause circular dependencies
     * - Should only return partial config (not full config)
     *
     * @param config - Current config state (read-only)
     * @returns Partial config to merge
     */
    extend(config: Readonly<UnifiedConfig>): PartialUnifiedConfig;
}
/**
 * Register a config plugin
 *
 * Plugins are applied in registration order.
 * Later plugins can override earlier ones.
 *
 * @param plugin - Plugin to register
 * @throws Error if plugin with same name already registered
 */
export declare function registerConfigPlugin(plugin: ConfigPlugin): void;
/**
 * Get all registered plugins
 * @returns Array of registered plugins (read-only)
 */
export declare function getRegisteredPlugins(): ReadonlyArray<ConfigPlugin>;
/**
 * Clear all registered plugins (useful for testing)
 */
export declare function clearPlugins(): void;
/**
 * Check if a plugin is registered
 */
export declare function isPluginRegistered(name: string): boolean;
/**
 * Apply all registered plugins to config
 *
 * Process:
 * 1. Iterate through plugins in registration order
 * 2. Call each plugin's extend() method with current config
 * 3. Merge plugin results into config
 * 4. Return final config with all plugin extensions
 *
 * @param baseConfig - Base config to extend
 * @param deepMerge - Deep merge function (from load.ts)
 * @returns Config with all plugin extensions applied
 */
export declare function applyPlugins(baseConfig: UnifiedConfig, deepMerge: <T extends Record<string, any>>(target: T, source: Partial<T>) => T): UnifiedConfig;
/**
 * Validate plugin constraints
 *
 * Checks:
 * - Plugin has required properties
 * - Plugin name is valid
 * - Plugin extend function is valid
 *
 * @param plugin - Plugin to validate
 * @returns Validation result
 */
export declare function validatePlugin(plugin: unknown): {
    valid: boolean;
    errors: string[];
};
export type { ConfigPlugin };
