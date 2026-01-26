# Config Migration Mapping Table
**C6 Step 2: Canonical Unified Config Map**  
**Version:** v0.42.18

This table maps all discovered config values from Step 1 to their new unified config keys.

---

## GAMEPLAY

### XP & Progression

| Old Constant | New Config Key | Type | Severity | Source File |
|-------------|----------------|------|----------|-------------|
| `XP_CONSTANTS.LEVEL_MULTIPLIER` | `config.gameplay.xp.levelMultiplier` | `number` | critical | `packages/core/config/constants.ts` |
| `XP_CONSTANTS.QUESTION_BASE` | `config.gameplay.xp.questionBase` | `number` | critical | `packages/core/config/constants.ts` |
| `XP_CONSTANTS.DIFFICULTY.easy` | `config.gameplay.xp.difficulty.easy` | `number` | critical | `packages/core/config/constants.ts` |
| `XP_CONSTANTS.DIFFICULTY.medium` | `config.gameplay.xp.difficulty.medium` | `number` | critical | `packages/core/config/constants.ts` |
| `XP_CONSTANTS.DIFFICULTY.hard` | `config.gameplay.xp.difficulty.hard` | `number` | critical | `packages/core/config/constants.ts` |
| `XP_CONSTANTS.STREAK_BONUS[5]` | `config.gameplay.xp.streakBonus[5]` | `number` | critical | `packages/core/config/constants.ts` |
| `XP_CONSTANTS.STREAK_BONUS[10]` | `config.gameplay.xp.streakBonus[10]` | `number` | critical | `packages/core/config/constants.ts` |
| `XP_CONSTANTS.STREAK_BONUS[20]` | `config.gameplay.xp.streakBonus[20]` | `number` | critical | `packages/core/config/constants.ts` |
| `XP_CONSTANTS.STREAK_BONUS[50]` | `config.gameplay.xp.streakBonus[50]` | `number` | critical | `packages/core/config/constants.ts` |

### Currency & Economy

| Old Constant | New Config Key | Type | Severity | Source File |
|-------------|----------------|------|----------|-------------|
| `CURRENCY_CONSTANTS.STARTING_FUNDS` | `config.gameplay.currency.startingFunds` | `number` | critical | `packages/core/config/constants.ts` |
| `CURRENCY_CONSTANTS.STARTING_DIAMONDS` | `config.gameplay.currency.startingDiamonds` | `number` | critical | `packages/core/config/constants.ts` |
| `CURRENCY_CONSTANTS.NAMES.funds` | `config.gameplay.currency.names.funds` | `string` | critical | `packages/core/config/constants.ts` |
| `CURRENCY_CONSTANTS.NAMES.diamonds` | `config.gameplay.currency.names.diamonds` | `string` | critical | `packages/core/config/constants.ts` |
| `CURRENCY_CONSTANTS.SYMBOLS.funds` | `config.gameplay.currency.symbols.funds` | `string` | critical | `packages/core/config/constants.ts` |
| `CURRENCY_CONSTANTS.SYMBOLS.diamonds` | `config.gameplay.currency.symbols.diamonds` | `string` | critical | `packages/core/config/constants.ts` |
| `CURRENCY_CONSTANTS.EXCHANGE_RATE.fundsPerDiamond` | `config.gameplay.currency.exchangeRate.fundsPerDiamond` | `number` | critical | `packages/core/config/constants.ts` |
| `CURRENCY_CONSTANTS.EXCHANGE_RATE.diamondPerFunds` | `config.gameplay.currency.exchangeRate.diamondPerFunds` | `number` | critical | `packages/core/config/constants.ts` |
| `ECONOMY_CONSTANTS.XP_TO_COINS_RATIO` | `config.gameplay.economy.xpToCoinsRatio` | `number` | critical | `packages/core/config/constants.ts` |
| `ECONOMY_CONSTANTS.REWARDS.*` | `config.gameplay.economy.rewards.*` | `number` | critical | `packages/core/config/constants.ts` |
| `ECONOMY_CONSTANTS.SEASON.*` | `config.gameplay.economy.season.*` | `object` | critical | `packages/core/config/constants.ts` |
| `ECONOMY_CONSTANTS.SHOP.*` | `config.gameplay.economy.shop.*` | `object` | critical | `packages/core/config/constants.ts` |
| `ECONOMY_CONSTANTS.COSMETIC_PRICING.*` | `config.gameplay.economy.cosmeticPricing.*` | `object` | critical | `packages/core/config/constants.ts` |

### Rewards & Drops

