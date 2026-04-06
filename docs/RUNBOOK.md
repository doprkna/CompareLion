# PareL Runbook

Windows/PowerShell commands. Run from repo root unless noted.

## 1. Env setup

- **APP_ENV**: `dev` (default) or `prod`. Unset = dev.
- **DATABASE_URL_DEV**: Required for dev. PostgreSQL connection string.
- **DATABASE_URL_PROD**: Required when APP_ENV=prod.
- **DATABASE_URL**: Optional override; skips APP_ENV resolution when set.
- **NEXTAUTH_URL**: Auth callback base (e.g. `http://localhost:3001` for dev).
- **NEXT_PUBLIC_PORT**: Port for smoke/e2e (default 3001).
- **SMOKE_KEY**: Required for smoke tests. Set in apps/web/.env.local. Dev-only; enables x-smoke-key header for flow API auth bypass.

PowerShell:
```powershell
$env:APP_ENV = "dev"
$env:DATABASE_URL_DEV = "postgresql://user:pass@host:5432/dbname"
```

Or use `.env` / `.env.local` in apps/web.

## 2. DB: doctor, migrate dev, seed big

```powershell
pnpm db:doctor:dev          # Check connectivity, redacted URL, env sanity
pnpm db:migrate:dev         # Run migrations (dev only; exits if APP_ENV=prod)
pnpm db:seed:big            # Big demo seed (10 cats, ~200 q, 50 users; dev only)
```

Minimal seed:
```powershell
pnpm db:seed:demo           # 2 cats, 30 questions, demo@example.com
```

## 3. Start dev server

```powershell
pnpm dev                    # Same as pnpm dev:web
```

Serves at http://localhost:3001 (apps/web uses port 3001).

## 4. Tests

```powershell
pnpm test:unit              # Vitest (apps/web)
pnpm test:e2e               # Playwright (requires dev server on 3001)
pnpm test:smoke             # Smoke-flow API test (requires dev server + demo user)
pnpm test:ci                # unit + smoke
```

E2E and smoke need dev server running first. Smoke requires SMOKE_KEY in env (set in apps/web/.env.local) and seeded demo user.

## 5. Admin diagnostics

- **URL**: http://localhost:3001/admin (requires ADMIN role).
- **API**: GET /api/admin/diagnostics (admin-only).
- **Shows**: ok, appEnv/nodeEnv, gitSha/buildTime/appVersion, db.connected, host, dbName, seed counts (categories, flowQuestions, users, responses), flow.canStart.
- **Refresh**: Button on Diagnostics card; seed button auto-refreshes after success.

## 6. Common failures

| Failure | Fix |
|---------|-----|
| Port 3001 in use | Stop other process on 3001 or set NEXT_PUBLIC_PORT; Playwright baseURL must match. |
| DATABASE_URL missing | Set DATABASE_URL_DEV (dev) or DATABASE_URL_PROD (prod); or DATABASE_URL directly. |
| db:migrate:dev exits | APP_ENV=prod blocks migrate dev; use APP_ENV=dev. |
| Empty seed / no categories | Run `pnpm db:seed:big` or `pnpm db:seed:demo` (APP_ENV=dev). |
| Smoke flow fails | Ensure dev server on 3001, demo user exists (seed), NEXTAUTH_URL=http://localhost:3001. |
| E2E fails | Ensure dev server running; baseURL defaults to http://localhost:3001. |

## 7. CI (Diagnostics gate)

- **Now:** `pnpm test:unit` + `pnpm test:smoke` (together: `pnpm test:ci`)
- **Later:** Add `pnpm test:e2e` once health.spec.ts is stable
- See `docs/CI-REQUIREMENTS.md` for full spec; `docs/ci-diagnostics-proposal.diff` for proposed YAML changes
