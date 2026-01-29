/**
 * Unified Config Schema
 * C6 Step 2: Canonical Unified Config Map
 * v0.42.18
 * 
 * TypeScript interfaces for all config namespaces.
 * This defines the structure - real values will be migrated in Step 3.
 */

// ============================================================================
// BASE TYPES
// ============================================================================

/**
 * Config severity levels
 */
export type ConfigSeverity = 'critical' | 'normal' | 'legacy';

/**
 * Environment layer
 */
export type EnvironmentLayer = 'development' | 'production' | 'test';

// ============================================================================
// GAMEPLAY CONFIG
// ============================================================================

export interface GameplayXpConfig {
  levelMultiplier: number; // 100
  questionBase: number; // 10
  difficulty: {
    easy: number; // 1
    medium: number; // 2
    hard: number; // 3
  };
  streakBonus: {
    [key: number]: number; // { 5: 1.1, 10: 1.2, 20: 1.5, 50: 2.0 }
  };
}

export interface GameplayCurrencyConfig {
  startingFunds: number; // 1000
  startingDiamonds: number; // 0
  names: {
    funds: string; // 'Funds'
    diamonds: string; // 'Diamonds'
  };
  symbols: {
    funds: string; // '💰'
    diamonds: string; // '💎'
  };
  exchangeRate: {
    fundsPerDiamond: number; // 100
    diamondPerFunds: number; // 0.01
  };
}

export interface GameplayEconomyConfig {
  xpToCoinsRatio: number; // 10
  rewards: {
    questionAnswered: number; // 1
    correctAnswer: number; // 2
    dailyLogin: number; // 5
    streakBonus: number; // 3
    submissionApproved: number; // 25
    eventParticipation: number; // 10
    upvoteReceived: number; // 1
  };
  season: {
    durationDays: number; // 90
    resetOnNewSeason: {
      coins: boolean; // true
      seasonalXP: boolean; // true
      leaderboard: boolean; // true
      cosmetics: boolean; // false
    };
    archiveData: boolean; // true
  };
  shop: {
    refreshHours: number; // 24
    featuredItemsCount: number; // 3
  };
  cosmeticPricing: {
    common: { min: number; max: number }; // { min: 10, max: 50 }
    uncommon: { min: number; max: number }; // { min: 50, max: 100 }
    rare: { min: number; max: number }; // { min: 100, max: 250 }
    epic: { min: number; max: number }; // { min: 250, max: 500 }
    legendary: { min: number; max: number }; // { min: 500, max: 1000 }
  };
}

export interface GameplayRewardsConfig {
  base: { xp: number; gold: number }; // { xp: 10, gold: 2 }
  kill: { xp: number; gold: number }; // { xp: 50, gold: 10 }
  boss: { xp: number; gold: number }; // { xp: 200, gold: 60 }
  reflection: { xp: number; gold: number }; // { xp: 25, gold: 5 }
  quiz: { xp: number; gold: number }; // { xp: 20, gold: 5 }
  achievement: { xp: number; gold: number }; // { xp: 100, gold: 0 }
  streakMultiplier: {
    perKill: number; // 0.05
    max: number; // 2.0
  };
  difficultyMultiplier: {
    easy: number; // 0.8
    normal: number; // 1.0
    hard: number; // 1.2
    boss: number; // 2.5
  };
  powerScaling: {
    base: number; // 1.0
    perPower: number; // 0.01
    cap: number; // 1.5
  };
  caps: {
    maxXp: number; // 1000000
    maxGold: number; // 100000
  };
  drops: {
    rare: number; // 0.05
    epic: number; // 0.02
    legendary: number; // 0.005
    alpha: number; // 0.001
  };
}

export interface GameplayKarmaConfig {
  tiers: {
    saint: number; // 100
    virtuous: number; // 50
    good: number; // 20
    neutralGood: number; // 5
    neutral: number; // 0
    neutralBad: number; // -5
    chaotic: number; // -20
    villain: number; // -50
  };
  actions: {
    challengeAccepted: number; // 1
    challengeDeclined: number; // -1
    socialHelped: number; // 2
    socialResponded: number; // 1
    socialReacted: number; // 0.5
    socialIgnored: number; // -0.5
    socialReported: number; // -2
  };
  caps: {
    perAnswer: { min: number; max: number }; // { min: -5, max: 5 }
    total: { min: number; max: number }; // { min: -1000, max: 1000 }
  };
}

