/**
 * Unified Config Entrypoint
 * C6 Step 2: Canonical Unified Config Map
 * v0.42.18
 *
 * Type-safe access patterns, merging logic, and immutability guarantees.
 * This is the main entrypoint for the unified config system.
 */
import { unifiedConfigDefaults } from './defaults';
// ============================================================================
// DEEP MERGE UTILITY
// ============================================================================
/**
 * Deep merge utility for config overrides
 * Preserves immutability by creating new objects
 */
function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge((result[key] || {}), source[key]);
        }
        else if (source[key] !== undefined) {
            result[key] = source[key];
        }
    }
    return result;
}
// ============================================================================
// CONFIG MANAGER
// ============================================================================
/**
 * Config Manager
 * Handles config loading, merging, and access
 */
class ConfigManager {
    constructor(overrides) {
        this.metadata = new Map();
        // Start with defaults
        this.config = deepMerge(unifiedConfigDefaults, overrides || {});
        // Apply environment-specific overrides
        this.applyEnvironmentOverrides();
        // Freeze config for immutability
        this.config = this.deepFreeze(this.config);
    }
    /**
     * Apply environment-specific overrides
     */
    applyEnvironmentOverrides() {
        const env = process.env.NODE_ENV || 'development';
        // Platform environment detection
        this.config.platform.environment = {
            isProd: env === 'production',
            isDev: env === 'development',
            hasRedis: !!process.env.REDIS_URL,
            hasDb: !!process.env.DATABASE_URL,
            nodeEnv: env,
            redisUrl: process.env.REDIS_URL,
            databaseUrl: process.env.DATABASE_URL,
        };
        // Security config from environment
        this.config.security.captcha.siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '';
        this.config.security.captcha.secret = process.env.HCAPTCHA_SECRET || '';
        this.config.security.captcha.enabled =
            !!process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && env === 'production';
        this.config.security.auth.demoBypass =
            process.env.NEXT_PUBLIC_ALLOW_DEMO_LOGIN === 'true' || env !== 'production';
        this.config.security.rateLimit.enabled =
            !!process.env.REDIS_URL || !!process.env.UPSTASH_REDIS_REST_URL;
        // Generator config from environment
        this.config.api.generator.maxConcurrency =
            Number(process.env.NEXT_PUBLIC_GEN_MAX_CONCURRENCY || 2);
        this.config.api.generator.questionsPerCategoryMin =
            Number(process.env.NEXT_PUBLIC_Q_PER_CAT_MIN || 5);
        this.config.api.generator.questionsPerCategoryMax =
            Number(process.env.NEXT_PUBLIC_Q_PER_CAT_MAX || 12);
        this.config.api.generator.batchSize =
            Number(process.env.NEXT_PUBLIC_GEN_BATCH_SIZE || 50);
        this.config.api.generator.maxRetries =
            Number(process.env.NEXT_PUBLIC_GEN_MAX_RETRIES || 3);
        this.config.api.generator.retryDelayMs =
            Number(process.env.NEXT_PUBLIC_GEN_RETRY_DELAY || 1000);
        this.config.api.generator.languages =
            (process.env.NEXT_PUBLIC_GEN_LANGS || 'en').split(',').map(s => s.trim());
        this.config.api.generator.gptUrl = process.env.GPT_GEN_URL || '';
        this.config.api.generator.gptKey = process.env.GPT_GEN_KEY || '';
        this.config.api.generator.adminToken = process.env.ADMIN_TOKEN || '';
        this.config.api.generator.dryRun = process.env.NEXT_PUBLIC_GEN_DRY_RUN === 'true';
        // Features config from environment
        this.config.features.enableAnalytics =
            process.env.ENABLE_ANALYTICS === '1' || process.env.ENABLE_ANALYTICS === 'true';
        this.config.features.environment =
            env === 'production' ? 'production' : env === 'development' ? 'development' : 'test';
    }
    /**
     * Deep freeze for immutability
     */
    deepFreeze(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        Object.freeze(obj);
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            if (value && typeof value === 'object') {
                this.deepFreeze(value);
            }
        });
        return obj;
    }
    /**
     * Get entire config (read-only)
     */
    getConfig() {
        return this.config;
    }
    /**
     * Get config by namespace
     */
    get(namespace) {
        return this.config[namespace];
    }
    /**
     * Get nested config value
     * Usage: getValue('gameplay', 'xp', 'levelMultiplier')
     */
    getValue(namespace, ...path) {
        let value = this.config[namespace];
        for (const key of path) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            }
            else {
                return undefined;
            }
        }
        return value;
    }
    /**
     * Check if config key exists
     */
    has(namespace) {
        return namespace in this.config;
    }
    /**
     * Register metadata for a config key
     */
    registerMetadata(key, metadata) {
        this.metadata.set(key, metadata);
    }
    /**
     * Get metadata for a config key
     */
    getMetadata(key) {
        return this.metadata.get(key);
    }
}
// ============================================================================
// SINGLETON INSTANCE
// ============================================================================
let configManagerInstance = null;
/**
 * Initialize unified config
 * Should be called once at app startup
 */
export function initUnifiedConfig(overrides) {
    if (configManagerInstance) {
        console.warn('[Config] Unified config already initialized. Returning existing instance.');
        return configManagerInstance;
    }
    configManagerInstance = new ConfigManager(overrides);
    return configManagerInstance;
}
/**
 * Get unified config instance
 * Throws if not initialized
 */
export function getUnifiedConfig() {
    if (!configManagerInstance) {
        throw new Error('[Config] Unified config not initialized. Call initUnifiedConfig() first.');
    }
    return configManagerInstance;
}
/**
 * Get config value (convenience function)
 * Usage: const xpMultiplier = getConfig('gameplay', 'xp', 'levelMultiplier')
 */
export function getConfig(namespace) {
    return getUnifiedConfig().get(namespace);
}
/**
 * Get nested config value (convenience function)
 * Usage: const value = getConfigValue('gameplay', 'xp', 'levelMultiplier')
 */
export function getConfigValue(namespace, ...path) {
    return getUnifiedConfig().getValue(namespace, ...path);
}
// ============================================================================
// TYPE-SAFE ACCESS HELPERS
// ============================================================================
/**
 * Type-safe access to gameplay config
 */
export function getGameplayConfig() {
    return getConfig('gameplay');
}
/**
 * Type-safe access to UI config
 */
export function getUiConfig() {
    return getConfig('ui');
}
/**
 * Type-safe access to API config
 */
export function getApiConfig() {
    return getConfig('api');
}
/**
 * Type-safe access to app config
 */
export function getAppConfig() {
    return getConfig('app');
}
/**
 * Type-safe access to platform config
 */
export function getPlatformConfig() {
    return getConfig('platform');
}
/**
 * Type-safe access to security config
 */
export function getSecurityConfig() {
    return getConfig('security');
}
/**
 * Type-safe access to features config
 */
export function getFeaturesConfig() {
    return getConfig('features');
}
const plugins = [];
/**
 * Register a config plugin
 */
export function registerConfigPlugin(plugin) {
    plugins.push(plugin);
}
/**
 * Apply all registered plugins
 * Should be called after initUnifiedConfig
 */
export function applyConfigPlugins() {
    if (!configManagerInstance) {
        throw new Error('[Config] Cannot apply plugins: config not initialized');
    }
    const overrides = {};
    for (const plugin of plugins) {
        const pluginOverrides = plugin.extend(configManagerInstance.getConfig());
        Object.assign(overrides, pluginOverrides);
    }
    // Reinitialize with plugin overrides
    configManagerInstance = new ConfigManager(overrides);
}
export { ConfigManager };
