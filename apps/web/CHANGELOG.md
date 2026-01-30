
## [0.42.36] - 2026-01-29

### Fixed
  - Fixed packages/api envelope.ts: cast addRequestIdToResponse return to NextResponse to satisfy TS2740
  - FIXED: packages/core/tsconfig.json — rootDir adjusted to match include patterns
  - Fixed - Vercel.json setup and fix in their app - install manager configuration
  - Fixed - Aligned worker with Prisma schema
  - Fixed - @parel/db stub for notifications
  - Fixed - normalized and unified: utils/walletTransactions.ts, utils/errorTracking.ts, state/selectors.ts, state/factory.ts, src/index.ts, useSocial.ts, useShop.ts, useRegions.ts, useRealtime.ts, useQuests.ts
,  usePresence.ts, useNotificationToasts.ts, useMusicTheme.ts...
  - Fixed - 
  - Fixed - change of rootDir from ".", reference and include review in tsconfig.js
  - Fixed - Fixes connected to environments and install manager - package json update for next.js info in both locations
  - Fixed - Single Vercel config: Root vercel.json is sole source of truth; installCommand set to pnpm install --frozen-lockfile, buildCommand to pnpm build; apps/web/vercel.json moved to vercel.json.disabled for monorepo deploy from repo root
  - Fixed - packages/core streakStore: Switched to factory createStore API (single-arg creator), removed curried create/persist usage; typed toast stub for noImplicitAny
  - Fixed - packages/core config/load.ts: Initialize overrides.security.auth with SecurityAuthConfig (maxFailedAttempts, demoBypass) to satisfy TS2739
  - Fixed - packages/core config/load.ts: Initialize overrides.security.rateLimit with SecurityRateLimitConfig (enabled) to satisfy TS2741
  - Fixed - packages/core config/load.ts: Initialize overrides.api.generator with full ApiGeneratorConfig to satisfy TS2740
  - Fixed - packages/core config/load.ts: Assert deepMerge(config, runtimeOverrides) as UnifiedConfig to satisfy TS2322 (gameplay.xp)
  - Fixed - packages/core config/load.ts: Assert deepMerge(config, envConfig) as UnifiedConfig at line 279 to satisfy TS2322 (gameplay.xp)
  - Fixed - packages/core config/load.ts: Assert deepMerge(config, userOverrides) as UnifiedConfig at line 287 to satisfy TS2322 (gameplay.xp)
  - Fixed - packages/core config/plugins.ts: Assert deepMerge(config, pluginOverrides) as UnifiedConfig at line 141 to satisfy TS2322 (gameplay.xp)
  - Fixed - packages/core config/plugins.ts: Remove duplicate export of ConfigPlugin to resolve TS2484
  - Fixed - packages/core config/schema.ts: Validate retry.maxRetries instead of retries to satisfy ApiClientConfig (TS2339)
  - Fixed - packages/core config/unified.ts: Cast deepMerge first-arg fallback as T[Extract<keyof T, string>] to satisfy TS2345
  - Fixed - packages/core no longer compiles packages/types source (TS6059/TS6307): added @parel/types workspace dependency, path override @parel/types -> ../types/dist, project reference to ../types; packages/types exports field for dist
  - Fixed - Monorepo build TS6059/TS6307/TS2307: story tsconfig path @parel/types -> ../types/dist + references; story dependency @parel/types; @parel/db/client export types field