export interface GameplayPrestigeConfig {
  cap: number; // 100
  tiers: {
    legendary: number; // 90
    renowned: number; // 75
    distinguished: number; // 60
    respected: number; // 40
    known: number; // 20
    emerging: number; // 5
    novice: number; // 0
  };
  bonuses: {
    xpMultiplier: number; // 2
    duelWinMultiplier: number; // 0.5
    friendMultiplier: number; // 0.2
    friendCap: number; // 5
  };
}

export interface GameplayScoringConfig {
  difficulty: {
    easy: number; // 1
    medium: number; // 2
    hard: number; // 3
  };
  actions: {
    questionAnswered: number; // 1
    questionSkipped: number; // 0
    achievementUnlocked: number; // 10
    challengeCompleted: number; // 5
    duelWon: number; // 3
    duelLost: number; // -1
  };
}

export interface GameplayAchievementsConfig {
  points: {
    bronze: number; // 10
    silver: number; // 25
    gold: number; // 50
    platinum: number; // 100
    diamond: number; // 250
  };
  rarity: {
    common: number; // 1.0
    uncommon: number; // 0.5
    rare: number; // 0.1
    epic: number; // 0.01
    legendary: number; // 0.001
  };
}

export interface GameplayLeaderboardConfig {
  topPlayersCount: number; // 100
  updateIntervalMinutes: number; // 5
  rewardTopPlayers: boolean; // true
  seasonEndRewards: {
    rank1: { xp: number; coins: number; diamondsBonus: number }; // { xp: 500, coins: 0, diamondsBonus: 100 }
    rank2: { xp: number; coins: number; diamondsBonus: number }; // { xp: 300, coins: 0, diamondsBonus: 50 }
    rank3: { xp: number; coins: number; diamondsBonus: number }; // { xp: 200, coins: 0, diamondsBonus: 25 }
    rank4to10: { xp: number; coins: number; diamondsBonus: number }; // { xp: 100, coins: 0, diamondsBonus: 10 }
    rank11to50: { xp: number; coins: number; diamondsBonus: number }; // { xp: 50, coins: 0, diamondsBonus: 5 }
  };
}