| Old Constant | New Config Key | Type | Severity | Source File |
|-------------|----------------|------|----------|-------------|
| `RewardConfig.base.*` | `config.gameplay.rewards.base.*` | `object` | critical | `packages/core/config/rewardConfig.ts` |
| `RewardConfig.kill.*` | `config.gameplay.rewards.kill.*` | `object` | critical | `packages/core/config/rewardConfig.ts` |
| `RewardConfig.boss.*` | `config.gameplay.rewards.boss.*` | `object` | critical | `packages/core/config/rewardConfig.ts` |
| `RewardConfig.reflection.*` | `config.gameplay.rewards.reflection.*` | `object` | critical | `packages/core/config/rewardConfig.ts` |
| `RewardConfig.quiz.*` | `config.gameplay.rewards.quiz.*` | `object` | critical | `packages/core/config/rewardConfig.ts` |
| `RewardConfig.achievement.*` | `config.gameplay.rewards.achievement.*` | `object` | critical | `packages/core/config/rewardConfig.ts` |
| `RewardConfig.streakMultiplier.*` | `config.gameplay.rewards.streakMultiplier.*` | `object` | critical | `packages/core/config/rewardConfig.ts` |
| `RewardConfig.difficultyMultiplier.*` | `config.gameplay.rewards.difficultyMultiplier.*` | `object` | critical | `packages/core/config/rewardConfig.ts` |
| `RewardConfig.powerScaling.*` | `config.gameplay.rewards.powerScaling.*` | `object` | critical | `packages/core/config/rewardConfig.ts` |
| `RewardConfig.caps.*` | `config.gameplay.rewards.caps.*` | `object` | critical | `packages/core/config/rewardConfig.ts` |
| `RewardConfig.drops.*` | `config.gameplay.rewards.drops.*` | `object` | critical | `packages/core/config/rewardConfig.ts` |

### Karma & Prestige

| Old Constant | New Config Key | Type | Severity | Source File |
|-------------|----------------|------|----------|-------------|
| `KARMA_CONSTANTS.TIERS.*` | `config.gameplay.karma.tiers.*` | `number` | critical | `packages/core/config/constants.ts` |
| `KARMA_CONSTANTS.ACTIONS.*` | `config.gameplay.karma.actions.*` | `number` | critical | `packages/core/config/constants.ts` |
| `KARMA_CONSTANTS.CAPS.*` | `config.gameplay.karma.caps.*` | `object` | critical | `packages/core/config/constants.ts` |
| `PRESTIGE_CONSTANTS.CAP` | `config.gameplay.prestige.cap` | `number` | critical | `packages/core/config/constants.ts` |
| `PRESTIGE_CONSTANTS.TIERS.*` | `config.gameplay.prestige.tiers.*` | `number` | critical | `packages/core/config/constants.ts` |
| `PRESTIGE_CONSTANTS.BONUSES.*` | `config.gameplay.prestige.bonuses.*` | `object` | critical | `packages/core/config/constants.ts` |

### Scoring & Achievements

| Old Constant | New Config Key | Type | Severity | Source File |
|-------------|----------------|------|----------|-------------|
| `SCORE_CONSTANTS.DIFFICULTY_SCORE.*` | `config.gameplay.scoring.difficulty.*` | `number` | critical | `packages/core/config/constants.ts` |
| `SCORE_CONSTANTS.ACTIONS.*` | `config.gameplay.scoring.actions.*` | `number` | critical | `packages/core/config/constants.ts` |
| `ACHIEVEMENT_CONSTANTS.POINTS.*` | `config.gameplay.achievements.points.*` | `number` | critical | `packages/core/config/constants.ts` |
| `ACHIEVEMENT_CONSTANTS.RARITY.*` | `config.gameplay.achievements.rarity.*` | `number` | critical | `packages/core/config/constants.ts` |

### Leaderboard

| Old Constant | New Config Key | Type | Severity | Source File |
|-------------|----------------|------|----------|-------------|
| `ECONOMY_CONSTANTS.LEADERBOARD.*` | `config.gameplay.leaderboard.*` | `object` | critical | `packages/core/config/constants.ts` |

### Defaults

| Old Constant | New Config Key | Type | Severity | Source File |
|-------------|----------------|------|----------|-------------|
| `DEFAULTS.user.*` | `config.gameplay.defaults.user.*` | `object` | critical | `packages/core/config/constants.ts` |
| `DEFAULTS.pagination.*` | `config.api.pagination.*` | `object` | critical | `packages/core/config/constants.ts` |

---

## UI

### Timing & Animation

