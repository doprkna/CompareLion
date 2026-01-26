/**
 * Unified Config Entrypoint
 * C6 Step 2: Canonical Unified Config Map
 * v0.42.18
 *
 * Type-safe access patterns, merging logic, and immutability guarantees.
 * This is the main entrypoint for the unified config system.
 */
import type { UnifiedConfig, PartialUnifiedConfig, ConfigMetadata } from './schema';
/**
 * Config Manager
 * Handles config loading, merging, and access
 */
declare class ConfigManager {
    private config;
    private metadata;
    constructor(overrides?: PartialUnifiedConfig);
    /**
     * Apply environment-specific overrides
     */
    private applyEnvironmentOverrides;
    /**
     * Deep freeze for immutability
     */
    private deepFreeze;
    /**
     * Get entire config (read-only)
     */
    getConfig(): Readonly<UnifiedConfig>;
    /**
     * Get config by namespace
     */
    get<K extends keyof UnifiedConfig>(namespace: K): Readonly<UnifiedConfig[K]>;
    /**
     * Get nested config value
     * Usage: getValue('gameplay', 'xp', 'levelMultiplier')
     */
    getValue<K extends keyof UnifiedConfig>(namespace: K, ...path: string[]): unknown;
    /**
     * Check if config key exists
     */
    has<K extends keyof UnifiedConfig>(namespace: K): boolean;
    /**
     * Register metadata for a config key
     */
    registerMetadata(key: string, metadata: ConfigMetadata): void;
    /**
     * Get metadata for a config key
     */
    getMetadata(key: string): ConfigMetadata | undefined;
}
/**
 * Initialize unified config
 * Should be called once at app startup
 */
export declare function initUnifiedConfig(overrides?: PartialUnifiedConfig): ConfigManager;
/**
 * Get unified config instance
 * Throws if not initialized
 */
export declare function getUnifiedConfig(): ConfigManager;
/**
 * Get config value (convenience function)
 * Usage: const xpMultiplier = getConfig('gameplay', 'xp', 'levelMultiplier')
 */
export declare function getConfig<K extends keyof UnifiedConfig>(namespace: K): Readonly<UnifiedConfig[K]>;
/**
 * Get nested config value (convenience function)
 * Usage: const value = getConfigValue('gameplay', 'xp', 'levelMultiplier')
 */
export declare function getConfigValue<K extends keyof UnifiedConfig>(namespace: K, ...path: string[]): unknown;
/**
 * Type-safe access to gameplay config
 */
export declare function getGameplayConfig(): Readonly<UnifiedConfig['gameplay']>;
/**
 * Type-safe access to UI config
 */
export declare function getUiConfig(): Readonly<UnifiedConfig['ui']>;
/**
 * Type-safe access to API config
 */
export declare function getApiConfig(): Readonly<UnifiedConfig['api']>;
/**
 * Type-safe access to app config
 */
export declare function getAppConfig(): Readonly<UnifiedConfig['app']>;
/**
 * Type-safe access to platform config
 */
export declare function getPlatformConfig(): Readonly<UnifiedConfig['platform']>;
/**
 * Type-safe access to security config
 */
export declare function getSecurityConfig(): Readonly<UnifiedConfig['security']>;
/**
 * Type-safe access to features config
 */
export declare function getFeaturesConfig(): Readonly<UnifiedConfig['features']>;
/**
 * Plugin extension point
 * Allows external packages to extend config
 */
export interface ConfigPlugin {
    name: string;
    extend(config: UnifiedConfig): PartialUnifiedConfig;
}
/**
 * Register a config plugin
 */
export declare function registerConfigPlugin(plugin: ConfigPlugin): void;
/**
 * Apply all registered plugins
 * Should be called after initUnifiedConfig
 */
export declare function applyConfigPlugins(): void;
export type { UnifiedConfig, PartialUnifiedConfig, ConfigMetadata };
export { ConfigManager };
