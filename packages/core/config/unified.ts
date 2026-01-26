/**
 * Unified Config Entrypoint
 * C6 Step 2: Canonical Unified Config Map
 * v0.42.18
 * 
 * Type-safe access patterns, merging logic, and immutability guarantees.
 * This is the main entrypoint for the unified config system.
 */

import type { UnifiedConfig, PartialUnifiedConfig, ConfigMetadata } from './schema';
import { unifiedConfigDefaults } from './defaults';

// ============================================================================
// DEEP MERGE UTILITY
// ============================================================================

/**
 * Deep merge utility for config overrides
 * Preserves immutability by creating new objects
 */
function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key] as Partial<T[Extract<keyof T, string>]>);
    } else if (source[key] !== undefined) {
      result[key] = source[key] as T[Extract<keyof T, string>];
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
  private config: UnifiedConfig;
  private metadata: Map<string, ConfigMetadata> = new Map();

  constructor(overrides?: PartialUnifiedConfig) {
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
  private applyEnvironmentOverrides(): void {
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
  private deepFreeze<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    Object.freeze(obj);

    Object.keys(obj).forEach(key => {
      const value = (obj as any)[key];
      if (value && typeof value === 'object') {
        this.deepFreeze(value);
      }
    });

    return obj;
  }

  /**
   * Get entire config (read-only)
   */
  getConfig(): Readonly<UnifiedConfig> {
    return this.config;
  }

  /**
   * Get config by namespace
   */
  get<K extends keyof UnifiedConfig>(namespace: K): Readonly<UnifiedConfig[K]> {
    return this.config[namespace];
  }

  /**
   * Get nested config value
   * Usage: getValue('gameplay', 'xp', 'levelMultiplier')
   */
  getValue<K extends keyof UnifiedConfig>(
    namespace: K,
    ...path: string[]
  ): unknown {
    let value: any = this.config[namespace];
    
    for (const key of path) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * Check if config key exists
   */
  has<K extends keyof UnifiedConfig>(namespace: K): boolean {
    return namespace in this.config;
  }

  /**
   * Register metadata for a config key
   */
  registerMetadata(key: string, metadata: ConfigMetadata): void {
    this.metadata.set(key, metadata);
  }

  /**
   * Get metadata for a config key
   */
  getMetadata(key: string): ConfigMetadata | undefined {
    return this.metadata.get(key);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let configManagerInstance: ConfigManager | null = null;

/**
 * Initialize unified config
 * Should be called once at app startup
 */
export function initUnifiedConfig(overrides?: PartialUnifiedConfig): ConfigManager {
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
export function getUnifiedConfig(): ConfigManager {
  if (!configManagerInstance) {
    throw new Error(
      '[Config] Unified config not initialized. Call initUnifiedConfig() first.'
    );
  }
  return configManagerInstance;
}

/**
 * Get config value (convenience function)
 * Usage: const xpMultiplier = getConfig('gameplay', 'xp', 'levelMultiplier')
 */
export function getConfig<K extends keyof UnifiedConfig>(
  namespace: K
): Readonly<UnifiedConfig[K]> {
  return getUnifiedConfig().get(namespace);
}

/**
 * Get nested config value (convenience function)
 * Usage: const value = getConfigValue('gameplay', 'xp', 'levelMultiplier')
 */
export function getConfigValue<K extends keyof UnifiedConfig>(
  namespace: K,
  ...path: string[]
): unknown {
  return getUnifiedConfig().getValue(namespace, ...path);
}

// ============================================================================
// TYPE-SAFE ACCESS HELPERS
// ============================================================================

/**
 * Type-safe access to gameplay config
 */
export function getGameplayConfig(): Readonly<UnifiedConfig['gameplay']> {
  return getConfig('gameplay');
}

/**
 * Type-safe access to UI config
 */
export function getUiConfig(): Readonly<UnifiedConfig['ui']> {
  return getConfig('ui');
}

/**
 * Type-safe access to API config
 */
export function getApiConfig(): Readonly<UnifiedConfig['api']> {
  return getConfig('api');
}

/**
 * Type-safe access to app config
 */
export function getAppConfig(): Readonly<UnifiedConfig['app']> {
  return getConfig('app');
}

/**
 * Type-safe access to platform config
 */
export function getPlatformConfig(): Readonly<UnifiedConfig['platform']> {
  return getConfig('platform');
}

/**
 * Type-safe access to security config
 */
export function getSecurityConfig(): Readonly<UnifiedConfig['security']> {
  return getConfig('security');
}

/**
 * Type-safe access to features config
 */
export function getFeaturesConfig(): Readonly<UnifiedConfig['features']> {
  return getConfig('features');
}

// ============================================================================
// PLUGIN EXTENSION POINTS
// ============================================================================

/**
 * Plugin extension point
 * Allows external packages to extend config
 */
export interface ConfigPlugin {
  name: string;
  extend(config: UnifiedConfig): PartialUnifiedConfig;
}

const plugins: ConfigPlugin[] = [];

/**
 * Register a config plugin
 */
export function registerConfigPlugin(plugin: ConfigPlugin): void {
  plugins.push(plugin);
}

/**
 * Apply all registered plugins
 * Should be called after initUnifiedConfig
 */
export function applyConfigPlugins(): void {
  if (!configManagerInstance) {
    throw new Error('[Config] Cannot apply plugins: config not initialized');
  }

  const overrides: PartialUnifiedConfig = {};
  
  for (const plugin of plugins) {
    const pluginOverrides = plugin.extend(configManagerInstance.getConfig());
    Object.assign(overrides, pluginOverrides);
  }

  // Reinitialize with plugin overrides
  configManagerInstance = new ConfigManager(overrides);
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { UnifiedConfig, PartialUnifiedConfig, ConfigMetadata };
export { ConfigManager };