| Old Constant | New Config Key | Type | Severity | Source File |
|-------------|----------------|------|----------|-------------|
| `TIMING_CONSTANTS.DEBOUNCE.*` | `config.ui.timing.debounce.*` | `number` | critical | `packages/core/config/constants.ts` |
| `TIMING_CONSTANTS.ANIMATION.*` | `config.ui.timing.animation.*` | `number` | critical | `packages/core/config/constants.ts` |
| `TIMING_CONSTANTS.POLLING.*` | `config.ui.timing.polling.*` | `number` | critical | `packages/core/config/constants.ts` |
| `delay` (tooltip default) | `config.ui.toast.tooltipDelay` | `number` | medium | `packages/ui/atoms/tooltip.tsx` |
| `debounceMs` (market default) | `config.ui.toast.marketDebounce` | `number` | medium | `packages/core/hooks/useMarket.ts` |
| `duration-300` (progress) | `config.ui.toast.progressAnimationDuration` | `number` | low | `packages/ui/atoms/progress.tsx` |

### Toast & Notifications

| Old Constant | New Config Key | Type | Severity | Source File |
|-------------|----------------|------|----------|-------------|
| `MAX_TOASTS` | `config.ui.toast.maxToasts` | `number` | high | `packages/core/hooks/useRewardToast.ts` |
| `DEFAULT_DURATION` | `config.ui.toast.defaultDuration` | `number` | high | `packages/core/hooks/useRewardToast.ts` |
| `duration: 3000` | `config.ui.toast.notificationDuration` | `number` | medium | `packages/core/hooks/useNotificationToasts.ts` |
| `toastTheme.*.duration` | `config.ui.toast.themeDurations.*` | `number` | medium | `packages/core/config/toastTheme.ts` |

### Colors & Themes

| Old Constant | New Config Key | Type | Severity | Source File |
|-------------|----------------|------|----------|-------------|
| `COLOR_CONSTANTS.KARMA.*` | `config.ui.colors.karma.*` | `string` | critical | `packages/core/config/constants.ts` |
| `COLOR_CONSTANTS.PRESTIGE.*` | `config.ui.colors.prestige.*` | `string` | critical | `packages/core/config/constants.ts` |
| `COLOR_CONSTANTS.DIFFICULTY.*` | `config.ui.colors.difficulty.*` | `string` | critical | `packages/core/config/constants.ts` |
| `COLOR_CONSTANTS.STATUS.*` | `config.ui.colors.status.*` | `string` | critical | `packages/core/config/constants.ts` |
| `useGlobalMood` theme colors | `config.ui.mood.themes.*` | `object` | medium | `packages/core/hooks/useGlobalMood.ts` |

---

## API

### Client Configuration

| Old Constant | New Config Key | Type | Severity | Source File |
|-------------|----------------|------|----------|-------------|
| `baseURL` (default) | `config.api.client.baseURL` | `string` | critical | `packages/api/src/client/config.ts` |
| `timeout` (default) | `config.api.client.timeout` | `number` | critical | `packages/api/src/client/config.ts` |
| `DEFAULT_RETRY_CONFIG.*` | `config.api.client.retry.*` | `object` | critical | `packages/api/src/client/config.ts` |

### Pagination

| Old Constant | New Config Key | Type | Severity | Source File |
|-------------|----------------|------|----------|-------------|
| `DEFAULTS.pagination.*` | `config.api.pagination.*` | `object` | critical | `packages/core/config/constants.ts` |
| `defaultLimit` | `config.api.pagination.defaultLimit` | `number` | critical | `packages/core/utils/pagination.ts` |
| `maxLimit` | `config.api.pagination.maxLimit` | `number` | critical | `packages/core/utils/pagination.ts` |
| `limit: 20` (market) | `config.api.pagination.marketDefaultLimit` | `number` | medium | `packages/core/hooks/useMarket.ts` |
| `limit: 20` (lore) | `config.api.pagination.loreDefaultLimit` | `number` | medium | `packages/core/hooks/useLore.ts` |
| `limit: 5` (loot) | `config.api.pagination.lootMomentsDefaultLimit` | `number` | medium | `packages/core/hooks/useLootMoments.ts` |

### Generator API

| Old Constant | New Config Key | Type | Severity | Source File |
|-------------|----------------|------|----------|-------------|
| `GEN_CONFIG.*` | `config.api.generator.*` | `mixed` | critical | `packages/core/config/generator.ts` |

---

## APP

### Limits

| Old Constant | New Config Key | Type | Severity | Source File |
|-------------|----------------|------|----------|-------------|
| `LIMITS_CONSTANTS.QUESTIONS.*` | `config.app.limits.questions.*` | `object` | critical | `packages/core/config/constants.ts` |
| `LIMITS_CONSTANTS.SOCIAL.*` | `config.app.limits.social.*` | `object` | critical | `packages/core/config/constants.ts` |
| `LIMITS_CONSTANTS.CONTENT.*` | `config.app.limits.content.*` | `object` | critical | `packages/core/config/constants.ts` |

