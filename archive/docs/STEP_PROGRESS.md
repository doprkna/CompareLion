# Cursor Safety Lite Mode - Step Progress Checklist

**Version:** 0.30.7  
**Date:** 2025-11-01

## Purpose

This document defines the minimal, safe execution flow for Cursor Safety Lite Mode â€” prevents recursion, token overload, or endless reindex loops. Each step runs independently and commits cleanly before the next.

## Execution Order

### âœ… Step 1: Admin God View (v0.30.0)
**Status:** âœ… Completed

**Tasks:**
- âœ… Run `/admin/dev-lab` creation
- âœ… Verify base UI renders

**Deliverables:**
- `/admin/dev-lab` SSR page
- `/api/admin/systems` API endpoint
- `AdminSystemCard` component
- `docs/DEV_LAB_OVERVIEW.md`

**Commit:**
```
git add .
git commit -m "v0.30.0 - Admin God View - Dev Lab Visibility"
git push
```

---

### âœ… Step 2: Feature Exposure (v0.30.1)
**Status:** âœ… Completed

**Tasks:**
- âœ… Implement `/api/admin/{system}/list` endpoints
- âœ… Connect them to dev-lab cards

**Deliverables:**
- `/api/admin/[system]/list` dynamic route
- `lib/admin/listHelper.ts` helper
- Updated `/api/admin/systems` with apiRoute references

**Commit:**
```
git add .
git commit -m "v0.30.1 - Feature Exposure - API Placeholders for Hidden Systems"
git push
```

---

### âœ… Step 3: DB Integrity Sweep (v0.30.2)
**Status:** âœ… Completed

**Tasks:**
- âœ… Run CLI script â†’ save JSON summary
- âœ… Add admin endpoint to read report

**Deliverables:**
- `scripts/db-integrity-check.ts`
- `lib/db/integrity-utils.ts`
- `/api/admin/db/summary` API endpoint

**Commit:**
```
git add .
git commit -m "v0.30.2 - Database Integrity Sweep"
git push
```

---

### âœ… Step 4: API & Schema Audit (v0.30.3)
**Status:** âœ… Completed

**Tasks:**
- âœ… Execute `scripts/api-map.ts`
- âœ… Review generated `logs/api-map-*.json`

**Deliverables:**
- `scripts/api-map.ts`
- `/api/admin/api-map` API endpoint
- `docs/API_SANITY_REPORT.md` template

**Commit:**
```
git add .
git commit -m "v0.30.3 - API & Schema Sanity Audit"
git push
```

---

### âœ… Step 5: Infrastructure Refactor (v0.30.4)
**Status:** âœ… Completed

**Tasks:**
- âœ… Merge constants, unify debug + error handlers
- âœ… Test full build

**Deliverables:**
- Merged `lib/config/constants.ts`
- Updated `lib/api/error-handler.ts` with aliases
- Verified `lib/utils/debug.ts`
- `docs/INFRA_REFACTOR_SUMMARY.md`

**Commit:**
```
git add .
git commit -m "v0.30.4 - Infrastructure Refactor - Core Utilities Consolidation"
git push
```

---

### âœ… Step 6: Cursor Efficiency Mode (v0.30.5)
**Status:** âœ… Completed

**Tasks:**
- âœ… Apply `.cursor/config.json`, `.env.local` flags
- âœ… Rebuild project index once

**Deliverables:**
- `.cursor/config.json`
- Updated `.env.local` with efficiency flags
- Updated `apps/web/package.json` dev script
- `docs/CURSOR_PERFORMANCE_GUIDE.md`

**Commit:**
```
git add .
git commit -m "v0.30.5 - Cursor Efficiency Mode - Performance & Stability Optimization"
git push
```

---

### âœ… Step 7: Testing & Verification Recovery (v0.30.6)
**Status:** âœ… Completed

**Tasks:**
- âœ… Restore smoke tests
- âœ… Run `pnpm test` â†’ verify output clean

**Deliverables:**
- Updated `vitest.config.ts`
- `__tests__/api-smoke.test.ts`
- `__tests__/flow-core.test.ts`
- `__tests__/constants.test.ts`
- `lib/test/mock-db.ts` (documented)
- `scripts/test-ci.ps1`
- `docs/TEST_RECOVERY_SUMMARY.md`

**Commit:**
```
git add .
git commit -m "v0.30.6 - Testing & Verification Recovery"
git push
```

---

## Commit Pattern

Use consistent commits for each step:

```bash
git add .
git commit -m "v0.30.x StepN - short description"
git push
```

## Sanity Check After Each Step

Run these checks after completing each step:

1. **Build Check:**
   ```bash
   pnpm run build
   ```
   - âœ… No type errors
   - âœ… No build failures

2. **Dev Server Check:**
   ```bash
   pnpm run dev
   ```
   - âœ… Server starts without errors
   - âœ… No console spam
   - âœ… No infinite loops

3. **Admin Dev Lab Check:**
   - Navigate to `/admin/dev-lab`
   - âœ… Loads instantly (< 1 second)
   - âœ… All systems displayed
   - âœ… No 500 errors

4. **Test Check:**
   ```bash
   pnpm test
   ```
   - âœ… All 3 smoke tests pass
   - âœ… Execution time < 5 seconds
   - âœ… No DB connection errors

## Execution Rules

1. **One Step Per Session**
   - Only run one step per Cursor session
   - Don't attempt multiple steps in one go

2. **Restart After Commit**
   - After each commit â†’ **restart Cursor**
   - Forces clean indexing
   - Prevents token accumulation

3. **Keep Progress Updated**
   - Update this file with âœ… marks as steps complete
   - Document any issues encountered

4. **Clean State**
   - Each step should leave codebase in stable state
   - No broken imports or references
   - All tests passing before moving to next step

## Current Status

**All steps completed:** âœ… (v0.30.0 through v0.30.6)

**Last Completed:** Step 7 - Testing & Verification Recovery (v0.30.6)

**Post-Cleanup Validation:** ✅ Complete (v0.30.8)

**Next Steps:**
- Review all deliverables
- Run final sanity checks
- Prepare for v0.31.x features

## Notes

- Each step is independent and self-contained
- Steps can be run in any order (but recommended to follow sequence)
- Keep commits atomic and descriptive
- Restart Cursor between steps to avoid token buildup
