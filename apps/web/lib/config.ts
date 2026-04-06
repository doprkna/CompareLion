/**
 * PareL Application Configuration
 * BRIDGE: Sources all values from @parel/core/config/unified.
 * Do not add local config - extend unified config instead.
 * v0.47+ Config Unification (#57)
 */

import {
  ensureUnifiedConfigInitialized,
  getConfig,
  getPlatformConfig,
} from '@parel/core/config/unified';

ensureUnifiedConfigInitialized();
const app = getConfig('app');
const platform = getPlatformConfig();
const meta = app.meta;

export const APP_VERSION = meta.buildInfo.version;
export const APP_NAME = meta.name;
export const APP_DESCRIPTION = meta.description;

export const IS_PRODUCTION = platform.environment.isProd;
export const IS_DEVELOPMENT = platform.environment.isDev;
export const IS_BETA = meta.isBeta;

export const FEATURES = meta.features as {
  readonly AUTHENTICATION: boolean;
  readonly FLOW_SYSTEM: boolean;
  readonly PROFILE: boolean;
  readonly FRIENDS: boolean;
  readonly LEADERBOARD: boolean;
  readonly CHALLENGES: boolean;
  readonly INVITE_SYSTEM: boolean;
  readonly MESSAGING: boolean;
  readonly GROUPS: boolean;
  readonly ADMIN_PANEL: boolean;
  readonly METRICS_DASHBOARD: boolean;
  readonly ECONOMY: boolean;
  readonly FACTIONS: boolean;
  readonly GUILDS: boolean;
  readonly CRAFTING: boolean;
  readonly DUELS: boolean;
  readonly QUESTS: boolean;
  readonly NFT_AVATARS: boolean;
  readonly CREATOR_MODE: boolean;
  readonly DEV_TOOLS: boolean;
  readonly DEBUG_MODE: boolean;
};

export const ANALYTICS = {
  ENABLED: IS_PRODUCTION || IS_BETA,
  FLUSH_INTERVAL: 30000,
  BATCH_SIZE: 50,
  LOG_PII: false,
} as const;

export const API = {
  TIMEOUT: 10000,
  RETRY_COUNT: 3,
  RATE_LIMIT: 100,
} as const;

export const BUILD_INFO = {
  VERSION: meta.buildInfo.version,
  BUILD_ID: meta.buildInfo.buildId,
  BUILD_TIME: meta.buildInfo.buildTime,
  ENVIRONMENT: meta.buildInfo.environment,
} as const;

export const STRIPE_CONFIG = {
  SECRET_KEY: meta.stripe.secretKey,
  WEBHOOK_SECRET: meta.stripe.webhookSecret,
  PUBLISHABLE_KEY: meta.stripe.publishableKey,
  API_VERSION: '2025-09-30.clover' as const,
} as const;

export const STRIPE_SECRET_KEY = meta.stripe.secretKey;
export const STRIPE_WEBHOOK_SECRET = meta.stripe.webhookSecret;
export const NEXT_PUBLIC_APP_URL = meta.appUrl;

export const LOGGING = {
  INCLUDE_BUILD_ID: true,
  INCLUDE_ENV_TAG: true,
  SANITIZE_ERRORS: IS_PRODUCTION || IS_BETA,
} as const;

export const PERFORMANCE = {
  TARGET_LOAD_TIME: 1000,
  TARGET_TTI: 2000,
  TARGET_FCP: 800,
} as const;

export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature] === true;
}

export function getAppMetadata() {
  return {
    title: `${APP_NAME} - Compare, Discover, Level Up`,
    description: APP_DESCRIPTION,
    version: APP_VERSION,
    url: meta.appUrl,
    image: '/og-image.png',
  };
}

export function getBuildTag(): string {
  return `${BUILD_INFO.VERSION}:${BUILD_INFO.BUILD_ID}:${BUILD_INFO.ENVIRONMENT}`;
}

export const QGEN_BATCH_SIZE = meta.qgenBatchSize;
export const QGEN_DAILY_LIMIT = meta.qgenDailyLimit;
export const SCHEDULER_INTERVAL_MS = meta.schedulerIntervalMs;

export const FEEDBACK_REWARD_XP = meta.feedback.rewardXp;
export const FEEDBACK_REWARD_COINS = meta.feedback.rewardCoins;
export const FEEDBACK_ENABLED = meta.feedback.enabled;
