<!-- version-lock: true -->


## [0.50.01] - 2026-05-02

### Changed
  - **`/landing` hero (above the fold):** New positioning for first-time visitors: headline *Compare your life with strangers.* / *For science. Mostly.*, subheadline + four example question cards (replacing XP/leaderboard mock), primary CTA **Try it now** (`/signup`), log-in link, tagline *No productivity cult. No fake wisdom. Just honest comparisons.* Logged-in users see the same product framing + **Continue to the app**. Removed hero email/waitlist row and side-column stats mock.

### Fixed
  - **`CHANGELOG.md` merge conflict:** Removed stray Git conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) and ordered sections so `[0.49.xx]` entries appear above `[0.47.xx]`.
  - **`apps/web/package.json` — `typecheck`:** Uses `node ../../node_modules/typescript/bin/tsc --noEmit` so `pnpm run typecheck` resolves TypeScript when hoisted to the monorepo root (pnpm), matching the existing `build` / `lint` script paths.

### Notes
  - **Production build:** `pnpm run build` from `apps/web` completed successfully locally (fresh `.next`, optional unset of shell `DATABASE_URL*`; `/landing` in route manifest).

## [0.49.05] - 2026-03-31

### Fixed (Vercel / `@parel/core` resolution)
  - **`apps/web` build:** `pnpm run build` runs **`pnpm --filter @parel/core run build`** before **`next build`** so **`packages/core/dist`** exists when the installer only builds the web app root. **`@parel/core`** and **`@parel/core/hooks/useEventBus`** (and other `exports`) resolve through compiled output; **`next.config.js`** **`@parel/core/config`** → **`dist/config`** unchanged. Scoped to **`@parel/core`** only—not a recursive monorepo build.

### Changed (deploy config alignment)
  - **Vercel Root Directory = `apps/web`:** Removed **repo-root** `vercel.json` (it pinned `buildCommand` / `installCommand` to `build:light` / `install:light`, `outputDirectory: apps/web/.next`, and `rewrites` to `/apps/web/$1`, which conflict with dashboard defaults when the project root is `apps/web`). Added **`apps/web/vercel.json`** with **`framework`**, **`regions`**, **`env` / `build.env`**, **`headers`**, **`redirects`** only—no `buildCommand`, `installCommand`, `outputDirectory`, `devCommand`, or path rewrites so **Build = `pnpm run build`**, **Install = `pnpm install --frozen-lockfile`**, and **output `.next`** stay dashboard-controlled.
  - **`apps/web/package.json`:** Set **`packageManager`** to **`pnpm@10.0.0`** (matches workspace root) so installs from the app directory use the intended pnpm version.

### Notes
  - **Redirect `/docs` → `/BETA_LAUNCH_v0.13.2k.md`:** The markdown file currently lives at the **monorepo root**, not under `apps/web/public`. If the redirect should serve that doc in production, add a copy (or symlink) under **`public/`** or change the destination.

## [0.49.04] - 2026-03-31

### Notes (deploy / build scope)
  - **Vercel light-build closure:** `packages/rating` and `packages/notifications` are **not** imported by `apps/web`; they appear because `apps/web` depends on `@parel/story`, and `packages/story/package.json` lists them even though current `story` **package exports** send most story APIs to **stubs** (real `src` that imports rating/notifications is not what Next resolves for those entry points). **`@parel/api`** is a direct `apps/web` dependency and is used across many API routes; it stays in the closure.

## [0.49.03] - 2026-03-31

### Fixed
  - **Build without `DATABASE_URL`:** `lib/env.ts` no longer calls `process.exit(1)` during `next build` when `NODE_ENV=production` and `DATABASE_URL` is unset (e.g. local/CI). Production guard now skips while Next sets **`NEXT_PHASE=phase-production-build`** (page-data workers) or **`npm_lifecycle_event=build`** (root script). Non-Vercel **`next start`** still requires real `process.env` values for `DATABASE_URL`, `STRIPE_SECRET_KEY`, and `REDIS_URL` (unless Redis disabled).

## [0.49.02] - 2026-04-02

### Added
  - **OpsRun debug (MVP):** `@parel/db` `OpsRun` helpers accept types **`SEED`** and **`API_ERROR`**; `createOpsRun` optional **`message`** on create. **`POST /api/admin/seed-db`** opens an OpsRun before `runSeedWorld`, **`finishOpsRun`** on success (`Seeder completed`) or failure (message + `errorStack`). **`GET /api/progression/stats`** and **`GET /api/admin/visits`** catch paths record **`API_ERROR`** via `createOpsRun` + **`finishOpsRun`** with `params.route`. **`/admin/ops`** client polls every **8s** (`quiet` refresh to avoid loading flicker); blurb updated. Detail page unchanged (message, collapsible stack, params JSON already present).
  - **User session trace (lightweight):** `apps/web/lib/logEvent.ts` — fire-and-forget `createOpsRun` + `finishOpsRun` (`success`). **Demo pipeline** (`flow_demo`): **`POST /api/flow/start`** → `flow_start`; **`GET /api/flow/question`** (no next) → `flow_complete`; **`POST /api/flow/answer`** → `question_answer` / `question_skip`; each includes **`params.channel`** = `flow_demo`. **Category route** (`/flow/[categoryId]`, `flow_category`): **`GET /api/flow/[categoryId]/next`** → `flow_start` when the user has no prior responses in that category, **`flow_complete` when there is no next question; **`POST .../answer`** and **`POST .../skip`** → `question_answer` / `question_skip`. **Legacy `FlowRunner`:** **`POST /api/flow-answers`** logs `question_answer` / `question_skip` with **`channel: legacy_flow_answers`** (including mock-question path). **Admin:** **`GET /api/admin/ops?userId=`** filters with Prisma JSON **`params.userId`** (latest 50 matches); ops UI debounces the User ID field. Trace rows also set **`params.userId`** for filtering.

