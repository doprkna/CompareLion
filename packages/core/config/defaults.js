/**
 * Unified Config Defaults
 * C6 Step 3: Migration of Real Values
 * v0.42.19
 *
 * Real default values migrated from scattered constants.
 * Migrated from: packages/core/config/constants.ts, rewardConfig.ts
 */
/**
 * Gameplay config defaults
 * Migrated from packages/core/config/constants.ts and rewardConfig.ts
 */
const gameplayDefaults = {
    xp: {
        levelMultiplier: 100,
        questionBase: 10,
        difficulty: {
            easy: 1,
            medium: 2,
            hard: 3,
        },
        streakBonus: {
            5: 1.1, // 10% bonus at 5 streak
            10: 1.2, // 20% bonus at 10 streak
            20: 1.5, // 50% bonus at 20 streak
            50: 2.0, // 100% bonus at 50 streak
        },
    },
    currency: {
        startingFunds: 1000,
        startingDiamonds: 0,
        names: {
            funds: 'Funds',
            diamonds: 'Diamonds',
        },
        symbols: {
            funds: '💰',
            diamonds: '💎',
        },
        exchangeRate: {
            fundsPerDiamond: 100,
            diamondPerFunds: 0.01,
        },
    },
    economy: {
        xpToCoinsRatio: 10, // 10 XP = 1 coin
        rewards: {
            questionAnswered: 1,
            correctAnswer: 2,
            dailyLogin: 5,
            streakBonus: 3,
            submissionApproved: 25,
            eventParticipation: 10,
            upvoteReceived: 1,
        },
        season: {
            durationDays: 90,
            resetOnNewSeason: {
                coins: true,
                seasonalXP: true,
                leaderboard: true,
                cosmetics: false,
            },
            archiveData: true,
        },
        shop: {
            refreshHours: 24,
            featuredItemsCount: 3,
        },
        cosmeticPricing: {
            common: { min: 10, max: 50 },
            uncommon: { min: 50, max: 100 },
            rare: { min: 100, max: 250 },
            epic: { min: 250, max: 500 },
            legendary: { min: 500, max: 1000 },
        },
    },
    rewards: {
        base: { xp: 10, gold: 2 },
        kill: { xp: 50, gold: 10 },
        boss: { xp: 200, gold: 60 },
        reflection: { xp: 25, gold: 5 },
        quiz: { xp: 20, gold: 5 },
        achievement: { xp: 100, gold: 0 },
        streakMultiplier: {
            perKill: 0.05, // 5% bonus per streak kill
            max: 2.0, // Cap at 2x (100% bonus)
        },
        difficultyMultiplier: {
            easy: 0.8,
            normal: 1.0,
            hard: 1.2,
            boss: 2.5,
        },
        powerScaling: {
            base: 1.0,
            perPower: 0.01, // 1% per power point
            cap: 1.5, // Cap at 50% bonus
        },
        caps: {
            maxXp: 1000000,
            maxGold: 100000,
        },
        drops: {
            rare: 0.05, // 5% chance for rare item
            epic: 0.02, // 2% chance for epic item
            legendary: 0.005, // 0.5% chance for legendary item
            alpha: 0.001, // 0.1% chance for alpha item
        },
    },
    karma: {
        tiers: {
            saint: 100,
            virtuous: 50,
            good: 20,
            neutralGood: 5,
            neutral: 0,
            neutralBad: -5,
            chaotic: -20,
            villain: -50,
        },
        actions: {
            challengeAccepted: 1,
            challengeDeclined: -1,
            socialHelped: 2,
            socialResponded: 1,
            socialReacted: 0.5,
            socialIgnored: -0.5,
            socialReported: -2,
        },
        caps: {
            perAnswer: { min: -5, max: 5 },
            total: { min: -1000, max: 1000 },
        },
    },
    prestige: {
        cap: 100,
        tiers: {
            legendary: 90,
            renowned: 75,
            distinguished: 60,
            respected: 40,
            known: 20,
            emerging: 5,
            novice: 0,
        },
        bonuses: {
            xpMultiplier: 2,
            duelWinMultiplier: 0.5,
            friendMultiplier: 0.2,
            friendCap: 5,
        },
    },
    scoring: {
        difficulty: {
            easy: 1,
            medium: 2,
            hard: 3,
        },
        actions: {
            questionAnswered: 1,
            questionSkipped: 0,
            achievementUnlocked: 10,
            challengeCompleted: 5,
            duelWon: 3,
            duelLost: -1,
        },
    },
    achievements: {
        points: {
            bronze: 10,
            silver: 25,
            gold: 50,
            platinum: 100,
            diamond: 250,
        },
        rarity: {
            common: 1.0,
            uncommon: 0.5,
            rare: 0.1,
            epic: 0.01,
            legendary: 0.001,
        },
    },
    leaderboard: {
        topPlayersCount: 100,
        updateIntervalMinutes: 5,
        rewardTopPlayers: true,
        seasonEndRewards: {
            rank1: { xp: 500, coins: 0, diamondsBonus: 100 },
            rank2: { xp: 300, coins: 0, diamondsBonus: 50 },
            rank3: { xp: 200, coins: 0, diamondsBonus: 25 },
            rank4to10: { xp: 100, coins: 0, diamondsBonus: 10 },
            rank11to50: { xp: 50, coins: 0, diamondsBonus: 5 },
        },
    },
    defaults: {
        user: {
            level: 1,
            xp: 0,
            funds: 1000,
            diamonds: 0,
            karmaScore: 0,
            prestigeScore: 0,
            questionsAnswered: 0,
            score: 0,
            streak: 0,
        },
    },
};
/**
 * UI config defaults
 * Migrated from packages/core/config/constants.ts, hooks, and UI components
 * v0.42.20 - C6 Step 4: UI Tokens Migration
 */
