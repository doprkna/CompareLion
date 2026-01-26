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
export * from './rewardConfig';
export * from './security';
export * from './toastTheme';
export * from './wildcards';
export * from './schema';
export * from './defaults';
export { initUnifiedConfig, getUnifiedConfig, getConfig, getConfigValue, getGameplayConfig, getUiConfig, getApiConfig, getAppConfig, getPlatformConfig, getSecurityConfig, getFeaturesConfig, applyConfigPlugins, ConfigManager, } from './unified';
export type { UnifiedConfig, PartialUnifiedConfig, ConfigMetadata, ConfigPlugin as UnifiedConfigPlugin } from './unified';
export * from './load';
export * from './plugins';
export declare const config: Readonly<import("./schema").UnifiedConfig>;
