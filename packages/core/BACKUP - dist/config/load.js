/**
 * Config Runtime Loader
 * C6 Step 6: Validation Engine + Environment Layering
 * v0.42.22
 *
 * Orchestrates config loading, merging, validation, and freezing.
 * This is the main entrypoint for loading the unified config.
 */
import { validateConfig } from './schema';
import { unifiedConfigDefaults } from './defaults';
import { applyPlugins } from './plugins';
// ============================================================================
// DEEP MERGE UTILITY
// ============================================================================
/**
 * Deep merge utility for config overrides
 * Arrays are replaced (not merged), objects are deep merged
 */
function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source[key] === undefined) {
            continue; // Skip undefined values
        }
        const sourceValue = source[key];
        const targetValue = result[key];
        // Arrays are replaced, not merged
        if (Array.isArray(sourceValue)) {
            result[key] = sourceValue;
        }
        // Objects are deep merged
        else if (sourceValue &&
            typeof sourceValue === 'object' &&
            targetValue &&
            typeof targetValue === 'object' &&
            !Array.isArray(targetValue)) {
            result[key] = deepMerge(targetValue || {}, sourceValue);
        }
        // Primitives are replaced
        else {
            result[key] = sourceValue;
        }
    }
    return result;
}
// ============================================================================
// DEEP FREEZE UTILITY
// ============================================================================
/**
 * Deep freeze for immutability guarantees
 * Prevents any runtime modifications to config
 */
function deepFreeze(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    // Freeze the object itself
    Object.freeze(obj);
    // Freeze all properties
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (value && typeof value === 'object') {
            deepFreeze(value);
        }
    });
    return obj;
}
// ============================================================================
// ENVIRONMENT LAYER
// ============================================================================
/**
 * Get environment-specific config overrides
 * Returns empty object if no environment-specific config exists
 */
function getEnvironmentConfig() {
    const env = process.env.NODE_ENV || 'development';
    // For now, environment config is applied in unified.ts
    // This function can be extended to load from env-specific files
    // e.g., config.dev.ts, config.prod.ts, config.stage.ts
    return {};
}
// ============================================================================
// RUNTIME OVERRIDES
// ============================================================================
/**
 * Get runtime overrides from environment variables
 * These override both base and environment config
 */
function getRuntimeOverrides() {
    const env = process.env.NODE_ENV || 'development';
    const overrides = {};
    // Platform environment detection
    if (!overrides.platform) {
        overrides.platform = {};
    }
    overrides.platform.environment = {
        isProd: env === 'production',
        isDev: env === 'development',
        hasRedis: !!process.env.REDIS_URL,
        hasDb: !!process.env.DATABASE_URL,
        nodeEnv: env,
        redisUrl: process.env.REDIS_URL,
        databaseUrl: process.env.DATABASE_URL,
    };
    // Security config from environment
    if (!overrides.security) {
        overrides.security = {};
    }
    if (!overrides.security.captcha) {
        overrides.security.captcha = {};
    }
    overrides.security.captcha.siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '';
    overrides.security.captcha.secret = process.env.HCAPTCHA_SECRET || '';
    overrides.security.captcha.enabled =
        !!process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && env === 'production';
    if (!overrides.security.auth) {
        overrides.security.auth = {};
    }
    overrides.security.auth.demoBypass =
        process.env.NEXT_PUBLIC_ALLOW_DEMO_LOGIN === 'true' || env !== 'production';
    if (!overrides.security.rateLimit) {
        overrides.security.rateLimit = {};
    }
    overrides.security.rateLimit.enabled =
        !!process.env.REDIS_URL || !!process.env.UPSTASH_REDIS_REST_URL;
    // Generator config from environment
    if (!overrides.api) {
        overrides.api = {};
    }
    if (!overrides.api.generator) {
        overrides.api.generator = {};
    }
    overrides.api.generator.maxConcurrency =
        Number(process.env.NEXT_PUBLIC_GEN_MAX_CONCURRENCY || 2);
    overrides.api.generator.questionsPerCategoryMin =
        Number(process.env.NEXT_PUBLIC_Q_PER_CAT_MIN || 5);
    overrides.api.generator.questionsPerCategoryMax =
        Number(process.env.NEXT_PUBLIC_Q_PER_CAT_MAX || 12);
    overrides.api.generator.batchSize =
        Number(process.env.NEXT_PUBLIC_GEN_BATCH_SIZE || 50);
    overrides.api.generator.maxRetries =
        Number(process.env.NEXT_PUBLIC_GEN_MAX_RETRIES || 3);
    overrides.api.generator.retryDelayMs =
        Number(process.env.NEXT_PUBLIC_GEN_RETRY_DELAY || 1000);
    overrides.api.generator.languages =
        (process.env.NEXT_PUBLIC_GEN_LANGS || 'en').split(',').map(s => s.trim());
    overrides.api.generator.gptUrl = process.env.GPT_GEN_URL || '';
    overrides.api.generator.gptKey = process.env.GPT_GEN_KEY || '';
    overrides.api.generator.adminToken = process.env.ADMIN_TOKEN || '';
    overrides.api.generator.dryRun = process.env.NEXT_PUBLIC_GEN_DRY_RUN === 'true';
    // Features config from environment
    if (!overrides.features) {
        overrides.features = {};
    }
    overrides.features.enableAnalytics =
        process.env.ENABLE_ANALYTICS === '1' || process.env.ENABLE_ANALYTICS === 'true';
    overrides.features.environment =
        env === 'production' ? 'production' : env === 'development' ? 'development' : 'test';
    return overrides;
}
// ============================================================================
// REQUIRED FIELD ENFORCEMENT
// ============================================================================
/**
 * Required config fields that must exist
 * These will cause the app to crash on load if missing
 */