const uiDefaults = {
    timing: {
        debounce: {
            search: 300,
            input: 500,
            save: 1000,
        },
        animation: {
            fast: 150,
            normal: 300,
            slow: 500,
            xpGain: 1000,
        },
        polling: {
            presence: 30000, // 30s
            notifications: 60000, // 1m
            leaderboard: 300000, // 5m
        },
    },
    toast: {
        maxToasts: 5, // from useRewardToast.ts
        defaultDuration: 5000, // 5 seconds - from useRewardToast.ts
        notificationDuration: 3000, // 3 seconds - from useNotificationToasts.ts
        tooltipDelay: 200, // from tooltip.tsx default
        marketDebounce: 200, // from useMarket.ts default
        progressAnimationDuration: 300, // from progress.tsx duration-300
    },
    colors: {
        karma: {
            saint: 'text-blue-400',
            virtuous: 'text-green-400',
            good: 'text-green-300',
            neutralGood: 'text-gray-300',
            neutral: 'text-gray-400',
            neutralBad: 'text-gray-500',
            chaotic: 'text-red-300',
            villain: 'text-red-500',
        },
        prestige: {
            legendary: 'text-yellow-400',
            renowned: 'text-purple-400',
            distinguished: 'text-blue-400',
            respected: 'text-green-400',
            known: 'text-gray-300',
            emerging: 'text-gray-400',
            novice: 'text-gray-500',
        },
        difficulty: {
            easy: 'text-green-500',
            medium: 'text-yellow-500',
            hard: 'text-red-500',
        },
        status: {
            success: 'text-green-500',
            warning: 'text-yellow-500',
            error: 'text-red-500',
            info: 'text-blue-500',
        },
    },
    mood: {
        themes: {
            joy: {
                primary: '#fbbf24',
                secondary: '#f59e0b',
                gradient: 'from-yellow-400 to-orange-400',
                emoji: '😊',
            },
            sad: {
                primary: '#6b7280',
                secondary: '#4b5563',
                gradient: 'from-gray-400 to-gray-600',
                emoji: '😢',
            },
            anger: {
                primary: '#ef4444',
                secondary: '#dc2626',
                gradient: 'from-red-500 to-red-700',
                emoji: '😠',
            },
            calm: {
                primary: '#10b981',
                secondary: '#059669',
                gradient: 'from-green-400 to-emerald-500',
                emoji: '🌿',
            },
            chaos: {
                primary: '#8b5cf6',
                secondary: '#7c3aed',
                gradient: 'from-purple-500 to-indigo-600',
                emoji: '🌀',
            },
            hope: {
                primary: '#3b82f6',
                secondary: '#2563eb',
                gradient: 'from-blue-400 to-blue-600',
                emoji: '✨',
            },
            default: {
                primary: '#4a90e2',
                secondary: '#7bc8a4',
                gradient: 'from-blue-400 to-green-400',
            },
        },
    },
    typography: {
        fontSize: {
            h1: 'text-4xl',
            h2: 'text-3xl',
            h3: 'text-2xl',
            h4: 'text-xl',
            body: 'text-base',
            label: 'text-sm',
            caption: 'text-xs',
        },
        lineHeight: {
            tight: 'leading-tight',
            snug: 'leading-snug',
            normal: 'leading-normal',
            relaxed: 'leading-relaxed',
        },
        fontWeight: {
            normal: 'font-normal',
            medium: 'font-medium',
            semibold: 'font-semibold',
            bold: 'font-bold',
        },
    },
    spacing: {
        // Tailwind spacing scale (in rem for reference)
        scale: {
            xs: 0.25, // 4px
            sm: 0.5, // 8px
            md: 1, // 16px
            lg: 1.5, // 24px
            xl: 2, // 32px
            '2xl': 3, // 48px
            '3xl': 4, // 64px
        },
    },
    radii: {
        // Border radius Tailwind classes
        sm: 'rounded-sm', // 0.125rem / 2px
        md: 'rounded-md', // 0.375rem / 6px
        lg: 'rounded-lg', // 0.5rem / 8px
        xl: 'rounded-xl', // 0.75rem / 12px
        full: 'rounded-full', // 9999px
    },
    shadows: {
        // Shadow Tailwind classes
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
        none: 'shadow-none',
    },
};
/**
 * API config defaults
 * Migrated from packages/api/src/client/config.ts, packages/core/utils/pagination.ts, packages/api/src/envelope.ts
 * Generator config values come from environment variables (handled in unified.ts)
 */
