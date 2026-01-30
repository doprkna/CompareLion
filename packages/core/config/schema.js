/**
 * Unified Config Schema
 * C6 Step 2: Canonical Unified Config Map
 * v0.42.18
 *
 * TypeScript interfaces for all config namespaces.
 * This defines the structure - real values will be migrated in Step 3.
 */
/**
 * Runtime validation for config values
 * Validates types, ranges, enums, and required fields
 */
export function validateConfig(config) {
    const errors = [];
    const warnings = [];
    // Validate required namespaces
    const requiredNamespaces = [
        'gameplay',
        'ui',
        'api',
        'app',
        'platform',
        'security',
        'features',
    ];
    for (const namespace of requiredNamespaces) {
        if (!config[namespace]) {
            errors.push({
                path: namespace,
                message: `Required namespace '${namespace}' is missing`,
                expected: 'object',
                actual: 'undefined',
            });
        }
    }
    // Validate gameplay config
    if (config.gameplay) {
        if (config.gameplay.xp) {
            if (typeof config.gameplay.xp.levelMultiplier !== 'number') {
                errors.push({
                    path: 'gameplay.xp.levelMultiplier',
                    message: 'levelMultiplier must be a number',
                    expected: 'number',
                    actual: typeof config.gameplay.xp.levelMultiplier,
                });
            }
            else if (config.gameplay.xp.levelMultiplier < 0) {
                errors.push({
                    path: 'gameplay.xp.levelMultiplier',
                    message: 'levelMultiplier must be >= 0',
                    expected: 'number >= 0',
                    actual: String(config.gameplay.xp.levelMultiplier),
                });
            }
            if (typeof config.gameplay.xp.questionBase !== 'number') {
                errors.push({
                    path: 'gameplay.xp.questionBase',
                    message: 'questionBase must be a number',
                    expected: 'number',
                    actual: typeof config.gameplay.xp.questionBase,
                });
            }
            else if (config.gameplay.xp.questionBase < 0) {
                errors.push({
                    path: 'gameplay.xp.questionBase',
                    message: 'questionBase must be >= 0',
                    expected: 'number >= 0',
                    actual: String(config.gameplay.xp.questionBase),
                });
            }
        }
    }
    // Validate features config
    if (config.features) {
        if (typeof config.features.enableBase !== 'boolean') {
            errors.push({
                path: 'features.enableBase',
                message: 'enableBase must be a boolean',
                expected: 'boolean',
                actual: typeof config.features.enableBase,
            });
        }
        if (typeof config.features.enableTrials !== 'boolean') {
            errors.push({
                path: 'features.enableTrials',
                message: 'enableTrials must be a boolean',
                expected: 'boolean',
                actual: typeof config.features.enableTrials,
            });
        }
        if (typeof config.features.enableThemes !== 'boolean') {
            errors.push({
                path: 'features.enableThemes',
                message: 'enableThemes must be a boolean',
                expected: 'boolean',
                actual: typeof config.features.enableThemes,
            });
        }
        if (typeof config.features.enableEconomyV2 !== 'boolean') {
            errors.push({
                path: 'features.enableEconomyV2',
                message: 'enableEconomyV2 must be a boolean',
                expected: 'boolean',
                actual: typeof config.features.enableEconomyV2,
            });
        }
        if (typeof config.features.enableAnalytics !== 'boolean') {
            errors.push({
                path: 'features.enableAnalytics',
                message: 'enableAnalytics must be a boolean',
                expected: 'boolean',
                actual: typeof config.features.enableAnalytics,
            });
        }
        // Validate environment enum
        const validEnvironments = ['development', 'production', 'test'];
        if (config.features.environment && !validEnvironments.includes(config.features.environment)) {
            errors.push({
                path: 'features.environment',
                message: `environment must be one of: ${validEnvironments.join(', ')}`,
                expected: validEnvironments.join(' | '),
                actual: String(config.features.environment),
            });
        }
    }
    // Validate API config ranges
    if (config.api) {
        if (config.api.client) {
            if (typeof config.api.client.timeout === 'number' && config.api.client.timeout < 0) {
                errors.push({
                    path: 'api.client.timeout',
                    message: 'timeout must be >= 0',
                    expected: 'number >= 0',
                    actual: String(config.api.client.timeout),
                });
            }
            if (typeof config.api.client.retry?.maxRetries === 'number' && config.api.client.retry.maxRetries < 0) {
                errors.push({
                    path: 'api.client.retry.maxRetries',
                    message: 'retry.maxRetries must be >= 0',
                    expected: 'number >= 0',
                    actual: String(config.api.client.retry.maxRetries),
                });
            }
        }
        if (config.api.pagination) {
            if (typeof config.api.pagination.defaultLimit === 'number' && config.api.pagination.defaultLimit < 1) {
                errors.push({
                    path: 'api.pagination.defaultLimit',
                    message: 'defaultLimit must be >= 1',
                    expected: 'number >= 1',
                    actual: String(config.api.pagination.defaultLimit),
                });
            }
            if (typeof config.api.pagination.maxLimit === 'number' && config.api.pagination.maxLimit < 1) {
                errors.push({
                    path: 'api.pagination.maxLimit',
                    message: 'maxLimit must be >= 1',
                    expected: 'number >= 1',
                    actual: String(config.api.pagination.maxLimit),
                });
            }
        }
    }
    // Validate app config limits
    if (config.app && config.app.limits) {
        if (config.app.limits.questions) {
            if (typeof config.app.limits.questions.maxPerDay === 'number' && config.app.limits.questions.maxPerDay < 0) {
                errors.push({
                    path: 'app.limits.questions.maxPerDay',
                    message: 'maxPerDay must be >= 0',
                    expected: 'number >= 0',
                    actual: String(config.app.limits.questions.maxPerDay),
                });
            }
        }
    }
    // Development-only warnings
    if (process.env.NODE_ENV === 'development') {
        if (config.features && !config.features.enableBase) {
            warnings.push('enableBase is disabled - core features may not work');
        }
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
