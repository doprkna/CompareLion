
## [0.42.31] - 2026-01-26

### Fixed
  - Fixed - Cursor indexing performance: Updated `.cursorindexingignore` to reduce indexed files from 2300+ to 369 (~84% reduction), improving Cursor responsiveness
  - Fixed - Syntax error in `app/friends/page.tsx`: Missing closing quote in `useEventBus` import
  - Fixed - Module export: Added `./config/ambientConfig` export to `@parel/core` package.json to fix import error in `AmbientManager.tsx`
  - Fixed - 404 errors: Added missing `favicon.ico` and `apple-touch-icon.png` placeholder files to `public/` directory
  - Fixed - API endpoint `/api/user/settings/roast`: Changed from 503 to always return 200 with stable JSON shape (`enabled`, `text`, `updatedAt`, `reason`) even on errors or unauthenticated requests
  - Fixed - API endpoint `/api/realtime`: Split into `/api/realtime/status` (JSON) and `/api/realtime/sse` (SSE) with clear contracts. Client now checks status before connecting. Old endpoint redirects to SSE for compatibility
  - Fixed - Hydration mismatch: Added `suppressHydrationWarning` to `<body>` tag in `app/layout.tsx` to silence warnings from browser extension-injected classes like "vsc-initialized"
  - Fixed - Realtime SSE hardening: Improved headers, flush handling, cleanup, and client-side backoff (60s when disabled, 10s on errors)
  - Fixed - Vercel deployment analysis: Documented root directory (repo root), build process, required env vars (60+), and identified 10 blockers (filesystem reads, SSE timeouts, edge runtime issues)
  - Fixed - Neon Postgres + Upstash Redis support: Added env helpers (isProd, hasDb, hasRedis), conditional Prisma/Redis initialization, requireDb/requireRedis helpers in api-handler, updated /api/health to show env status 