### Polling & Refresh

| Old Constant | New Config Key | Type | Severity | Source File |
|-------------|----------------|------|----------|-------------|
| `HEARTBEAT_INTERVAL_MS` | `config.app.polling.heartbeat` | `number` | high | `packages/core/hooks/usePresence.ts` |
| `setInterval(load, 5000)` | `config.app.polling.duetRun` | `number` | medium | `packages/core/hooks/useDuetRun.ts` |
| `setInterval(..., 300000)` | `config.app.polling.globalMood` | `number` | medium | `packages/core/hooks/useGlobalMood.ts` |
| `setInterval(..., 30000)` | `config.app.polling.notificationToasts` | `number` | medium | `packages/core/hooks/useNotificationToasts.ts` |

### Cache

| Old Constant | New Config Key | Type | Severity | Source File |
|-------------|----------------|------|----------|-------------|
| `DEFAULT_CONFIG.defaultTtl` | `config.app.cache.defaultTtl` | `number` | high | `packages/core/state/cache.ts` |
| `DEFAULT_CONFIG.maxSize` | `config.app.cache.maxSize` | `number` | high | `packages/core/state/cache.ts` |
| `cacheTtl: 2 * 60 * 1000` | `config.app.cache.storeTtls.*` | `number` | medium | `packages/core/state/stores/*.ts` |
| `refreshInterval` (various) | `config.app.cache.marketRefreshIntervals.*` | `number` | medium | `packages/core/hooks/useMarket.ts` |
| `dedupingInterval` (various) | `config.app.cache.marketDedupingIntervals.*` | `number` | medium | `packages/core/hooks/useMarket.ts` |
| `dedupingInterval: 5000` | `config.app.cache.inventoryDedupingInterval` | `number` | medium | `packages/core/hooks/useInventory.ts` |

---

## PLATFORM

| Old Constant | New Config Key | Type | Severity | Source File |
|-------------|----------------|------|----------|-------------|
| `maxRetriesPerRequest: 3` | `config.platform.redis.maxRetriesPerRequest` | `number` | high | `packages/redis/src/client.ts` |
| `IS_PROD` | `config.platform.environment.isProd` | `boolean` | critical | `packages/core/config/env.ts` |
| `IS_DEV` | `config.platform.environment.isDev` | `boolean` | critical | `packages/core/config/env.ts` |
| `HAS_REDIS` | `config.platform.environment.hasRedis` | `boolean` | critical | `packages/core/config/env.ts` |
| `HAS_DB` | `config.platform.environment.hasDb` | `boolean` | critical | `packages/core/config/env.ts` |

---

## SECURITY

| Old Constant | New Config Key | Type | Severity | Source File |
|-------------|----------------|------|----------|-------------|
| `securityConfig.maxFailedAttempts` | `config.security.auth.maxFailedAttempts` | `number` | critical | `packages/core/config/security.ts` |
| `securityConfig.captchaEnabled` | `config.security.captcha.enabled` | `boolean` | critical | `packages/core/config/security.ts` |
| `securityConfig.demoBypass` | `config.security.auth.demoBypass` | `boolean` | critical | `packages/core/config/security.ts` |
| `securityConfig.rateLimitEnabled` | `config.security.rateLimit.enabled` | `boolean` | critical | `packages/core/config/security.ts` |
| `'https://hcaptcha.com/siteverify'` | `config.security.captcha.apiUrl` | `string` | medium | `packages/core/config/security.ts` |

---

## FEATURES

| Old Constant | New Config Key | Type | Severity | Source File |
|-------------|----------------|------|----------|-------------|
| `getFlags().enableBase` | `config.features.enableBase` | `boolean` | critical | `packages/core/config/flags.ts` |
| `getFlags().enableTrials` | `config.features.enableTrials` | `boolean` | critical | `packages/core/config/flags.ts` |
| `getFlags().enableThemes` | `config.features.enableThemes` | `boolean` | critical | `packages/core/config/flags.ts` |
| `getFlags().enableEconomyV2` | `config.features.enableEconomyV2` | `boolean` | critical | `packages/core/config/flags.ts` |
| `getFlags().enableAnalytics` | `config.features.enableAnalytics` | `boolean` | critical | `packages/core/config/flags.ts` |
| `getFlags().environment` | `config.features.environment` | `string` | critical | `packages/core/config/flags.ts` |

---

## Summary

- **Total Mappings:** 176+
- **Critical Severity:** 150
- **Medium Severity:** 20
- **Low Severity:** 6

All mappings will be implemented in Step 3 (Migration).

