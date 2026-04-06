# CI Requirements (Diagnostics Gate)

What CI must run before allowing deploys. Lightweight gate: not full runtime gating.

## Now (required)

- **Unit:** `pnpm test:unit` (Vitest)
- **Smoke:** `pnpm test:smoke` (Flow demo API loop)

Together: `pnpm test:ci` (runs both).

Smoke requires: dev server on port 3001, seeded DB with demo user (demo@example.com). In CI: migrate, seed:demo, start server, wait for readiness, run smoke.

## Later (when stable)

- **E2E:** `pnpm test:e2e` (Playwright). Add once `e2e/health.spec.ts` exists and is stable.

## Gate

Deploy workflows (staging, production) must not succeed if unit or smoke fail. Either: CI runs unit + smoke and deploy requires CI to pass; or deploy workflow runs the same steps before deploy.