const REQUIRED_FIELDS = [
    { path: 'gameplay', namespace: 'gameplay' },
    { path: 'ui', namespace: 'ui' },
    { path: 'api', namespace: 'api' },
    { path: 'app', namespace: 'app' },
    { path: 'platform', namespace: 'platform' },
    { path: 'security', namespace: 'security' },
    { path: 'features', namespace: 'features' },
];
/**
 * Check required fields and throw if missing
 */
function enforceRequiredFields(config) {
    const missing = [];
    for (const { path, namespace } of REQUIRED_FIELDS) {
        if (!config[namespace]) {
            missing.push(path);
        }
    }
    if (missing.length > 0) {
        throw new Error(`[Config] Required config namespaces are missing: ${missing.join(', ')}\n` +
            `This is a critical error. Please check your config initialization.`);
    }
}
// ============================================================================
// CONFIG LOADER
// ============================================================================
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
export function loadConfig(userOverrides) {
    // Step 1: Start with base defaults
    let config = { ...unifiedConfigDefaults };
    // Step 2: Apply environment layer
    const envConfig = getEnvironmentConfig();
    config = deepMerge(config, envConfig);
    // Step 3: Apply runtime overrides (env vars)
    const runtimeOverrides = getRuntimeOverrides();
    config = deepMerge(config, runtimeOverrides);
    // Step 4: Apply user overrides
    if (userOverrides) {
        config = deepMerge(config, userOverrides);
    }
    // Step 5: Apply plugin extensions
    // Plugins can extend or override config values
    config = applyPlugins(config, deepMerge);
    // Step 6: Enforce required fields (crash if missing)
    enforceRequiredFields(config);
    // Step 7: Validate config
    const validation = validateConfig(config);
    if (!validation.valid) {
        // In development, show detailed errors
        if (process.env.NODE_ENV === 'development') {
            console.error('[Config] Validation errors:');
            validation.errors.forEach(error => {
                console.error(`  - ${error.path}: ${error.message}`);
                if (error.expected && error.actual) {
                    console.error(`    Expected: ${error.expected}, Actual: ${error.actual}`);
                }
            });
        }
        // Always throw on validation errors (critical)
        throw new Error(`[Config] Config validation failed with ${validation.errors.length} error(s). ` +
            `Check console for details (development mode only).`);
    }
    // Step 8: Show warnings in development
    if (process.env.NODE_ENV === 'development' && validation.warnings.length > 0) {
        console.warn('[Config] Validation warnings:');
        validation.warnings.forEach(warning => {
            console.warn(`  - ${warning}`);
        });
    }
    // Step 9: Freeze for immutability
    const frozenConfig = deepFreeze(config);
    return frozenConfig;
}
export { validateConfig, deepMerge, deepFreeze };
export { applyPlugins } from './plugins';
