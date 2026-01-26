/**
 * Unified Config Schema
 * C6 Step 2: Canonical Unified Config Map
 * v0.42.18
 *
 * TypeScript interfaces for all config namespaces.
 * This defines the structure - real values will be migrated in Step 3.
 */
/**
 * Config severity levels
 */
export type ConfigSeverity = 'critical' | 'normal' | 'legacy';
/**
 * Environment layer
 */
export type EnvironmentLayer = 'development' | 'production' | 'test';
export interface GameplayXpConfig {
    levelMultiplier: number;
    questionBase: number;
    difficulty: {
        easy: number;
        medium: number;
        hard: number;
    };
    streakBonus: {
        [key: number]: number;
    };
}
export interface GameplayCurrencyConfig {
    startingFunds: number;
    startingDiamonds: number;
    names: {
        funds: string;
        diamonds: string;
    };
    symbols: {
        funds: string;
        diamonds: string;
    };
    exchangeRate: {
        fundsPerDiamond: number;
        diamondPerFunds: number;
    };
}
export interface GameplayEconomyConfig {
    xpToCoinsRatio: number;
    rewards: {
        questionAnswered: number;
        correctAnswer: number;
        dailyLogin: number;
        streakBonus: number;
        submissionApproved: number;
        eventParticipation: number;
        upvoteReceived: number;
    };
    season: {
        durationDays: number;
        resetOnNewSeason: {
            coins: boolean;
            seasonalXP: boolean;
            leaderboard: boolean;
            cosmetics: boolean;
        };
        archiveData: boolean;
    };
    shop: {
        refreshHours: number;
        featuredItemsCount: number;
    };
    cosmeticPricing: {
        common: {
            min: number;
            max: number;
        };
        uncommon: {
            min: number;
            max: number;
        };
        rare: {
            min: number;
            max: number;
        };
        epic: {
            min: number;
            max: number;
        };
        legendary: {
            min: number;
            max: number;
        };
    };
}
export interface GameplayRewardsConfig {
    base: {
        xp: number;
        gold: number;
    };
    kill: {
        xp: number;
        gold: number;
    };
    boss: {
        xp: number;
        gold: number;
    };
    reflection: {
        xp: number;
        gold: number;
    };
    quiz: {
        xp: number;
        gold: number;
    };
    achievement: {
        xp: number;
        gold: number;
    };
    streakMultiplier: {
        perKill: number;
        max: number;
    };
    difficultyMultiplier: {
        easy: number;
        normal: number;
        hard: number;
        boss: number;
    };
    powerScaling: {
        base: number;
        perPower: number;
        cap: number;
    };
    caps: {
        maxXp: number;
        maxGold: number;
    };
    drops: {
        rare: number;
        epic: number;
        legendary: number;
        alpha: number;
    };
}
export interface GameplayKarmaConfig {
    tiers: {
        saint: number;
        virtuous: number;
        good: number;
        neutralGood: number;
        neutral: number;
        neutralBad: number;
        chaotic: number;
        villain: number;
    };
    actions: {
        challengeAccepted: number;
        challengeDeclined: number;
        socialHelped: number;
        socialResponded: number;
        socialReacted: number;
        socialIgnored: number;
        socialReported: number;
    };
    caps: {
        perAnswer: {
            min: number;
            max: number;
        };
        total: {
            min: number;
            max: number;
        };
    };
}
export interface GameplayPrestigeConfig {
    cap: number;
    tiers: {
        legendary: number;
        renowned: number;
        distinguished: number;
        respected: number;
        known: number;
        emerging: number;
        novice: number;
    };
    bonuses: {
        xpMultiplier: number;
        duelWinMultiplier: number;
        friendMultiplier: number;
        friendCap: number;
    };
}
export interface GameplayScoringConfig {
    difficulty: {
        easy: number;
        medium: number;
        hard: number;
    };
    actions: {
        questionAnswered: number;
        questionSkipped: number;
        achievementUnlocked: number;
        challengeCompleted: number;
        duelWon: number;
        duelLost: number;
    };
}
export interface GameplayAchievementsConfig {
    points: {
        bronze: number;
        silver: number;
        gold: number;
        platinum: number;
        diamond: number;
    };
    rarity: {
        common: number;
        uncommon: number;
        rare: number;
        epic: number;
        legendary: number;
    };
}
export interface GameplayLeaderboardConfig {
    topPlayersCount: number;
    updateIntervalMinutes: number;
    rewardTopPlayers: boolean;
    seasonEndRewards: {
        rank1: {
            xp: number;
            coins: number;
            diamondsBonus: number;
        };
        rank2: {
            xp: number;
            coins: number;
            diamondsBonus: number;
        };
        rank3: {
            xp: number;
            coins: number;
            diamondsBonus: number;
        };
        rank4to10: {
            xp: number;
            coins: number;
            diamondsBonus: number;
        };
        rank11to50: {
            xp: number;
            coins: number;
            diamondsBonus: number;
        };
    };
}
export interface GameplayDefaultsConfig {
    user: {
        level: number;
        xp: number;
        funds: number;
        diamonds: number;
        karmaScore: number;
        prestigeScore: number;
        questionsAnswered: number;
        score: number;
        streak: number;
    };
}
export interface GameplayConfig {
    xp: GameplayXpConfig;
    currency: GameplayCurrencyConfig;
    economy: GameplayEconomyConfig;
    rewards: GameplayRewardsConfig;
    karma: GameplayKarmaConfig;
    prestige: GameplayPrestigeConfig;
    scoring: GameplayScoringConfig;
    achievements: GameplayAchievementsConfig;
    leaderboard: GameplayLeaderboardConfig;
    defaults: GameplayDefaultsConfig;
}
export interface UiTimingConfig {
    debounce: {
        search: number;
        input: number;
        save: number;
    };
    animation: {
        fast: number;
        normal: number;
        slow: number;
        xpGain: number;
    };
    polling: {
        presence: number;
        notifications: number;
        leaderboard: number;
    };
}
export interface UiToastConfig {
    maxToasts: number;
    defaultDuration: number;
    notificationDuration: number;
    tooltipDelay: number;
    marketDebounce: number;
    progressAnimationDuration: number;
}
export interface UiColorsConfig {
    karma: {
        saint: string;
        virtuous: string;
        good: string;
        neutralGood: string;
        neutral: string;
        neutralBad: string;
        chaotic: string;
        villain: string;
    };
    prestige: {
        legendary: string;
        renowned: string;
        distinguished: string;
        respected: string;
        known: string;
        emerging: string;
        novice: string;
    };
    difficulty: {
        easy: string;
        medium: string;
        hard: string;
    };
    status: {
        success: string;
        warning: string;
        error: string;
        info: string;
    };
}
export interface UiMoodConfig {
    themes: {
        joy: {
            primary: string;
            secondary: string;
            gradient: string;
            emoji: string;
        };
        sad: {
            primary: string;
            secondary: string;
            gradient: string;
            emoji: string;
        };
        anger: {
            primary: string;
            secondary: string;
            gradient: string;
            emoji: string;
        };
        calm: {
            primary: string;
            secondary: string;
            gradient: string;
            emoji: string;
        };
        chaos: {
            primary: string;
            secondary: string;
            gradient: string;
            emoji: string;
        };
        hope: {
            primary: string;
            secondary: string;
            gradient: string;
            emoji: string;
        };
        default: {
            primary: string;
            secondary: string;
            gradient: string;
            emoji?: string;
        };
    };
}
export interface UiTypographyConfig {
    fontSize: {
        h1: string;
        h2: string;
        h3: string;
        h4: string;
        body: string;
        label: string;
        caption: string;
    };
    lineHeight: {
        tight: string;
        snug: string;
        normal: string;
        relaxed: string;
    };
    fontWeight: {
        normal: string;
        medium: string;
        semibold: string;
        bold: string;
    };
}
export interface UiSpacingConfig {
    scale: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        '2xl': number;
        '3xl': number;
    };
}
export interface UiRadiiConfig {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
}
export interface UiShadowsConfig {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    none: string;
}
export interface UiConfig {
    timing: UiTimingConfig;
    toast: UiToastConfig;
    colors: UiColorsConfig;
    mood: UiMoodConfig;
    typography: UiTypographyConfig;
    spacing: UiSpacingConfig;
    radii: UiRadiiConfig;
    shadows: UiShadowsConfig;
}
export interface ApiClientConfig {
    baseURL: string;
    timeout: number;
    retry: {
        maxRetries: number;
        initialDelay: number;
        maxDelay: number;
        exponentialBackoff: boolean;
        retryableStatusCodes: number[];
    };
    headers: {
        'Content-Type': string;
    };
    credentials: RequestCredentials;
}
export interface ApiPaginationConfig {
    defaultPageSize: number;
    maxPageSize: number;
    defaultLimit: number;
    maxLimit: number;
    marketDefaultLimit: number;
    loreDefaultLimit: number;
    lootMomentsDefaultLimit: number;
}
export interface ApiGeneratorConfig {
    maxConcurrency: number;
    questionsPerCategoryMin: number;
    questionsPerCategoryMax: number;
    batchSize: number;
    maxRetries: number;
    retryDelayMs: number;
    languages: string[];
    gptUrl: string;
    gptKey: string;
    adminToken: string;
    dryRun: boolean;
}
export interface ApiConfig {
    client: ApiClientConfig;
    pagination: ApiPaginationConfig;
    generator: ApiGeneratorConfig;
}
export interface AppLimitsConfig {
    questions: {
        maxPerDay: number;
        maxSkipPerDay: number;
        timeoutSeconds: number;
    };
    social: {
        maxFriends: number;
        maxFriendRequests: number;
        maxClanSize: number;
    };
    content: {
        maxAnswerLength: number;
        minAnswerLength: number;
        maxBioLength: number;
        maxUsernameLength: number;
    };
}
export interface AppPollingConfig {
    presence: number;
    notifications: number;
    leaderboard: number;
    heartbeat: number;
    duetRun: number;
    globalMood: number;
    notificationToasts: number;
}
export interface AppCacheConfig {
    defaultTtl: number;
    maxSize: number;
    storeTtls: {
        dailyFork: number;
        social: number;
        latestLore: number;
        chronicle: number;
        firesides: number;
        season: number;
        rituals: number;
        badges: number;
        rarities: number;
        recipes: number;
        lore: number;
        discoveries: number;
    };
    marketRefreshIntervals: {
        featured: number;
        transactions: number;
        balance: number;
        systemAlerts: number;
        wallet: number;
        adminEconomy: number;
    };
    marketDedupingIntervals: {
        default: number;
        transactions: number;
        balance: number;
        systemAlerts: number;
        wallet: number;
        adminEconomy: number;
    };
    inventoryDedupingInterval: number;
}
export interface AppConfig {
    limits: AppLimitsConfig;
    polling: AppPollingConfig;
    cache: AppCacheConfig;
}
export interface PlatformRedisConfig {
    maxRetriesPerRequest: number;
    enableReadyCheck: boolean;
}
export interface PlatformEnvironmentConfig {
    isProd: boolean;
    isDev: boolean;
    hasRedis: boolean;
    hasDb: boolean;
    nodeEnv: string;
    redisUrl?: string;
    databaseUrl?: string;
}
export interface PlatformConfig {
    redis: PlatformRedisConfig;
    environment: PlatformEnvironmentConfig;
}
export interface SecurityAuthConfig {
    maxFailedAttempts: number;
    demoBypass: boolean;
}
export interface SecurityCaptchaConfig {
    enabled: boolean;
    siteKey: string;
    secret: string;
    apiUrl: string;
}
export interface SecurityRateLimitConfig {
    enabled: boolean;
}
export interface SecurityConfig {
    auth: SecurityAuthConfig;
    captcha: SecurityCaptchaConfig;
    rateLimit: SecurityRateLimitConfig;
}
export interface FeaturesConfig {
    enableBase: boolean;
    enableTrials: boolean;
    enableThemes: boolean;
    enableEconomyV2: boolean;
    enableAnalytics: boolean;
    environment: EnvironmentLayer;
}
/**
 * Unified Config Schema
 * Root interface for all configuration namespaces
 */
export interface UnifiedConfig {
    gameplay: GameplayConfig;
    ui: UiConfig;
    api: ApiConfig;
    app: AppConfig;
    platform: PlatformConfig;
    security: SecurityConfig;
    features: FeaturesConfig;
}
/**
 * Partial config for overrides
 */
export type PartialUnifiedConfig = Partial<{
    [K in keyof UnifiedConfig]: Partial<UnifiedConfig[K]>;
}>;
/**
 * Config metadata for each key
 */
export interface ConfigMetadata {
    severity: ConfigSeverity;
    description?: string;
    source?: string;
    defaultValue?: unknown;
    required?: boolean;
    environment?: EnvironmentLayer[];
}
/**
 * Validation error
 */
export interface ConfigValidationError {
    path: string;
    message: string;
    expected?: string;
    actual?: string;
}
/**
 * Validation result
 */
export interface ConfigValidationResult {
    valid: boolean;
    errors: ConfigValidationError[];
    warnings: string[];
}
/**
 * Runtime validation for config values
 * Validates types, ranges, enums, and required fields
 */
export declare function validateConfig(config: Partial<UnifiedConfig>): ConfigValidationResult;
