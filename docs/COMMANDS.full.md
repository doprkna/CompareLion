<!-- commands-hash: 5bdf6b8e2cb6c495c89dc43e5f9c0e1d59ea823400a3253784374804c3133cb6 -->

# Parel Commands

Windows PowerShell only. Run from repo root unless noted.

## Daily

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start web dev server (port 3001) |
| `pnpm dev:web` | Same as dev |
| `pnpm lint` | Lint web + worker |
| `pnpm typecheck` | TypeScript check (@parel/web) |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:unit` | Same as test |
| `pnpm smoke:web` | **Canonical** smoke: build + start + hit /api/health, /api/init, /api/flow/start, /api/rpg/status |
| `pnpm smoke:flow` | Flow API smoke (requires dev server + SMOKE_KEY + demo user) |
| `pnpm kill:3001` | Kill process on port 3001 |

### Deprecated aliases

| Deprecated | Use instead |
|------------|-------------|
| `pnpm test:smoke` | `pnpm smoke:flow` |

## Recovery

| Command | Description |
|---------|-------------|
| `pnpm kill:3001` | Free port 3001 |
| `pnpm db:doctor:dev` | DB connectivity check (dev) |
| `pnpm db:doctor:prod` | DB connectivity check (prod) |
| `pnpm check:dev-sanity` | Routes, page dupes, dynamic-route collisions |
| `pnpm check:changelog` | Changelog format check |

## DB

| Command | Description |
|---------|-------------|
| `pnpm prisma:generate` | Generate Prisma client (@parel/db) |
| `pnpm prisma:migrate:deploy` | Deploy migrations (wrapper; loads env) |
| `pnpm prisma:db:pull` | Pull schema from DB |
| `pnpm db:push` | Push schema (no migrations) |
| `pnpm db:migrate:dev` | Migrate dev (APP_ENV=dev) |
| `pnpm db:seed` | Full seed |
| `pnpm db:seed:demo` | Minimal seed (demo@example.com) |
| `pnpm db:seed:big` | Big demo seed |
| `pnpm db:reset` | Push + seed |
| `pnpm db:studio` | Prisma Studio |

Prisma commands use @parel/db canonical config (no hardcoded --schema in root).

## Release / Build

| Command | Description |
|---------|-------------|
| `pnpm build:web` | Build @parel/web and deps |
| `pnpm build` | Build all workspaces |
| `pnpm build:light` | Build web stack (excl. story) |
| `pnpm build:vercel` | Vercel-style build |
| `pnpm build:full` | Full recursive build |
| `pnpm test:ci` | Unit + smoke flow |

## Utilities

| Command | Description |
|---------|-------------|
| `pnpm clean:check` | Lint + typecheck |
| `pnpm clean:fix` | Lint fix + format |
| `pnpm gen:questions` | Generate flow questions |
| `pnpm web:check-imports` | Check web imports |
| `pnpm watchdog` | DB watchdog |
| `pnpm dev:web:watchdog` | Dev with watchdog |
| `pnpm e2e:install` | Playwright deps |
| `pnpm e2e:local` | Playwright (local) |
| `pnpm e2e:preview` | Playwright (preview) |
| `scripts/kill-port.ps1 -Port 3001` | Kill port (generic) |

## Wiki Seeds (World Context)

Wiki Seeds are static placeholders; update values when validated. Data in `packages/core/src/world/wiki-seeds/`. Add or edit JSON files, then use `getWorldContext(region, key)` from `@parel/core`.

| Command | Description |
|---------|-------------|
| `pnpm wiki:enrich` | Run WikiBot enrichment (dev). Maps candidate questions to wiki keys. Use `--limit=N` (default 10). |
| `pnpm wiki:report` | Print path to latest docs/wiki-enrich-report.md |