const apiDefaults = {
    client: {
        baseURL: '/api',
        timeout: 30000, // 30 seconds
        retry: {
            maxRetries: 3,
            initialDelay: 1000, // 1 second
            maxDelay: 10000, // 10 seconds
            exponentialBackoff: true,
            retryableStatusCodes: [
                408, // Request Timeout
                429, // Too Many Requests
                500, // Internal Server Error
                502, // Bad Gateway
                503, // Service Unavailable
                504, // Gateway Timeout
            ],
        },
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
    },
    pagination: {
        defaultPageSize: 20, // from DEFAULTS.pagination.pageSize and envelope.ts
        maxPageSize: 100, // from DEFAULTS.pagination.maxPageSize and envelope.ts
        defaultLimit: 20, // from pagination.ts defaultLimit
        maxLimit: 100, // from pagination.ts maxLimit
        marketDefaultLimit: 20, // from useMarket.ts
        loreDefaultLimit: 20, // from useLore.ts default
        lootMomentsDefaultLimit: 5, // from useLootMoments.ts default
    },
    generator: {
        // These are set from environment in unified.ts, but provide defaults here
        maxConcurrency: 2,
        questionsPerCategoryMin: 5,
        questionsPerCategoryMax: 12,
        batchSize: 50,
        maxRetries: 3,
        retryDelayMs: 1000,
        languages: ['en'],
        gptUrl: '',
        gptKey: '',
        adminToken: '',
        dryRun: false,
    },
};
/**
 * App config defaults
 * Migrated from packages/core/config/constants.ts, hooks, and stores
 */
