# TypeScript Cleanup Audit — v0.23.0

**Date:** 2025-10-23  
**Status:** Initial Audit  
**Total Errors:** 915

---

## 🔍 Error Distribution

| Error Code | Count | Description | Priority |
|------------|-------|-------------|----------|
| TS6133 | 447 | Unused variables/imports | **P1 - Easy** |
| TS7006 | 125 | Implicit `any` types | **P2 - Medium** |
| TS2345 | 80 | Type assignment errors | **P3 - Hard** |
| TS2339 | 46 | Property doesn't exist | **P3 - Hard** |
| TS2532 | 35 | Object possibly undefined | **P2 - Medium** |
| TS2322 | 33 | Type not assignable | **P3 - Hard** |
| TS2305 | 28 | Module export missing | **P3 - Hard** |
| TS2307 | 22 | Module not found | **P3 - Hard** |
| TS2353 | 13 | Unknown object properties | **P2 - Medium** |
| TS2554 | 12 | Wrong arg count | **P2 - Medium** |
| Others | ~74 | Misc type issues | **P4 - Various** |

---

## 🎯 Cleanup Strategy

### Phase 1: Low-Hanging Fruit (Quick Wins)
**Target:** ~450 errors  
**Time:** 1-2 hours  

1. **Remove Unused Imports** (TS6133 - ~447 errors)
   - Use ESLint autofix: `pnpm lint:fix`
   - Manual cleanup for edge cases
   - Verify no side-effect imports are removed

**Tools:**
```bash
# ESLint with unused-imports plugin (already installed)
pnpm lint:fix
```

---

### Phase 2: Type Annotations (Medium Difficulty)
**Target:** ~125 errors  
**Time:** 2-3 hours  

1. **Fix Implicit `any`** (TS7006 - ~125 errors)
   - Add proper types to parameters
   - Common patterns:
     - Array methods: `.map(item => ...)` → `.map((item: Type) => ...)`
     - Event handlers: `callback` → `(callback: Function)`
     - API params: `data` → `data: RequestData`

2. **Add Null Checks** (TS2532 - ~35 errors)
   - Use optional chaining: `obj?.property`
   - Add guards: `if (!obj) return`
   - Use nullish coalescing: `value ?? default`

3. **Fix Zod Validation** (~20+ errors)
   - Replace `.errors` with `.issues` (Zod v4 breaking change)
   - Pattern: `.parse()` → check `.issues` instead of `.errors`

---

### Phase 3: API Return Types (Hard)
**Target:** ~200 errors  
**Time:** 3-4 hours  

1. **Standardize API Responses** (TS2345, TS2322 - ~80+ errors)
   - Issue: Routes typed as `Promise<NextResponse<ApiError>>` but return mixed types
   - Fix: Update route wrappers to accept union types
   - Pattern:
     ```ts
     // Before
     export const GET = withAuth(async (req) => { ... })
     
     // After
     export const GET = withAuth<ApiError | ApiSuccess<Data>>(async (req) => { ... })
     ```

2. **Fix Stripe API Version** (~10 errors)
   - Update from `"2022-11-15"` to `"2025-09-30.clover"`
   - Check breaking changes in Stripe SDK

---

### Phase 4: Module & Schema Issues (Hard)
**Target:** ~100 errors  
**Time:** 2-3 hours  

1. **Fix Missing Modules** (TS2307, TS2305 - ~50 errors)
   - Missing exports in modules
   - Path alias issues
   - Deleted/moved files

2. **Prisma Schema Alignment** (TS2353, TS2339 - ~50 errors)
   - Properties that don't exist in schema
   - Old model references
   - Run `pnpm prisma:generate` to sync

---

## 🛠️ Automation Scripts

### Create `npm run clean` Script
Add to `package.json`:
```json
{
  "scripts": {
    "clean": "pnpm lint:fix && pnpm typecheck",
    "clean:unused": "pnpm lint:fix",
    "clean:check": "pnpm lint && pnpm typecheck"
  }
}
```

### Optional: ts-prune for Dead Code
```bash
pnpm add -D ts-prune
# Run: pnpm ts-prune | grep -v "used in module"
```

---

## 📊 Expected Results

| Phase | Errors Fixed | Remaining | Time |
|-------|-------------|-----------|------|
| Start | 0 | 915 | - |
| Phase 1 | 447 | 468 | 1-2h |
| Phase 2 | 180 | 288 | 2-3h |
| Phase 3 | 200 | 88 | 3-4h |
| Phase 4 | 88 | 0 | 2-3h |
| **Total** | **915** | **0** | **8-12h** |

---

## ⚠️ High-Risk Areas

1. **API Routes** — Large refactor needed for type unions
2. **Prisma Models** — Schema changes may affect DB
3. **Stripe Integration** — API version upgrade needs testing
4. **Auth System** — Don't break session handling

---

## ✅ Progress Update — Session 1 (2025-10-23)

**Starting Point:** 915 errors  
**Current:** 866 errors  
**Fixed:** 49 errors (5.4% reduction)

### Completed:
- ✅ Ran ESLint lint:fix (27 errors auto-fixed)
- ✅ Fixed Zod validation: `.error.errors` → `.error.issues` (22 files)
- ✅ Aligned Stripe API version to `2024-11-20.acacia` (2 files)
- ✅ Added npm clean scripts: `clean`, `clean:fix`, `clean:check`

### Remaining Work:
- ⏳ Fix unused variables with `_` prefix (~440 errors)
- ⏳ Add type annotations for implicit `any` (~125 errors)
- ⏳ Standardize API return types (~200 errors)
- ⏳ Fix Prisma/module issues (~100 errors)

---

## ✅ Next Steps

1. **Phase 1 (cont):** Systematically prefix unused params with `_`
2. **Phase 2:** Add explicit types to common patterns
3. **Phase 3:** Refactor API route type system
4. **Phase 4:** Fix Prisma schema mismatches

**Estimated Remaining Time:** 6-10 hours

---

**Notes:**
- Use `pnpm clean:check` to verify progress
- Test auth/payment flows after major changes
- Commit incrementally by phase

