// Legacy exports (still in use, will be gradually deprecated)
export * from './ambientConfig';
export * from './archetypeConfig';
/** @deprecated Use unified config instead. See packages/core/config/constants.ts for migration guide. */
export * from './constants';
export * from './env';
/** @deprecated Use getFeatureFlag from './flags' instead. */
export * from './flags';
export * from './generator';
export * from './itemEffects';
export * from './musicThemes';
export * from './questionSeeds';
export * from './rarityConfig';
export * from './regions';
export { RewardConfig } from './rewardConfig';
export * from './security';
export * from './toastTheme';
export * from './wildcards';

// Unified Config System (C6 Step 7 - v0.42.23)
// Main entrypoint for unified config
export * from './schema';
export * from './defaults';
// Note: unified.ts exports registerConfigPlugin which conflicts with plugins.ts
// Export unified functions explicitly, excluding registerConfigPlugin (use plugins.ts instead)
export {
  initUnifiedConfig,
  getUnifiedConfig,
  getConfig,
  getConfigValue,
  getGameplayConfig,
  getUiConfig,
  getApiConfig,
  getAppConfig,
  getPlatformConfig,
  getSecurityConfig,
  getFeaturesConfig,
  applyConfigPlugins,
  ConfigManager,
} from './unified';
export type { UnifiedConfig, PartialUnifiedConfig, ConfigMetadata, ConfigPlugin as UnifiedConfigPlugin } from './unified';
export * from './load';
export * from './plugins';

// Load and export validated config
// This is the single source of truth for config access
import { loadConfig } from './load';
export const config = loadConfig();