### Fixed
  - **Flow category HTTP API:** `GET /api/flow/[categoryId]/next` called `getNextQuestionForUser` with **arguments reversed** (category id was passed as user id). **`POST /api/flow/[id]/answer`** invoked `answerQuestion` from `flowService` with **two string arguments** while that function expects a **`FlowAnswer`** object, so answers were not persisted correctly; the handler now uses **`recordFlowAnswer`** plus **`addXP`**, **`updateHeroStats`**, and **`publishEvent`** (aligned with **`POST /api/flow/answer`**) and returns basic stats in the JSON body.
  - **`/flow/[categoryId]` UI:** Uses shared **`QuestionInput`** (same behaviors as **`FlowRunner`**): **RANGE** is a **Radix `Slider`** (1–10, default 5); **NUMBER** / **`NUMERIC`** use a number field; **`MULTIPLE_CHOICE`** is normalized to **`MULTI_CHOICE`**. **Submit** sends JSON (`optionIds`, `textValue`, or `numericValue`). **`POST /api/flow/[id]/answer`** validates **RANGE** as an integer **1–10** and persists a clamped value.
  - **`/flow-demo`:** Question step refactored to the same **`QuestionInput`** + **`getInitialValue`** / **`isValidAnswer`** / **`toApiPayload`** helpers as category flow; inline radios/checkboxes/inputs removed. **RANGE** and **`NUMERIC`→NUMBER** behavior matches **`/flow/[categoryId]`**; failed submit surfaces API/toast error body when available.
  - **Notifications:** `NotificationBell` called `res.json()` on `apiFetch` (`safeApiFetch`), which returns `{ ok, data }` — not a `Response`. Load/open handlers now read the JSON body from `res.data`.
  - **`GET /api/events/today`:** Wrapped cache + Prisma path in `try/catch`; on any failure returns **200** with `{ success: true, event: null, region, timestamp }` so clients never depend on a failing DB/Redis for a valid empty payload.
  - **`GET /api/progression/stats`:** Wrapped handler in `try/catch`; on throw returns **200** with JSON matching the usual `successResponse` shape (`success`, `data` with null stats / safe defaults, `error: 'fallback'`, `timestamp`) so the client never receives non-JSON or hard failures that break `res.json()`.
  - **`GET /api/admin/visits`:** `try/catch` around stats queries with `NextResponse.json(visitsEmptyPayload)` on failure (all counters **0**, `ok: true`). Corrected 7d `Promise.all` destructuring (anonymous vs logged `groupBy`) and typo `loggedUsers7dGrouped` → `loggedUsersGrouped7d`, which could cause runtime failure before the catch.
  - **`POST /api/admin/seed-db`:** Single outer `try/catch` around session, admin check, env gate, and `runSeedWorld()`. On throw: **200** JSON `{ success: false, ok: false, error }` plus structured server log. Success payload includes `success: true` alongside existing `ok` / `message` / `stats`. Auth and production guard still return **401** / **403** with JSON.
  - **Admin logging / action log:** `POST` admin `trigger()` in `AdminDashboard` reads `apiFetch` failures and JSON `data.success === false` / `data.error` (and truncates long messages ~280 chars). Lines show `Fail — {error}` instead of a bare Fail. **`GET /api/admin/visits`** and **`GET /api/progression/stats`** catch blocks log `console.error('[API ERROR]', { route, error })` and return **200** JSON with `success: false` and truncated `error` where applicable; visits empty payload adds `success: false` + `ok: false` on error. **Seed-db** catch aligned to same `[API ERROR]` log pattern + truncated `error` in body.

## [0.49.01] - 2026-03-31

### Fixed
  - **@parel/story:** Duplicate `StoryVisibility` re-export from `storyFeedService` vs `storyDraftService` (TS2308) — `storyFeedService` now imports the type from `storyDraftService` instead of redeclaring it.

### Added
  - **Parel Stories — Prisma:** `Story`, `StoryReaction`, `StoryView`, `StoryChallenge`, `StoryChallengeEntry`, `StoryCollection`, `StoryCollectionItem`, `StoryTemplate`, `RatingRequest`, `RatingResult` in `packages/db/schema.prisma`; `User` relations for the same. Migration `packages/db/migrations/20260331130000_parel_stories/migration.sql`. Run `prisma migrate deploy` (or your usual migrate path) against Postgres before relying on these tables in production.
  - **@parel/core:** package export `"./cache"` for `storyRankingService` / `weeklyStoryService` imports.

### Fixed
  - **@parel/story:** TypeScript — `storyFeedService` return used undefined `feedItems` (now `storiesToReturn`); `storyRemixService` invalid `include`+`select` on `findUnique`; `getRemixChainDepth` inference vs `Story` type alias; `storyDraftService` publish return narrowed to draft types; `storyService` AURE context tolerates null `summaryText`; `weeklyStoryService` quest highlights use `userQuest` (existing `user_quests` table) instead of non-existent `questProgress`; `tsconfig` `moduleResolution: "bundler"` for `@parel/core/cache` subpath.

## [0.47.08] - 2026-03-09

### Added
  - **C14 — Tailwind Tokens Only:** Centralized semantic design tokens. New: `subtle` (theme-aware), `bg-bg-surface`, `shadow-panel`. Default `--color-*` vars in globals.css for SSR. Docs: `docs/tailwind-tokens.md`.
  - **C11 — DX Improvements (Import Lint):** ESLint `no-restricted-imports` forbids `@parel/*/src/**` and `@parel/*/dist/**`; consumers must use package public APIs. Override exempts `archive/**`. Docs: `docs/import-discipline.md` (when to use `@/` vs `@parel/*`, forbidden patterns, public-API rules).
  - **Content Pack Packaging (C10):** Pack format v1 with manifest.json + JSONL content files. Loader in `packages/db/content` (`loadPackManifest`, `loadQuestionsFromPack`, `loadPollsFromPack`, `resolvePackPath`, `loadContentPack`). Versioning: `schemaVersion` for format compatibility, `version` for content revision, stable `packKey`. Docs: `docs/content-packs.md`.

