/**
 * PareL Application Configuration
 * Centralized config for version, features, and environment
 * v0.13.2p - Public Beta Release
 */
export declare const APP_VERSION = "0.25.3";
export declare const APP_NAME = "PareL";
export declare const APP_DESCRIPTION = "Answer questions, compare yourself with others, and level up through gamified polling and self-discovery";
export declare const IS_PRODUCTION: boolean;
export declare const IS_DEVELOPMENT: boolean;
export declare const IS_BETA: boolean;
export declare const FEATURES: {
    readonly AUTHENTICATION: true;
    readonly FLOW_SYSTEM: true;
    readonly PROFILE: true;
    readonly FRIENDS: true;
    readonly LEADERBOARD: true;
    readonly CHALLENGES: true;
    readonly INVITE_SYSTEM: true;
    readonly MESSAGING: true;
    readonly GROUPS: true;
    readonly ADMIN_PANEL: true;
    readonly METRICS_DASHBOARD: true;
    readonly ECONOMY: false;
    readonly FACTIONS: false;
    readonly GUILDS: false;
    readonly CRAFTING: false;
    readonly DUELS: false;
    readonly QUESTS: false;
    readonly NFT_AVATARS: false;
    readonly CREATOR_MODE: false;
    readonly DEV_TOOLS: boolean;
    readonly DEBUG_MODE: boolean;
};
export declare const ANALYTICS: {
    readonly ENABLED: boolean;
    readonly FLUSH_INTERVAL: 30000;
    readonly BATCH_SIZE: 50;
    readonly LOG_PII: false;
};
export declare const API: {
    readonly TIMEOUT: 10000;
    readonly RETRY_COUNT: 3;
    readonly RATE_LIMIT: 100;
};
export declare const BUILD_INFO: {
    readonly VERSION: "0.25.3";
    readonly BUILD_ID: string;
    readonly BUILD_TIME: string;
    readonly ENVIRONMENT: string;
};
export declare const STRIPE_CONFIG: {
    readonly SECRET_KEY: string;
    readonly WEBHOOK_SECRET: string;
    readonly PUBLISHABLE_KEY: string;
    readonly API_VERSION: "2025-09-30.clover";
};
export declare const STRIPE_SECRET_KEY: string;
export declare const STRIPE_WEBHOOK_SECRET: string;
export declare const NEXT_PUBLIC_APP_URL: string;
export declare const LOGGING: {
    readonly INCLUDE_BUILD_ID: true;
    readonly INCLUDE_ENV_TAG: true;
    readonly SANITIZE_ERRORS: boolean;
};
export declare const PERFORMANCE: {
    readonly TARGET_LOAD_TIME: 1000;
    readonly TARGET_TTI: 2000;
    readonly TARGET_FCP: 800;
};
/**
 * Check if a feature is enabled
 */
export declare function isFeatureEnabled(feature: keyof typeof FEATURES): boolean;
/**
 * Get app metadata for meta tags
 */
export declare function getAppMetadata(): {
    title: string;
    description: string;
    version: string;
    url: string;
    image: string;
};
/**
 * Get build info for logging
 */
export declare function getBuildTag(): string;
export declare const QGEN_BATCH_SIZE: number;
export declare const QGEN_DAILY_LIMIT: number;
export declare const SCHEDULER_INTERVAL_MS: number;
export declare const FEEDBACK_REWARD_XP: number;
export declare const FEEDBACK_REWARD_COINS: number;
export declare const FEEDBACK_ENABLED: boolean;
