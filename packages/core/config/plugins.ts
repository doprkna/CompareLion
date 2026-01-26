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

// ============================================================================
// PLUGIN INTERFACE
// ============================================================================

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

// ============================================================================
// PLUGIN REGISTRY
// ============================================================================

/**
 * Registered plugins (in registration order)
 */
const registeredPlugins: ConfigPlugin[] = [];

/**
 * Plugin registration tracking (to prevent duplicates)
 */
const registeredPluginNames = new Set<string>();

/**
 * Register a config plugin
 * 
 * Plugins are applied in registration order.
 * Later plugins can override earlier ones.
 * 
 * @param plugin - Plugin to register
 * @throws Error if plugin with same name already registered
 */
export function registerConfigPlugin(plugin: ConfigPlugin): void {
  if (registeredPluginNames.has(plugin.name)) {
    throw new Error(
      `[Config] Plugin with name "${plugin.name}" is already registered. ` +
      `Use a unique name for each plugin.`
    );
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
export function getRegisteredPlugins(): ReadonlyArray<ConfigPlugin> {
  return [...registeredPlugins];
}

/**
 * Clear all registered plugins (useful for testing)
 */
export function clearPlugins(): void {
  registeredPlugins.length = 0;
  registeredPluginNames.clear();
}

/**
 * Check if a plugin is registered
 */
export function isPluginRegistered(name: string): boolean {
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
export function applyPlugins(
  baseConfig: UnifiedConfig,
  deepMerge: <T extends Record<string, any>>(target: T, source: Partial<T>) => T
): UnifiedConfig {
  let config = baseConfig;

  for (const plugin of registeredPlugins) {
    try {
      const pluginOverrides = plugin.extend(config);
      
      // Validate plugin output (basic check)
      if (pluginOverrides && typeof pluginOverrides === 'object') {
        config = deepMerge(config, pluginOverrides);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[Config] Plugin "${plugin.name}" returned invalid config. ` +
            `Expected object, got ${typeof pluginOverrides}. Skipping.`
          );
        }
      }
    } catch (error) {
      // Plugin error should not crash config loading
      // Log and continue with other plugins
      console.error(`[Config] Error applying plugin "${plugin.name}":`, error);
      
      if (process.env.NODE_ENV === 'development') {
        console.error(
          `[Config] Plugin "${plugin.name}" failed. ` +
          `Check plugin implementation for errors.`
        );
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
export function validatePlugin(plugin: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!plugin || typeof plugin !== 'object') {
    errors.push('Plugin must be an object');
    return { valid: false, errors };
  }

  const p = plugin as Partial<ConfigPlugin>;

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

// ============================================================================
// EXPORTS
// ============================================================================

export type { ConfigPlugin };

