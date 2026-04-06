# Archive Map

Code moved out of the active monorepo to reduce indexing noise and surface area.

## Prune #73 (2026-03)

### archive/packages/lore

- **Was:** `packages/lore` (@parel/lore)
- **Why:** No active imports. Lore engine / narrative scaffolding unused by apps/web, story, or any runtime.
- **Safe to ignore:** Yes, in normal development.

### archive/packages/narrative

- **Was:** `packages/narrative` (@parel/narrative)
- **Why:** No active imports. Narrative generator unused by any active app.
- **Safe to ignore:** Yes, in normal development.

## Existing archive structure

- `archive/2025-11/` — Old admin, cron, monitoring, telemetry
- `archive/web-tests/`, `archive/web-tests-unit/` — Superseded test suites
- `archive/web-scripts/` — Old scripts
- `archive/unused/` — Debug/test API routes
- `archive/web-app-legacy/` — Legacy app pieces

## Config changes

- **pnpm-workspace.yaml:** `archive/*` removed — archive is not part of the workspace
- **tsconfig.json:** lore, narrative project references removed
- **tsconfig.base.json:** `archive` added to exclude
- **Cursor indexing:** Add `archive/` to `.cursorignore` (if present) to reduce indexing noise