export interface GameplayDefaultsConfig {
  user: {
    level: number; // 1
    xp: number; // 0
    funds: number; // 1000
    diamonds: number; // 0
    karmaScore: number; // 0
    prestigeScore: number; // 0
    questionsAnswered: number; // 0
    score: number; // 0
    streak: number; // 0
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

// ============================================================================
// UI CONFIG
// ============================================================================

export interface UiTimingConfig {
  debounce: {
    search: number; // 300
    input: number; // 500
    save: number; // 1000
  };
  animation: {
    fast: number; // 150
    normal: number; // 300
    slow: number; // 500
    xpGain: number; // 1000
  };
  polling: {
    presence: number; // 30000
    notifications: number; // 60000
    leaderboard: number; // 300000
  };
}

export interface UiToastConfig {
  maxToasts: number; // 5
  defaultDuration: number; // 5000
  notificationDuration: number; // 3000
  tooltipDelay: number; // 200
  marketDebounce: number; // 200
  progressAnimationDuration: number; // 300
}

export interface UiColorsConfig {
  karma: {
    saint: string; // 'text-blue-400'
    virtuous: string; // 'text-green-400'
    good: string; // 'text-green-300'
    neutralGood: string; // 'text-gray-300'
    neutral: string; // 'text-gray-400'
    neutralBad: string; // 'text-gray-500'
    chaotic: string; // 'text-red-300'
    villain: string; // 'text-red-500'
  };
  prestige: {
    legendary: string; // 'text-yellow-400'
    renowned: string; // 'text-purple-400'
    distinguished: string; // 'text-blue-400'
    respected: string; // 'text-green-400'
    known: string; // 'text-gray-300'
    emerging: string; // 'text-gray-400'
    novice: string; // 'text-gray-500'
  };
  difficulty: {
    easy: string; // 'text-green-500'
    medium: string; // 'text-yellow-500'
    hard: string; // 'text-red-500'
  };
  status: {
    success: string; // 'text-green-500'
    warning: string; // 'text-yellow-500'
    error: string; // 'text-red-500'
    info: string; // 'text-blue-500'
  };
}

export interface UiMoodConfig {
  themes: {
    joy: { primary: string; secondary: string; gradient: string; emoji: string };
    sad: { primary: string; secondary: string; gradient: string; emoji: string };
    anger: { primary: string; secondary: string; gradient: string; emoji: string };
    calm: { primary: string; secondary: string; gradient: string; emoji: string };
    chaos: { primary: string; secondary: string; gradient: string; emoji: string };
    hope: { primary: string; secondary: string; gradient: string; emoji: string };
    default: { primary: string; secondary: string; gradient: string; emoji?: string };
  };
}

export interface UiTypographyConfig {
  fontSize: {
    h1: string; // 'text-4xl'
    h2: string; // 'text-3xl'
    h3: string; // 'text-2xl'
    h4: string; // 'text-xl'
    body: string; // 'text-base'
    label: string; // 'text-sm'
    caption: string; // 'text-xs'
  };
  lineHeight: {
    tight: string; // 'leading-tight'
    snug: string; // 'leading-snug'
    normal: string; // 'leading-normal'
    relaxed: string; // 'leading-relaxed'
  };
  fontWeight: {
    normal: string; // 'font-normal'
    medium: string; // 'font-medium'
    semibold: string; // 'font-semibold'
    bold: string; // 'font-bold'
  };
}

export interface UiSpacingConfig {
  // Common spacing values (in rem, for reference - Tailwind uses these)
  scale: {
    xs: number; // 0.25rem (4px)
    sm: number; // 0.5rem (8px)
    md: number; // 1rem (16px)
    lg: number; // 1.5rem (24px)
    xl: number; // 2rem (32px)
    '2xl': number; // 3rem (48px)
    '3xl': number; // 4rem (64px)
  };
}

export interface UiRadiiConfig {
  // Border radius values (in rem, for reference - Tailwind uses these)
  sm: string; // 'rounded-sm' (0.125rem / 2px)
  md: string; // 'rounded-md' (0.375rem / 6px)
  lg: string; // 'rounded-lg' (0.5rem / 8px)
  xl: string; // 'rounded-xl' (0.75rem / 12px)
  full: string; // 'rounded-full' (9999px)
}

export interface UiShadowsConfig {
  // Shadow presets (Tailwind classes)
  sm: string; // 'shadow-sm'
  md: string; // 'shadow-md'
  lg: string; // 'shadow-lg'
  xl: string; // 'shadow-xl'
  none: string; // 'shadow-none'
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

// ============================================================================
// API CONFIG
// ============================================================================

export interface ApiClientConfig {
  baseURL: string; // '/api'
  timeout: number; // 30000
  retry: {
    maxRetries: number; // 3
    initialDelay: number; // 1000
    maxDelay: number; // 10000
    exponentialBackoff: boolean; // true
    retryableStatusCodes: number[]; // [408, 429, 500, 502, 503, 504]
  };
  headers: {
    'Content-Type': string; // 'application/json'
  };
  credentials: RequestCredentials; // 'same-origin'
}

export interface ApiPaginationConfig {
  defaultPageSize: number; // 20
  maxPageSize: number; // 100
  defaultLimit: number; // 20
  maxLimit: number; // 100
  marketDefaultLimit: number; // 20
  loreDefaultLimit: number; // 20
  lootMomentsDefaultLimit: number; // 5
}

export interface ApiGeneratorConfig {
  maxConcurrency: number; // 2 (from env)
  questionsPerCategoryMin: number; // 5 (from env)
  questionsPerCategoryMax: number; // 12 (from env)
  batchSize: number; // 50 (from env)
  maxRetries: number; // 3 (from env)
  retryDelayMs: number; // 1000 (from env)
  languages: string[]; // ['en'] (from env)
  gptUrl: string; // '' (from env)
  gptKey: string; // '' (from env)
  adminToken: string; // '' (from env)
  dryRun: boolean; // false (from env)
}

export interface ApiConfig {
  client: ApiClientConfig;
  pagination: ApiPaginationConfig;
  generator: ApiGeneratorConfig;
}

// ============================================================================
// APP CONFIG
// ============================================================================

export interface AppLimitsConfig {
  questions: {
    maxPerDay: number; // 100
    maxSkipPerDay: number; // 20
    timeoutSeconds: number; // 300
  };
  social: {
    maxFriends: number; // 100
    maxFriendRequests: number; // 50
    maxClanSize: number; // 50
  };
  content: {
    maxAnswerLength: number; // 5000
    minAnswerLength: number; // 1
    maxBioLength: number; // 500
    maxUsernameLength: number; // 30
  };
}

export interface AppPollingConfig {
  presence: number; // 30000
  notifications: number; // 60000
  leaderboard: number; // 300000
  heartbeat: number; // 25000
  duetRun: number; // 5000
  globalMood: number; // 300000
  notificationToasts: number; // 30000
}

export interface AppCacheConfig {
  defaultTtl: number; // 300000 (5 minutes)
  maxSize: number; // 1000
  storeTtls: {
    dailyFork: number; // 120000 (2 minutes)
    social: number; // 300000 (5 minutes)
    latestLore: number; // 300000 (5 minutes)
    chronicle: number; // 600000 (10 minutes)
    firesides: number; // 300000 (5 minutes)
    season: number; // 120000 (2 minutes)
    rituals: number; // 120000 (2 minutes)
    badges: number; // 300000 (5 minutes)
    rarities: number; // 600000 (10 minutes)
    recipes: number; // 300000 (5 minutes)
    lore: number; // 300000 (5 minutes)
    discoveries: number; // 300000 (5 minutes)
  };
  marketRefreshIntervals: {
    featured: number; // 600000 (10 minutes)
    transactions: number; // 120000 (2 minutes)
    balance: number; // 120000 (2 minutes)
    systemAlerts: number; // 30000 (30 seconds)
    wallet: number; // 60000 (60 seconds)
    adminEconomy: number; // 300000 (5 minutes)
  };
  marketDedupingIntervals: {
    default: number; // 60000 (1 minute)
    transactions: number; // 60000 (1 minute)
    balance: number; // 60000 (1 minute)
    systemAlerts: number; // 10000 (10 seconds)
    wallet: number; // 30000 (30 seconds)
    adminEconomy: number; // 60000 (1 minute)
  };
  inventoryDedupingInterval: number; // 5000 (5 seconds)
}

export interface AppConfig {
  limits: AppLimitsConfig;
  polling: AppPollingConfig;
  cache: AppCacheConfig;
}

// ============================================================================
// PLATFORM CONFIG
// ============================================================================

export interface PlatformRedisConfig {
  maxRetriesPerRequest: number; // 3
  enableReadyCheck: boolean; // true
}

export interface PlatformEnvironmentConfig {
  isProd: boolean; // derived from NODE_ENV
  isDev: boolean; // derived from NODE_ENV
  hasRedis: boolean; // derived from REDIS_URL
  hasDb: boolean; // derived from DATABASE_URL
  nodeEnv: string; // process.env.NODE_ENV
  redisUrl?: string; // process.env.REDIS_URL
  databaseUrl?: string; // process.env.DATABASE_URL
}

export interface PlatformConfig {
  redis: PlatformRedisConfig;
  environment: PlatformEnvironmentConfig;
}

// ============================================================================
// SECURITY CONFIG
// ============================================================================

export interface SecurityAuthConfig {
  maxFailedAttempts: number; // 3
  demoBypass: boolean; // derived from env + IS_PROD
}

export interface SecurityCaptchaConfig {
  enabled: boolean; // derived from env + IS_PROD
  siteKey: string; // from env
  secret: string; // from env
  apiUrl: string; // 'https://hcaptcha.com/siteverify'
}

export interface SecurityRateLimitConfig {
  enabled: boolean; // derived from redis availability
}

export interface SecurityConfig {
  auth: SecurityAuthConfig;
  captcha: SecurityCaptchaConfig;
  rateLimit: SecurityRateLimitConfig;
}

// ============================================================================
// FEATURES CONFIG
// ============================================================================

export interface FeaturesConfig {
  enableBase: boolean; // true
  enableTrials: boolean; // true
  enableThemes: boolean; // true
  enableEconomyV2: boolean; // false
  enableAnalytics: boolean; // from env
  environment: EnvironmentLayer; // 'development' | 'production' | 'test'
}

// ============================================================================
// ROOT CONFIG
// ============================================================================

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
  source?: string; // original file path
  defaultValue?: unknown;
  required?: boolean;
  environment?: EnvironmentLayer[];
}

// ============================================================================
// VALIDATION
// ============================================================================

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
export function validateConfig(config: Partial<UnifiedConfig>): ConfigValidationResult {
  const errors: ConfigValidationError[] = [];
  const warnings: string[] = [];

  // Validate required namespaces
  const requiredNamespaces: (keyof UnifiedConfig)[] = [
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
      } else if (config.gameplay.xp.levelMultiplier < 0) {
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
      } else if (config.gameplay.xp.questionBase < 0) {
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
    const validEnvironments: EnvironmentLayer[] = ['development', 'production', 'test'];
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

