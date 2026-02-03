
## [0.43.1] - 2026-02-03

### Fixed 
  - Production finally alive after month!!!
  - @parel/features/flow barrel: consolidated re-exports from flow-skeleton so getNextQuestion, startFlow, getFlowResult, getAvailableCategories, answerQuestion, skipQuestion, isUserAuthenticated and types FlowSession, FlowQuestion, FlowResult are all exported from one place (aligns with apps/web imports; build green).

## [0.42.39] - 2026-02-02

### Fixed
  - Missing exports (build:vercel): (A) @parel/validation/auth — added package.json exports "./auth" so SignupSchema resolves. (B) @parel/features/flow — re-export getNextQuestion, getFlowResult, startFlow, getAvailableCategories from flow-skeleton. (C) @parel/core/config/flags — added getFlags() returning getFeaturesConfig() for health/extended. (D) apps/web barrels: formatSession exported from lib/services/combatService; logFlowEvent stub in lib/metrics; TelemetryEvents in lib/telemetry.
  - DATABASE_URL build crash for /api/health/db: route now uses getPrisma() from @/lib/db inside handler; when DATABASE_URL missing returns 200 with dbSkipped: true (no throw at import).

  - MAX_FEATURED_ITEMS import: added MAX_FEATURED_ITEMS, MarketItem, and MarketItemCategory to apps/web/lib/marketplace/types.ts so imports from './types' resolve (no import-site changes).
  - Prisma build-time crash: lazy db client in lib/db.ts — no PrismaClient or throw at module load; getPrisma() returns singleton or null when DATABASE_URL missing; /api/loot/check uses getPrisma() inside handler and returns 503 when DB not configured so build succeeds without DATABASE_URL.

  - Vercel / strict pnpm: added missing workspace deps to apps/web so @parel/core, @parel/ui, @parel/story, @parel/features, @parel/validation resolve in clean installs: @parel/features, @parel/story, @parel/ui, @parel/validation (all workspace:*).
  - @prisma/client shadowing: removed path override in apps/web/tsconfig.json that mapped @prisma/client to packages/db/generated (zod schemas). @prisma/client now resolves to the real Prisma client; @parel/db/client re-exports from real @prisma/client.
  - Missing module @/lib/config/itemEffects: added re-export from @parel/core/config/itemEffects

## [0.42.38] - 2026-02-02

### Fixed
  - Missing modules: added @/components/ui/separator, @/lib/telemetry/telemetry-tracker (stub)
  - Invalid UTF-8 in app/shop/page.tsx (corrupted emoji fallback and tip text)
  - Syntax error in app/story/feed/page.tsx (handleStoryClick extra braces/dead code)
  - Duplicate variable redis in lib/middleware/culturalFilter.ts
  - Missing @/store/useRegionStore (stub for shop page)

