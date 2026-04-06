<!-- commands-hash: b8d3aec1599011850ff0755e221480b5272bffd9a232c7eb517128e404e7838d -->

# Parel Commands (Human List)
Windows PowerShell. Run from repo root.

## Daily (use most of the time)
- pnpm kill
  Frees port 3001 (stops any running dev server). Calls scripts/kill-port.ps1 3001.
- pnpm daily
  Starts dev server (stable mode). Optional: kill port 3001 first. Calls scripts/daily.ps1 -> pnpm dev.

## Validate (before testers / demo)
- pnpm validate
  Runs a full validation chain in one go. Calls: check:dev-sanity, typecheck, test, smoke:web, smoke:flow (skips missing). Optional e2e:local if RUN_E2E=true. Prints PASS/FAIL. Fail-fast.

## Redis (optional in dev)
Local Redis is optional. Set `REDIS_DISABLED=true` to run without it. No Redis error spam when disabled.

## Database (when data is broken)
- pnpm db:reset:world
  Resets world DB state to known good seed (destructive). Calls db-reset-world script.

## Build / Demo (production-like confidence)
- pnpm build:web
  Builds web app in production mode. Calls pnpm --filter @parel/web... run build.
- pnpm start:web
  Starts production build on port 3011. Calls pnpm --filter @parel/web... run start -- -p 3011.

## Deploy (production via Vercel)
- pnpm deploy
  Runs full validation and pushes to Git. Vercel builds from repo.