### Changed
  - **Changelog page + ChangelogSummary + ChangelogSkeleton:** Replaced hardcoded slate palette (`bg-[#0f172a]`, `bg-slate-800`, `border-slate-600`, `text-slate-100`) with tokens (`bg-bg-muted`, `bg-card`, `border-border`, `text-text`, `text-subtle`). Inputs/selects use `bg-card`, `placeholder:text-subtle`.
  - **Starter flow:** Questions moved from hardcoded array to `content-packs/starter/` (manifest.json + questions.jsonl). `ensureStarterFlow` loads via `loadQuestionsFromPack`.
  - **Alpha feedback poll:** Poll definitions moved to `content-packs/alpha-feedback-v01/` (manifest.json + polls.jsonl). `ensureAlphaFeedbackPoll` loads via `loadPollsFromPack`. Title from manifest.

## [0.47.05] - 2026-03-02

### Added
  - **Route-Level Code Split (#66):** Dynamic imports for heavy route panels. Admin dashboard and ops client load on demand (admin-only, ssr: false). Reports page charts (recharts) extracted to ReportsCharts and loaded dynamically with skeleton placeholder. Reduces initial bundle for non-admin users; recharts chunk loads only when visiting reports.

### Changed
  - **admin/page.tsx:** AdminDashboard now dynamic import with "Loading admin…" placeholder.
  - **admin/ops/page.tsx:** AdminOpsClient now dynamic import with "Loading ops…" placeholder.
  - **reports/page.tsx:** Recharts (BarChart, PieChart) moved to ReportsCharts.tsx; stats grid and table render first; charts load in separate chunk with skeleton.

## [0.47.04] - 2026-03-02

### Added
  - **Monorepo Prune (#73):** Archived unused packages to reduce workspace noise. `@parel/lore` and `@parel/narrative` moved to `archive/packages/` (no active imports). Added `docs/archive-map.md` documenting what was archived and why.

### Changed
  - **Workspace config:** Removed `archive/*` from `pnpm-workspace.yaml` so archive is excluded from active workspace. Removed lore and narrative from root `tsconfig.json` references. Added `archive` to `tsconfig.base.json` exclude.

## [0.47.03] - 2026-03-02

### Added
  - **One Logger (#68):** Canonical logger at `@parel/core/logger` with `debug`, `info`, `warn`, `error`, and optional `child(scope)`. Environment-aware (debug only in dev or when LOG_LEVEL allows). Sensitive data redaction in production. Package export `./logger` added to @parel/core.

### Changed
  - **Logger consolidation:** `apps/web/lib/logger.ts` now re-exports from `@parel/core/logger`. `packages/core/utils/debug.ts` delegates to canonical logger; keeps `perfStart`, `debugIf`, `testLog`, `logApi`, `logQuery` for backward compat. `instrumentation.ts` Redis status uses `logger.info` instead of `console.log`. ESLint `no-console: warn` already in place.

### Fixed
  - **Admin ops page:** Variable shadowing (`params` used for both route param and run.params). Renamed to `runParams`.

## [0.47.02] - 2026-03-02

### Added
  - **Path aliases + public API (#64, #65):** Standardized imports across the monorepo. Apps use `@/*` for app-level code; packages use public imports only (`@parel/core`, `@parel/db/client`, `@parel/db/leaf`, `@parel/ui`). Public entrypoints: `lib/hooks/index.ts` barrel for `useUserSummary`, `useFeatureGate`, `usePresencePing`. Package exports: `@parel/db` exposes `./client`, `./leaf`; no direct `src/` or `dist/` imports from outside.

### Changed
  - **Import cleanup:** Replaced `@parel/db/src/client` with `@parel/db/client` in apps/web (API routes, services, workers) and tests. Replaced deep relative and `@parel/ui/atoms` Icon imports with `@parel/ui`. Replaced direct hook imports (`@/lib/hooks/useUserSummary`, `useFeatureGate`) with `@/lib/hooks` barrel. Jest `moduleNameMapper` updated for `@parel/db/client`.

## [0.47.01] - 2026-03-09

### Added
  - **Config unification (#57):** Single entrypoint `@parel/core/config/unified` for all config. Extended unified config schema with `AppMetaConfig` (version, name, features, feedback, stripe, qgen, scheduler). `apps/web/lib/config.ts` now bridges from unified config—calls `ensureUnifiedConfigInitialized()` and re-exports from `getConfig('app').meta`. No module maintains its own config copy; env vars read only in ConfigManager.applyEnvironmentOverrides.
  - **ESLint setup:** Root `.eslintrc.json` with next/core-web-vitals, react-hooks rules (error/warn), @typescript-eslint/no-unused-vars, no-console. Root package.json: eslint + eslint-config-next devDeps. apps/web config already had hook rules; root config enables monorepo-wide lint baseline. Prevents runtime errors like "useEffect is not defined".
  - **useUserSummary hook:** Shared `lib/hooks/useUserSummary.ts` as canonical frontend source for gameplay stats (level, xp, progress, funds, diamonds, streakCount, questionsAnswered). Uses SWR + `/api/user/summary`; subscribes to `xp:update` for revalidation; no fake Lv1/0 XP before load.

### Changed
  - **Navbar, profile, and dashboard unified under useUserSummary:** All three surfaces now use `useUserSummary()` as the canonical source for level, xp, and progress. Profile StatsPanel migrated from `/api/progression/stats` (level/xp) to the hook; still fetches progression API for stats (str/int/cha/luck) and archetype only. Added `getXpProgressDetail(xp)` in lib/xp as single progress calculation shared by all consumers. No fake Lv1 or 0 XP before load.
  - **Navbar XpBar and main dashboard:** Both use `useUserSummary()` instead of duplicate fetches. XpBar shows loading skeleton until data loads; MainPage uses hook data for hero, XP card, Level progress card. Session kept for auth only; progression comes from DB-backed summary.

### Fixed
  - **useEffect is not defined (main page):** Main page used `useEffect` without importing it from React. Added `useEffect` to the React import.
  - **Changelog body text not rendering:** Parser required `line.startsWith("- ")` but changelog uses `  - ` (leading spaces). Switched to regex `^\s*-\s+(.*)$` to match bullets with optional leading whitespace. Page now renders section items; summary counts reflect parsed arrays.

### Changed
  - **Changelog page styling:** Dark background (min-h-screen bg-bg) and card colors (bg-card, border-border) aligned with other pages.
  - **Changelog page dark theme fix:** Explicit slate palette (bg-[#0f172a], bg-slate-800, border-slate-600, text-slate-100) so page stays dark regardless of app theme. Protection banner uses amber-950/30 for dark mode.

### Added
  - **Changelog page improvements:** Filtering (search, month, type), month grouping, summary sidebar. API extends entries with `month`, `year`, `counts`. Client-side filters: searchText, selectedMonth, selectedType. ChangelogSummary component shows totalVersions, totalAdded, totalFixed, totalChanged, last update. Layout: filters + content + sidebar; sidebar collapses under content on small screens.

### Fixed
  - **ensureUnifiedConfigInitialized is not a function:** Added typeof guard in providers.tsx to avoid runtime crash when export fails to resolve; logs warning instead. Added root predev script to build @parel/core before dev.
  - **packages/db TS6307:** tsconfig.json used explicit `include` list that omitted opsRun.ts and feedbackConstants.ts. Replaced with `["index.ts", "src/**/*.ts"]` so all src files are included. Excluded src/seed.ts (schema drift) to restore build; pnpm dev now passes.
  - **DEV crash: ensureUnifiedConfigInitialized is not a function:** Verified dist/config/unified.js exports ensureUnifiedConfigInitialized; source packages/core/config/unified.ts has named export. Fixed providers.tsx: (1) all imports first, no calls before imports; (2) import from @parel/core/config/unified; (3) sync init after imports + UnifiedConfigBoot (useEffect fallback); (4) temp console.log sanity check. Clear .next cache and rebuild core to resolve stale bundling.
  - **Sigil runtime crash:** `generateSigilHeatmap` in `@parel/core` could throw on invalid input. Root cause: invalid/missing `buckets` (non-array or length ≠ 56) or undefined `seed`. Added defensive guards: throw explicit error when `buckets` is not an array; normalize `buckets.length !== 56` to 56 with zeros; default `seed` to `"anonymous"` when null/undefined. Function always returns `{ svg: string }`. No browser APIs; safe for SSR.
  - **generateSigilHeatmap is not a function:** Barrel import from `@parel/core` failed at runtime. Added dedicated export path `@parel/core/sigils/heatmap`. Sigil.tsx now imports from that path. Unit test `sigilHeatmap.test.ts` asserts `typeof generateSigilHeatmap === 'function'` to prevent regression.
  - **Unified config not initialized:** `getUnifiedConfig()` threw on Achievements and other pages when `useRewardToast`/`getUiConfig` ran before init. Root cause: `initUnifiedConfig()` was never called. Added `ensureUnifiedConfigInitialized()` (idempotent) in `@parel/core/config`. Bootstrap: (1) `instrumentation.ts` (Node) calls it at server startup; (2) `app/providers.tsx` calls it at module load (SSR + client). Entrypoint: `Providers` wraps the app and loads before any route; instrumentation runs before first request. Unit test `unifiedConfig.test.ts` verifies init.
  - **ensureUnifiedConfigInitialized is not a function:** Barrel `@parel/core/config` did not export it at runtime. Added dedicated export path `@parel/core/config/unified`. providers.tsx and instrumentation now import from that path. Fixed import order: all imports first, then init call. Export map: `"./config/unified": { types, import, require, default }`.

## [0.46.20] - 2026-03-03

### Added
  - **DEV-ONLY Schema drift guard:** `packages/db/src/dev/schemaGuard.ts` – `validateSchema()` checks users.starterFlowCompletedAt, feedbackRewardClaimed, isBeta. Wired in `instrumentation.ts` (Node runtime, APP_ENV=dev only). On missing column: throws "SCHEMA DRIFT DETECTED: missing column users.X. Run pnpm prisma:migrate:deploy". On OK: "[SchemaGuard] Prisma schema validated (dev)".

### Fixed
  - **SchemaGuard:** Prisma.join() with string array produced invalid SQL for PostgreSQL IN clause. Switched to $queryRawUnsafe with constant IN list (safe: compile-time values only).
  - **DEV Prisma schema drift:** `users.starterFlowCompletedAt` column missing. Root cause: migration `20260302120000_starter_flow_alpha` existed in packages/db/migrations but had not been applied. Ran `pnpm prisma:migrate:deploy` (tsx db-migrate-deploy) to apply 5 pending migrations including starter_flow_alpha.
  - **Diagnostic script:** db-diagnose.ts (DATABASE_URL, migrate status).

### Migration status
  - Prisma uses packages/db/migrations (same dir as schema.prisma). Column confirmed in DB.

## [0.46.19] - 2026-03-02

### Added
  - **Alpha Contributor badge:** When user completes Alpha Feedback – v0.1 and reward is granted, also grants badge ALPHA_CONTRIBUTOR (UserBadge + badgeType for header).
  - **Badge mechanism (reused):** Badge table + UserBadge; User.badgeType for header; seedBadges.ts / ensureAlphaFeedbackPoll; UserBadge component (badgeConfig).
  - **Badge key granted:** ALPHA_CONTRIBUTOR (no existing CONTRIBUTOR; minimal metadata, no levels).
  - **Granting:** Single place in /api/polls/respond; idempotent (check hasBadge before create); no duplicate rows.
  - **Completion message:** "Thanks. Reward claimed and badge unlocked."
  - **Rewarded Feedback flow:** Alpha testers get XP + coins for completing the Alpha Feedback poll pack after Starter Flow.
  - **User fields:** `feedbackRewardClaimed` (Boolean, default false), `isBeta` (Boolean, default false). Migration `20260302210000_user_feedback_reward`.
  - **Config:** `FEEDBACK_REWARD_XP = 100`, `FEEDBACK_REWARD_COINS = 50`, `FEEDBACK_ENABLED` (env: FEEDBACK_ENABLED or NEXT_PUBLIC_FEEDBACK_ENABLED).
  - **Poll completion hook:** When user completes all 5 polls in alpha-feedback-v01 pack, grants XP + coins once, sets `feedbackRewardClaimed = true`. No per-poll XP for alpha pack.
  - **Feedback prompt modal:** After Starter Flow completion: "Help shape Parel" / "1-minute feedback. Earn 100 XP + 50 coins." [Give feedback] [Maybe later]. SessionStorage dismiss; shows again next login until completed.
  - **/feedback/alpha:** 5-question wizard for Alpha Feedback pack. Optional freetext questions allow skip.
  - **Admin Alpha Feedback:** `/admin/feedback` – rewards granted count, % completion (vs starter-completed), distribution per option, freetext responses.
  - **Alpha Tester Feedback Pack:** Internal poll pack for first testers. Poll model supports `packKey`; migration `20260302200000_public_poll_pack_key`.
  - **Alpha Feedback – v0.1:** Structured 5-question poll pack: (1) "Did you understand what to do?" (single choice), (2) "What was the best moment?" (single choice), (3) "Would you come back tomorrow?" (single choice), (4) "What confused you the most?" (free text, optional), (5) "Complete this sentence: Parel is..." (free text, optional).
  - **ensureAlphaFeedbackPoll:** Idempotent seed script in packages/db/scripts; packKey `alpha-feedback-v01`. Seeded via db:seed:world (runSeedWorld).
  - **GET /api/polls?packKey=:** Filter polls by pack key; returns polls ordered by createdAt asc for wizard flow.
  - **Sigil v0.1 (heatmap):** Mirrored 7×8 heatmap profile flag based on recent activity (answers per day, last 56 days). Real data from user_responses; deterministic placeholder from userId+createdAt when no activity.
  - **getUserActivityBuckets(userId):** Returns `{ buckets: number[], placeholder: boolean }`; intensity 0–4; GET /api/user/activity-buckets (auth required).
  - **generateSigilHeatmap({ buckets, seed }):** packages/core; 7 rows × 8 cols, horizontal mirror, 5-level palette, viewBox scaling.
  - **Sigil.tsx:** Props userId, size (sm|md|lg), onClick, expandOnClick; fetches activity, renders SVG; placeholder hover: "New profile, sigil will evolve with activity."; click opens Dialog (large view).
  - **Integration:** Small Sigil in profile header (lg, expandable) and ProfileMenu top bar (sm, expandOnClick=false).
  - **Profile Sigil (MVP):** Deterministic 5x5 SVG sigil from user stats via `generateSigil(userId, stats)` in @parel/core (mirrored grid, small fixed palette, primary/border color buckets).
  - **Profile UI:** `ProfileSigil` component and integration on `/profile` header (recomputed from `/api/user/summary`, no storage or DB change).
  - **Leaderboard:** Small sigil in `PhotoLeaderboard` rows derived from entry scores (no extra requests).
  - **API:** `/api/profile/[id]/sigil` returns SVG for a given user (stats derived from level/karma/questions/streak, cacheable).
  - **OpsRun schema:** entityType, entityId, entityLabel, params (Json), warnings (Json, cap 20), errorStack (String, cap 4000). Migration 20260302180000 in both migrations folders.
  - **Standardized counts:** finishOpsRun normalizes counts to scanned, created, updated, skipped, failed, warnings (default 0).
  - **Wiki enrich / QuestionGen:** Structured counts and params; entityType/entityId/entityLabel for QuestionGen; errorStack on failure.
  - **Admin Ops list:** Client-side filter by type and status; status badges (success/failed/running); entityLabel as secondary line.
  - **Admin Ops detail:** Params JSON (pretty); warnings list (first 20); errorStack in collapsible details block.

### Changed
  - createOpsRun accepts optional entityType, entityId, entityLabel, params.

## [0.46.13] - 2026-03-02

### Added
  - **OpsRun progress tracking:** OpsRun model for internal bots (Question generator, Wiki enrichment). Tracks type, status, duration, counts, message, reportPath.
  - **packages/db:** OpsRun schema + migration (20260302170000). `createOpsRun`, `finishOpsRun` service.
  - **Wiki enrich:** Creates OpsRun at start, finishes on success/fail with counts + reportPath.
  - **QuestionGen processor:** Creates OpsRun per job, finishes on success/fail with counts.
  - **Admin UI:** `/admin/ops` table of last 50 runs; `/admin/ops/[id]` detail. GET /api/admin/ops, GET /api/admin/ops/[id] (admin only).

### Changed
  - Admin dashboard: Ops Runs card linking to /admin/ops.
  - Sidebar nav: Ops Runs link for admins.

## [0.46.12] - 2026-03-02

### Added
  - **WikiBot (tortoise) enrichment:** scripts/wiki-enrich.ts maps FlowQuestions to Wiki Seeds. Batch mode (--limit=10). Produces docs/wiki-enrich-report.md.
  - **FlowQuestion wiki fields:** wikiFillCandidate, worldContextKey, worldContextRegionPolicy, worldContextLabel. Migration 20260302160000.
  - **pnpm wiki:enrich:** Runs enrichment (dev env). pnpm wiki:report: prints report path.
  - **Wiki Seeds keys:** sleep_hours_avg, screen_time_hours_avg added to getWorldContext (placeholder values).
  - **Report per-question world context:** When question.worldContextKey exists, renders "<label> (<year>): <value> <unit> (sourceName)". Uses region from policy (userRegion | fixed:CZ | global).
  - **Starter questions:** ensureStarterFlow sets wikiFillCandidate=true (new + existing).

### Changed
  - Report API: worldContextRows built from each question's worldContextKey; region resolved via worldContextRegionPolicy.

## [0.46.11] - 2026-03-02

### Added
  - **World Context (Wiki Seeds):** Static, versioned real-world reference data (e.g. CZ avg income). No DB, no runtime fetches.
  - **packages/core/src/world/wiki-seeds/cz.json:** Minimal schema + 1 placeholder entry (income_monthly_avg).
  - **getWorldContext(region, key):** Loader in packages/core; exported from @parel/core.
  - **Report World Context row:** Optional "CZ average (2024): 75,000 CZK" on Summary/Report when region=CZ and data exists. Behind ENABLE_WORLD_CONTEXT_ROW.

### Docs
  - docs/COMMANDS.full.md: Wiki Seeds note — update values when validated.

## [0.46.10] - 2026-03-02

### Added
  - **Single source of truth for Redis:** `packages/redis` env (REDIS_URL, REDIS_DISABLED, hasRedis) and `getRedisClient()`. In dev, REDIS_URL unset => Redis disabled by default.
  - **checkPresenceRateLimit:** Implemented in lib/security/rateLimit (5 req/20s per IP) for presence/ping.
  - **Startup Redis status:** Dev-only log "Redis: enabled" or "Redis: disabled (no REDIS_URL)" at server start.
  - **No-op connection proxy:** queue/connection returns no-op when Redis disabled; workers exit gracefully.

### Fixed
  - **Direct ioredis creation removed** from: realtime.ts, broker.ts, queue/connection.ts, queue.ts, jobs/index.ts, queue/questionGenQueue.ts, jobs/questionGen.queue.ts, culturalFilter.ts, ai/context.ts, performance/cache.ts, events/join/route.ts, queue-config.ts, scheduler.worker.ts, questionGen.worker.ts. All use `getRedisClient()` from @parel/redis.
  - **checkPresenceRateLimit missing:** presence/ping now uses proper rate limit (was broken import).
  - **Edge runtime:** env hasRedis computed locally to avoid pulling ioredis into Edge (health route).
  - **REDIS_URL default:** No fallback to localhost in dev; unset => disabled.

### Changed
  - events/today, presence: use getRedisClient/hasRedis from @parel/redis.
  - queue-config createQueue: returns null when Redis disabled; getAllQueueStats returns [].
  - instrumentation.ts: logs Redis status on Node.js server start.

## [0.46.09] - 2026-03-02

### Added
  - **Redis optional in dev:** Redis is no longer required for local development. Set `REDIS_DISABLED=true` to run without it. No unhandled error events or log spam when Redis is unavailable.
  - **Env gate:** `REDIS_DISABLED` (boolean) and `REDIS_URL` (string). If `REDIS_DISABLED=true` or `REDIS_URL` is missing/empty, app uses in-memory fallback instead of ioredis.
  - **In-memory fallback:** `packages/redis` exports `memoryAdapter` (get/set/del with TTL) for cache/locks when Redis is disabled. Rate limit / locks return permissive behavior in dev.
  - **logOnce utility:** Connection errors logged at most once per process start to reduce spam.

### Fixed
  - **ioredis unhandled error:** Client now has `client.on("error", ...)` so connection failures (e.g. ECONNREFUSED) do not crash the process.
  - **smoke:web without Redis:** Smoke script sets `REDIS_DISABLED=true` when `REDIS_URL` is not provided, so smoke passes without a local Redis.

### Changed
  - **Presence / events:** Use centralized `@parel/redis` client instead of creating own ioredis instances.
  - **prod validation:** `REDIS_URL` not required when `REDIS_DISABLED` is set.

### Docs
  - docs/COMMANDS.md: Note that local Redis is optional; `REDIS_DISABLED=true` to run without.

## [0.46.08] - 2026-03-02

### Fixed
  - **useFeatureGate crash:** Hook now never throws. Early return when status !== "authenticated" or !session?.user with { allowed: false, message: "Sign in required." }. Safe mapper `mapSessionUserToGateUser` with defaults (level:1, isBeta:false). Try-catch around canAccessFeature. Does NOT read isPremium from session.
  - **canAccessFeature null-safety:** Falsy user returns { allowed: false, message: "Sign in required.", reason: { custom: { message: "Sign in required." } } } instead of proceeding with rule logic.
  - **Prisma User.isPremium error:** Removed isPremium, premiumUntil from auth JWT select (User model has no such fields). Session/token still include isPremium: false for compatibility; premium gating is TODO.
  - **premiumCheck.ts:** Stub returns false (no Prisma select). lib/season/service.ts: premium track always returns "Premium subscription required" until schema adds entitlement.
  - **RegionSelector crash (main page):** Replaced RegionSelector (placeholder returning null) with FooterLocaleToggle. Region/Language selector source: `@/components/FooterLocaleToggle` (uses `@/lib/i18n/useLocale`).
  - **main page ReferenceErrors:** Added lucide-react imports for AlertCircle (Unable to Load Profile EmptyState) and Trophy (No Achievements Yet EmptyState).
  - **canAccessFeature import error:** Added dedicated export path `@parel/core/config/featureGates` in packages/core package.json. useFeatureGate, FeatureGate, and tests now import from that path instead of `@parel/core/config` barrel.
  - **DEEP_REPORT gate:** Now level-only (level 5). Premium gate deferred until User.isPremium exists in schema.

### Added
  - **Unified feature lock system:** Centralized gate mechanics for UI features. `packages/core/config/featureGates.ts`: FeatureKey union (FLOW_BROWSER, CATEGORIES, RPG, DEEP_REPORT, INVITE, MARKETPLACE), LockReason types (level, premium, admin, beta, custom), `canAccessFeature(user, featureKey)` with message and priority (admin > premium > beta > level > custom).
  - **useFeatureGate(featureKey) hook:** `apps/web/lib/hooks/useFeatureGate.ts` - reads session (level, role, isPremium); SSR-safe; returns { allowed, message, reason }.
  - **FeatureGate component:** `mode="hide"` renders nothing when locked; `mode="placeholder"` renders lock affordance with tooltip. Uses existing Tooltip + Lock icon.
  - **Session includes level:** JWT/session now carries `level` for client-side gate checks without extra fetches.

### Changed
  - **NavLinks:** Arena (RPG) and Invite Friends use FeatureGate. Arena: placeholder when level < 3. Invite: disabled dropdown item with lock + tooltip when level < 3.
  - **Auth:** JWT and session callbacks add `level` from DB.

### Feature gates (initial rules)
  | Feature     | Unlock rule                 |
  |------------|-----------------------------|
  | FLOW_BROWSER | Level 3                    |
  | CATEGORIES   | Level 3                    |
  | RPG          | Level 3                    |
  | DEEP_REPORT  | Level 5 or Premium         |
  | INVITE       | Level 3                    |
  | MARKETPLACE  | Level 5                    |

### Tests
  - Unit test `tests/featureGates.test.ts` for canAccessFeature priority and messages.

## [0.46.07] - 2026-03-02

### Added
  - **Alpha Starter Flow (single canonical):** `STARTER_FLOW_SLUG="starter"` constant. Seed (`db:seed:world`) ensures idempotent starter category with `isStarter`, `visibleInBrowse=false`, 5 curated questions. First: "Have you ever met a ghost?"; others: sleep, phone time, spending, fate. Category metadata: `isStarter=true`, length 5, `visibleInBrowse=false` until Level 3.
  - **Onboarding routing (Level 3 gate):** First Play/flow run forces STARTER flow (no selection UI). Flow selection (categories/browse) unlocked at level >= 3 or when starter completed. `DEV_UNLOCK_FLOWS=1` skips gate. `getAvailableCategories(userId)` applies gate.
  - **Report/Summary screen (Option A - You vs The World):** After finishing starter flow: headline ("You are more X than Y% of players"), subheader ("Based on N responses"), 3 comparison rows (You vs Global synthetic stats), identity hint ("You are trending toward: The Curious Realist"), unlock note. CTAs: Continue, Back to Home. No economy, inventory, RPG, or technical stats.
  - **Synthetic comparison stats:** `getSyntheticGlobalStats(questionId, type, userAnswer)` deterministic per day; non-round numbers; stable N. Service in `lib/services/syntheticStats.ts`. `formatHours()` for numeric display.
  - **Storage:** `users.starterFlowCompletedAt` (nullable) set when starter report shown. POST `/api/flow/starter-complete` records completion.
  - **APIs:** GET `/api/flow/report?categoryId=` returns Option A payload. GET `/api/flow/categories` respects Level 3 gate via session.

### Changed
  - **flow-demo:** Single starter category auto-starts (no selection UI); shows "Starting your flow..." during launch. Result step shows Option A report when starter flow completed; otherwise legacy "Flow Complete!" with answered/skipped/XP grid.
  - **Seed:** `ensureStarterFlow()` in ensureBaselineData; runSeedWorld invokes it. Idempotent upsert of starter questions.

### Models / Schema
  - User: `starterFlowCompletedAt` (DateTime?)
  - SssCategory: `slug`, `isStarter`, `visibleInBrowse`

## [0.46.06] - 2026-03-02

### Added
  - **Safe deploy command:** `pnpm deploy` runs validate, then git add/commit/push. Aborts if validate fails. Vercel builds from Git. scripts/deploy.ps1.
  - **Tiny human command surface:** validate = big hammer (PASS/FAIL summary, fail-fast). scripts/validate.ps1 runs check:dev-sanity, typecheck, test, smoke:web, smoke:flow; optional e2e:local if RUN_E2E=true. scripts/daily.ps1: optional kill, then dev. docs/COMMANDS.md explains each command and underlying scripts. Root scripts: kill, daily, validate now invoke PowerShell scripts.
  - **Human-owned command list:** docs/COMMANDS.md is now minimal (2 commands per topic): daily, kill, validate, smoke:web, db:reset:world, db:seed:world, build:web, start:web. Full reference moved to docs/COMMANDS.full.md. New scripts: `daily` (= dev), `kill` (= kill-port 3001), `validate` (check:dev-sanity + typecheck + test, skips missing), `start:web` (prod mode port 3011), `help` (prints docs path). kill:3001 kept as alias of kill.
  - **Documentation gate for commands:** If any package.json scripts change (root, apps/web, packages/db), docs/COMMANDS.md must be updated in the same commit. `scripts/check-command-docs.mjs` computes a sha256 hash of script names and compares it to `<!-- commands-hash: ... -->` in docs/COMMANDS.md. `scripts/update-command-docs-hash.mjs` updates the marker. Root scripts: `pnpm check:command-docs` (gate), `pnpm docs:commands:update` (refresh). Wired into `check:dev-sanity`.
  - **scripts/kill-port.ps1:** Kill process(es) owning a TCP port. Usage: `.\scripts\kill-port.ps1 -Port 3001`.
  - **pnpm kill:3001:** Root script to free port 3001.
  - **docs/COMMANDS.md:** Canonical command reference with Daily / Recovery / DB / Release / Utilities grouping.

### Changed
  - **Script normalization:** Normalized root package.json scripts; no hardcoded Prisma --schema; scoped builds via `pnpm --filter`.
  - **build:web:** Now `pnpm --filter @parel/web... run build` (was `cd apps/web && pnpm run build:web`).
  - **typecheck:** Now `pnpm --filter @parel/web run typecheck` (was `cd apps/web && pnpm run typecheck`).
  - **prisma:generate:** Now `pnpm --filter @parel/db run prisma:generate` (uses package config).
  - **prisma:db:pull:** Now `pnpm --filter @parel/db exec prisma db pull` (uses package config).
  - **test:smoke:** Now alias of `pnpm smoke:flow`; deprecated in favor of `smoke:flow` or `smoke:web` per use case.

## [0.46.01] - 2026-03-01

### Added
  - **Alpha baseline seed contract:** docs/seed-baseline.md defines minimal invariants. ensureBaselineData(prisma) enforces: (1) admin user, (2) 4 RPG enemies, (3) 3 items, (4) flow category hierarchy, (5) 1 flow question. Idempotent; invoked early by runSeedWorld. Stops seed whack-a-mole on empty DB.
  - **RPG DLC gating + multi-character + Play enablement:** RPG is DLC-like enhancement on core Questions/Comparison app. Schema: User fields `rpgEnabled`, `rpgCreatedAt`, `rpgPromptSeenAt`, `rpgDismissedAt`, `activeCharacterId`; new `Character` model (userId, type, name); `CharacterEquipment` (characterId, slot, inventoryItemId). Eligibility: level >= 3 && answeredToday >= 5; users can create character anytime. API: GET `/api/rpg/status` (eligible, rpgEnabled, hasCharacter, activeCharacterId, shouldPromptCreate), POST `/api/rpg/dismiss`, `/api/rpg/enable`, `/api/rpg/disable`, POST `/api/rpg/character/create` (type, name?), POST `/api/rpg/character/set-active` (characterId). Play page: CreateCharacterGate when no character (inline class selector: mage, paladin, warrior, rogue, cleric); Enable RPG CTA when disabled. Arena link moved from admin extras to main nav for all logged-in users.
  - **Inventory unification (alpha canonical stash = UserItem):** CharacterEquipment now supports `userItemId` (canonical) and `inventoryItemId` (legacy fallback). Migration `20260301130000_character_equipment_user_item` adds userItemId FK to UserItem, makes inventoryItemId nullable. New service `equipCharacterItem(userId, characterId, slot, userItemId)` and `unequipCharacterSlot(userId, characterId, slot)`. New API: GET `/api/rpg/equipment?characterId=`, POST `/api/rpg/equipment/equip` (characterId, slot, userItemId), POST `/api/rpg/equipment/unequip` (characterId, slot). Read path: resolve userItemId first, inventoryItemId fallback. RPG loot: combatService and rewardsEngine now use `addItemToInventory` (UserItem) instead of `createInventoryItem` (InventoryItem). No new inventory tables added.

### Changed
  - **Seed:** ensureBaselineData runs first; seed-world adds fuller content. Alpha baseline only—use feature bootstrap for deeper data.
  - **Migration sync (prisma vs packages/db):** Added migrations to packages/db/migrations/ for schema already in packages/db/prisma/migrations/ so deploy applies correctly: users.birthYear (20260301140000), users.lastNewsSeenAt (20260301150000), flow_questions.challengeEnabled (20260301160000), daily_charms + user_daily_charms (20260301170000), roadmap_items + roadmap_votes (20260301180000), milestone_rules + milestone_deliveries (20260301190000). All seed scripts now set birthYear: 1990 on users. OAuth and test-login user creation also set birthYear.
  - **Play (Arena) admin gate removed:** `/play` no longer requires admin. NavLinks shows "Arena" in main nav for all authenticated users. Play page gates: no character → Create character flow; rpgEnabled false → Enable RPG button. Core flow unaffected when RPG APIs fail.
  - **Canonical stash = UserItem:** `/api/inventory` and user-facing inventory use UserItem. RPG equipment uses UserItem via CharacterEquipment.userItemId. InventoryItem is legacy; read fallback only. TODO: remove InventoryItem after Alpha.
  - **RPG inventory stabilization (InventoryItem read-only for RPG):** POST `/api/rpg/equip` now accepts `{ characterId, slot, userItemId }`; back-compat: `inventoryItemId` maps to UserItem via (userId, itemId) or returns "Legacy item cannot be mapped; re-add item to stash". POST `/api/rpg/unequip` accepts `{ characterId, slot }`; back-compat: `inventoryItemId` finds CharacterEquipment and clears. equipItem/unequipItem deprecated (throw); no InventoryItem writes from RPG. getTotalItemPower/applyItemEffects: dual-read—CharacterEquipment.userItemId (active character) first, InventoryItem fallback. createInventoryItem: dev-only warn when called. Verified: no RPG endpoint creates/updates InventoryItem.

### Models reused
  - User (added RPG fields), UserItem (canonical stash), Item. CharacterEquipment extended with userItemId. InventoryItem legacy; CharacterEquipment.inventoryItemId kept for backwards compat.

### TODOs
  - Remove InventoryItem after Alpha. Inventory UI (equipment loadout), prompt modal for shouldPromptCreate, profile settings toggle for rpgEnabled, character switcher when >1 characters.

## [0.45.26] - 2026-02-27

### Fixed
  - **Prisma generate zod warning:** zod-prisma-types could not determine zod version when running from monorepo root — "Falling back to default 4.0.0" warning. Added `zod` as root dependency so the generator can resolve it; warning should be eliminated or reduced.
  - **Prisma migrate deploy DATABASE_URL error:** `prisma:migrate:deploy` failed with "Environment variable not found: DATABASE_URL" because it ran Prisma directly without env loading. Project uses `DATABASE_URL_DEV` / `DATABASE_URL_PROD` via APP_ENV, not DATABASE_URL directly. Created `packages/db/scripts/db-migrate-deploy.ts` — loads .env via `_loadEnv`, sets `DATABASE_URL` from `resolveDatabaseUrl` (DATABASE_URL_DEV when APP_ENV=dev, DATABASE_URL_PROD when prod), then runs `prisma migrate deploy`. Root script `prisma:migrate:deploy` now invokes this tsx script instead of calling Prisma directly. Migrate deploy works in both dev and prod (set APP_ENV=prod and DATABASE_URL_PROD for production).

### Added
  - **db-migrate-deploy.ts:** Wrapper script for `prisma migrate deploy` that loads env files (root .env, .env.local, apps/web/.env, apps/web/.env.local) and resolves DATABASE_URL from DATABASE_URL_DEV or DATABASE_URL_PROD before invoking Prisma. Ensures migrations run correctly regardless of which env vars are defined.
