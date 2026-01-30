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
// ============================================================================
// PLUGIN REGISTRY
// ============================================================================
/**
 * Registered plugins (in registration order)
 */
const registeredPlugins = [];
/**
 * Plugin registration tracking (to prevent duplicates)
 */
const registeredPluginNames = new Set();
/**
 * Register a config plugin
 *
 * Plugins are applied in registration order.
 * Later plugins can override earlier ones.
 *
 * @param plugin - Plugin to register
 * @throws Error if plugin with same name already registered
 */
export function registerConfigPlugin(plugin) {
    if (registeredPluginNames.has(plugin.name)) {
        throw new Error(`[Config] Plugin with name "${plugin.name}" is already registered. ` +
            `Use a unique name for each plugin.`);
    }
    registeredPlugins.push(plugin);
    registeredPluginNames.add(plugin.name);
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Config] Registered plugin: ${plugin.name}${plugin.version ? ` v${plugin.version}` : ''}`);
    }
}
/**
 * Get all registered plugins
 * @returns Array of registered plugins (read-only)
 */
export function getRegisteredPlugins() {
    return [...registeredPlugins];
}
/**
 * Clear all registered plugins (useful for testing)
 */
export function clearPlugins() {
    registeredPlugins.length = 0;
    registeredPluginNames.clear();
}
/**
 * Check if a plugin is registered
 */
export function isPluginRegistered(name) {
    return registeredPluginNames.has(name);
}
// ============================================================================
// PLUGIN APPLICATION
// ============================================================================
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
export function applyPlugins(baseConfig, deepMerge) {
    let config = baseConfig;
    for (const plugin of registeredPlugins) {
        try {
            const pluginOverrides = plugin.extend(config);
            // Validate plugin output (basic check)
            if (pluginOverrides && typeof pluginOverrides === 'object') {
                config = deepMerge(config, pluginOverrides);
            }
            else {
                if (process.env.NODE_ENV === 'development') {
                    console.warn(`[Config] Plugin "${plugin.name}" returned invalid config. ` +
                        `Expected object, got ${typeof pluginOverrides}. Skipping.`);
                }
            }
        }
        catch (error) {
            // Plugin error should not crash config loading
            // Log and continue with other plugins
            console.error(`[Config] Error applying plugin "${plugin.name}":`, error);
            if (process.env.NODE_ENV === 'development') {
                console.error(`[Config] Plugin "${plugin.name}" failed. ` +
                    `Check plugin implementation for errors.`);
            }
        }
    }
    return config;
}
// ============================================================================
// PLUGIN VALIDATION
// ============================================================================
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
export function validatePlugin(plugin) {
    const errors = [];
    if (!plugin || typeof plugin !== 'object') {
        errors.push('Plugin must be an object');
        return { valid: false, errors };
    }
    const p = plugin;
    if (!p.name || typeof p.name !== 'string') {
        errors.push('Plugin must have a string "name" property');
    }
    if (!p.extend || typeof p.extend !== 'function') {
        errors.push('Plugin must have an "extend" function');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
// ConfigPlugin is exported at declaration (line 25)
