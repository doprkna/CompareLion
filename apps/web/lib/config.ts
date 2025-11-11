/**
 * PareL Application Configuration
 * Centralized config for version, features, and environment
 * v0.13.2p - Public Beta Release
 */

export const APP_VERSION = '0.25.3';
export const APP_NAME = 'PareL';
export const APP_DESCRIPTION = 'Answer questions, compare yourself with others, and level up through gamified polling and self-discovery';

// Environment detection
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_BETA = process.env.NEXT_PUBLIC_ENV === 'beta' || process.env.VERCEL_ENV === 'preview';

// Feature flags for public beta
export const FEATURES = {
  // Core features (stable, always on)
  AUTHENTICATION: true,
  FLOW_SYSTEM: true,
  PROFILE: true,
  FRIENDS: true,
  
  // Community features (v0.13.2n - stable)
  LEADERBOARD: true,
  CHALLENGES: true,
  INVITE_SYSTEM: true,
  
  // Social features
  MESSAGING: true,
  GROUPS: true,
  
  // Admin features (only for admins)
  ADMIN_PANEL: true,
  METRICS_DASHBOARD: true,
  
  // Experimental features (DISABLED for public beta)
  ECONOMY: false,           // Shop, marketplace
  FACTIONS: false,          // Faction system
  GUILDS: false,            // Guild system (level-locked anyway)
  CRAFTING: false,          // Item crafting
  DUELS: false,             // PvP duels
  QUESTS: false,            // Narrative quests
  NFT_AVATARS: false,       // Blockchain features
  CREATOR_MODE: false,      // Creator tools
  
  // Developer features
  DEV_TOOLS: IS_DEVELOPMENT,
  DEBUG_MODE: IS_DEVELOPMENT,
} as const;

// Analytics configuration
export const ANALYTICS = {
  ENABLED: IS_PRODUCTION || IS_BETA,
  FLUSH_INTERVAL: 30000, // 30 seconds
  BATCH_SIZE: 50,
  LOG_PII: false, // Never log PII in production
} as const;

// API configuration
export const API = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_COUNT: 3,
  RATE_LIMIT: 100, // requests per minute
} as const;

// Build information
export const BUILD_INFO = {
  VERSION: APP_VERSION,
  BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev',
  BUILD_TIME: new Date().toISOString(),
  ENVIRONMENT: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV,
} as const;

// Stripe configuration
export const STRIPE_CONFIG = {
  SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  API_VERSION: '2025-09-30.clover' as const,
} as const;

// Export individual constants for backward compatibility
export const STRIPE_SECRET_KEY = STRIPE_CONFIG.SECRET_KEY;
export const STRIPE_WEBHOOK_SECRET = STRIPE_CONFIG.WEBHOOK_SECRET;
export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://parel.app';

// Logging configuration
export const LOGGING = {
  INCLUDE_BUILD_ID: true,
  INCLUDE_ENV_TAG: true,
  SANITIZE_ERRORS: IS_PRODUCTION || IS_BETA,
} as const;

// Performance targets
export const PERFORMANCE = {
  TARGET_LOAD_TIME: 1000, // 1 second
  TARGET_TTI: 2000, // Time to interactive
  TARGET_FCP: 800, // First contentful paint
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature] === true;
}

/**
 * Get app metadata for meta tags
 */
export function getAppMetadata() {
  return {
    title: `${APP_NAME} - Compare, Discover, Level Up`,
    description: APP_DESCRIPTION,
    version: APP_VERSION,
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://parel.app',
    image: '/og-image.png',
  };
}

/**
 * Get build info for logging
 */
export function getBuildTag(): string {
  return `${BUILD_INFO.VERSION}:${BUILD_INFO.BUILD_ID}:${BUILD_INFO.ENVIRONMENT}`;
}

// Question generation batch size (build safety)
export const QGEN_BATCH_SIZE = 20;