const appDefaults = {
    limits: {
        questions: {
            maxPerDay: 100,
            maxSkipPerDay: 20,
            timeoutSeconds: 300,
        },
        social: {
            maxFriends: 100,
            maxFriendRequests: 50,
            maxClanSize: 50,
        },
        content: {
            maxAnswerLength: 5000,
            minAnswerLength: 1,
            maxBioLength: 500,
            maxUsernameLength: 30,
        },
    },
    polling: {
        presence: 30000, // 30s - from TIMING_CONSTANTS.POLLING.presence
        notifications: 60000, // 1m - from TIMING_CONSTANTS.POLLING.notifications
        leaderboard: 300000, // 5m - from TIMING_CONSTANTS.POLLING.leaderboard
        heartbeat: 25000, // 25s - from usePresence.ts HEARTBEAT_INTERVAL_MS
        duetRun: 5000, // 5s - from useDuetRun.ts setInterval
        globalMood: 300000, // 5m - from useGlobalMood.ts setInterval
        notificationToasts: 30000, // 30s - from useNotificationToasts.ts setInterval
    },
    cache: {
        defaultTtl: 5 * 60 * 1000, // 5 minutes - from cache.ts DEFAULT_CONFIG
        maxSize: 1000, // from cache.ts DEFAULT_CONFIG
        storeTtls: {
            dailyFork: 2 * 60 * 1000, // 2 minutes - from dailyForkStore.ts
            social: 5 * 60 * 1000, // 5 minutes - from socialStore.ts
            latestLore: 5 * 60 * 1000, // 5 minutes - from latestLoreStore.ts
            chronicle: 10 * 60 * 1000, // 10 minutes - from chronicleStore.ts
            firesides: 5 * 60 * 1000, // 5 minutes - from firesidesStore.ts
            season: 2 * 60 * 1000, // 2 minutes - from seasonStore.ts
            rituals: 2 * 60 * 1000, // 2 minutes - from ritualsStore.ts
            badges: 5 * 60 * 1000, // 5 minutes - from badgesStore.ts
            rarities: 10 * 60 * 1000, // 10 minutes - from raritiesStore.ts
            recipes: 5 * 60 * 1000, // 5 minutes - from recipesStore.ts
            lore: 5 * 60 * 1000, // 5 minutes - from loreStore.ts
            discoveries: 5 * 60 * 1000, // 5 minutes - from discoveriesStore.ts
        },
        marketRefreshIntervals: {
            featured: 10 * 60 * 1000, // 10 minutes - from useMarket.ts
            transactions: 2 * 60 * 1000, // 2 minutes - from useMarket.ts
            balance: 2 * 60 * 1000, // 2 minutes - from useMarket.ts
            systemAlerts: 30 * 1000, // 30 seconds - from useMarket.ts
            wallet: 60 * 1000, // 60 seconds - from useMarket.ts
            adminEconomy: 5 * 60 * 1000, // 5 minutes - from useMarket.ts
        },
        marketDedupingIntervals: {
            default: 60 * 1000, // 1 minute - from useMarket.ts
            transactions: 60 * 1000, // 1 minute - from useMarket.ts
            balance: 60 * 1000, // 1 minute - from useMarket.ts
            systemAlerts: 10 * 1000, // 10 seconds - from useMarket.ts
            wallet: 30 * 1000, // 30 seconds - from useMarket.ts
            adminEconomy: 60 * 1000, // 1 minute - from useMarket.ts
        },
        inventoryDedupingInterval: 5000, // 5 seconds - from useInventory.ts
    },
};
/**
 * Platform config defaults
 * Migrated from packages/core/config/env.ts and packages/redis/src/client.ts
 * Environment values are set dynamically in unified.ts
 */
const platformDefaults = {
    redis: {
        maxRetriesPerRequest: 3, // from redis/src/client.ts
        enableReadyCheck: true, // from redis/src/client.ts
    },
    environment: {
        // These are set dynamically from process.env in unified.ts
        isProd: false,
        isDev: false,
        hasRedis: false,
        hasDb: false,
        nodeEnv: process.env.NODE_ENV || 'development',
        redisUrl: process.env.REDIS_URL,
        databaseUrl: process.env.DATABASE_URL,
    },
};
/**
 * Security config defaults
 * Migrated from packages/core/config/security.ts
 * Some values are derived from environment in unified.ts
 */
const securityDefaults = {
    auth: {
        maxFailedAttempts: 3, // from securityConfig.maxFailedAttempts
        demoBypass: false, // set from env in unified.ts
    },
    captcha: {
        enabled: false, // set from env in unified.ts
        siteKey: '', // set from env in unified.ts
        secret: '', // set from env in unified.ts
        apiUrl: 'https://hcaptcha.com/siteverify', // hardcoded in security.ts
    },
    rateLimit: {
        enabled: false, // set from redis availability in unified.ts
    },
};
/**
 * Features config defaults
 * Migrated from packages/core/config/flags.ts (v0.42.21 - C6 Step 5)
 * enableAnalytics and environment are set dynamically from env in unified.ts
 */
const featuresDefaults = {
    enableBase: true, // Core base features - always enabled
    enableTrials: true, // Mount trials feature - enabled
    enableThemes: true, // Theme system - enabled
    enableEconomyV2: false, // Economy V2 - disabled (future feature)
    enableAnalytics: false, // Set from env in unified.ts
    environment: 'development', // Set from env in unified.ts
};
/**
 * Complete unified config defaults
 * v0.42.21 - C6 Step 5: Feature Flags Migration Complete
 *
 * Migrated namespaces:
 * - gameplay: ✅ Complete (from constants.ts, rewardConfig.ts)
 * - api: ✅ Complete (from api/client/config.ts, pagination.ts, envelope.ts)
 * - app: ✅ Complete (from constants.ts, hooks, stores)
 * - security: ✅ Complete (from security.ts)
 * - platform: ✅ Complete (from env.ts, redis/client.ts)
 * - ui: ✅ Complete (from constants.ts, hooks, UI components) - v0.42.20
 * - features: ✅ Complete (from flags.ts) - v0.42.21
 */
export const unifiedConfigDefaults = {
    gameplay: gameplayDefaults,
    ui: uiDefaults,
    api: apiDefaults,
    app: appDefaults,
    platform: platformDefaults,
    security: securityDefaults,
    features: featuresDefaults,
};
