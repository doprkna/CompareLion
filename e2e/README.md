# E2E Golden Path Tests

Playwright-based E2E crawler to validate main golden paths, no console errors, no 4xx/5xx same-origin requests, primary CTA exists, and screenshots.

## Prerequisites

- Dev server runs on `http://localhost:3001` (default for `pnpm dev`)
- `REVIEW_MODE=true` and `REVIEW_MODE_SECRET` in Vercel Preview env
- Demo user seeded (e.g. `pnpm db:seed:demo`)

## Local

1. Start the app: `pnpm dev`
2. In another terminal: `pnpm e2e:local`

Uses `BASE_URL=http://localhost:3001` and `REVIEW_MODE=true` automatically.

## Vercel Preview (CI)

Runs on pull requests. Requires:

- `VERCEL_TOKEN` – Vercel API token
- `VERCEL_PROJECT_ID` – Project ID from Vercel dashboard
- `VERCEL_TEAM_ID` – (optional) Team ID if using a team

Add `REVIEW_MODE=true` and `REVIEW_MODE_SECRET` in Vercel project settings for **Preview** environment only. Do not enable in Production.

Run manually with a known URL:

```powershell
$env:BASE_URL="https://your-preview.vercel.app"; $env:REVIEW_MODE="true"; pnpm e2e:preview
```

## Install Playwright browsers (CI / first run)

```bash
pnpm e2e:install
```

## Test login

When `REVIEW_MODE=true`, `GET /api/test-login?user=demo` sets an authenticated session cookie (no OAuth). Tests use this for deterministic auth.

## Screenshots

On success, screenshots are written to `e2e/screenshots/`. On failure, Playwright saves screenshots, traces, and videos to `test-results/` and `playwright-report/`.
