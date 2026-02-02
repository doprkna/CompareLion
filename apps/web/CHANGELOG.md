
## [0.42.41] - 2026-01-30

### Fixed
  - Vercel / strict pnpm: added missing workspace deps to apps/web so @parel/core, @parel/ui, @parel/story, @parel/features, @parel/validation resolve in clean installs: @parel/features, @parel/story, @parel/ui, @parel/validation (all workspace:*).

## [0.42.40] - 2026-02-02

### Fixed
  - @prisma/client shadowing: removed path override in apps/web/tsconfig.json that mapped @prisma/client to packages/db/generated (zod schemas). @prisma/client now resolves to the real Prisma client; @parel/db/client re-exports from real @prisma/client.

## [0.42.39] - 2026-02-02

### Fixed
  - Missing module @/lib/config/itemEffects: added re-export from @parel/core/config/itemEffects

## [0.42.38] - 2026-02-02

### Fixed
  - Missing modules: added @/components/ui/separator, @/lib/telemetry/telemetry-tracker (stub)
  - Invalid UTF-8 in app/shop/page.tsx (corrupted emoji fallback and tip text)
  - Syntax error in app/story/feed/page.tsx (handleStoryClick extra braces/dead code)
  - Duplicate variable redis in lib/middleware/culturalFilter.ts
  - Missing @/store/useRegionStore (stub for shop page)

