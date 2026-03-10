
## [0.45.25] - 2026-02-27

### Fixed
  - **Disabled observability in dev via DISABLE_OBSERVABILITY flag to speed up dev build:** Added `lib/observability/isObservabilityEnabled.ts` — returns false when `DISABLE_OBSERVABILITY=true` or `NODE_ENV=development`. Gated: `instrumentation.ts` (server Sentry), `instrumentation-client.ts` (client Sentry; dynamic import when disabled), `lib/sentry/client-config.ts` (initSentry, captureError, setUserContext; dynamic import), `next.config.js` (withSentryConfig only when observability enabled). ErrorBoundary uses isObservabilityEnabled. Dev: observability off by default; prod: unchanged.

## [0.45.24] - 2026-02-27

### Fixed
  - **Removed duplicate JS pages shadowing TS versions:** Deleted 1 duplicate: `app/profile/combat-log/page.jsx` (kept page.tsx; added minimal default export to complete truncated TS file). Scope: app/**, pages/**, middleware. No API route duplicates found (check:routes already clean). Skipped: none (combat-log TS was incomplete; fixed before deletion).

### Added
  - **check:page-duplicates:** Script `scripts/check-page-duplicates.mjs` — scans app/ (excl. api) and middleware for page.jsx+page.tsx, layout.jsx+layout.tsx, etc. Fails on duplicates. Wired into `pnpm check:dev-sanity`.
  - **remove-js-duplicates.mjs:** One-time cleanup script (scoped to route files in app/, pages/, middleware). Validates TS has export before deleting JS.

## [0.43.4] - 2026-02-05

### Fixed
  - Next build root causes (fix by layer, no import changes in apps/web): (1) **Export order**: packages/core/package.json `./hooks/useRealtime` had `default` condition not last — Node/Next require default last; moved `default` to end so "Module not found: Default condition should be last one" (app/providers.tsx) is resolved. (2) **@parel/redis resolution**: next.config.js added `resolve.alias['@parel/redis']` to packages/redis and `@parel/redis` to transpilePackages so core config/cache can resolve @parel/redis. Build now completes (exit 0); remaining warnings: Attempted import errors from @parel/features/flow, @parel/core/config/flags, @parel/story (package exports/stubs), plus Prisma/OpenTelemetry/Sentry managed-path warnings. See web-build-errors-summary.txt.
  - Turbopack disabled for dev: Turbopack (`--turbo`) caused dev-only module resolution failures for @parel/core/hooks/* despite green build and working Node require.resolve. Dev now runs via webpack (plain `next dev -p 3001`). Disabled due to monorepo + package-exports resolver issues; revisit when Turbopack improves. Goal: stable dev for testing/screenshots.
  - Vercel deploy builds only @parel/web: Avoid recursive monorepo builds (root `pnpm build` = `pnpm -r run build`) on Hobby. Prefer **Root Directory** = `apps/web` with Install `pnpm install --frozen-lockfile`, Build `pnpm run build`. If root must stay repo root: Install `pnpm -w install --frozen-lockfile --filter @parel/web...`, Build `pnpm --filter @parel/web run build`. Do not use repo-root `pnpm build`.
  - Attempted import errors (package-layer fixes): (1) **@parel/features/flow**: Removed next.config.js alias so resolution uses @parel/features package exports (./flow → ./flow/index.ts); fixed packages/features/flow/flow-skeleton.ts syntax (missing `}` closing `data` in prisma.user.update). (2) **@parel/core/config/flags**: packages/core/package.json `./config/flags` export reordered with `types`, `import`, `require`, `default` (default last). (3) **@parel/story**: storyCollectionService and storyTemplateService exports now point to src (./src/storyCollectionService.ts, ./src/storyTemplateService.ts) so getPublicCollections and getPublicTemplates resolve; added @parel/story to transpilePackages. (4) **@parel/db** for flow: next.config.js aliases added for `@parel/db` (packages/db) and `@parel/db/client` (packages/db/src/client.ts) so flow-skeleton resolves @parel/db without breaking @parel/db/client. Build completes (exit 0); optional remaining: getFlags warnings in some routes.

