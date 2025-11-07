# 🚀 Refactor v0.13.2c – Quick Reference

## ✅ What Was Done (Phase 1)

### Infrastructure Created
1. **`lib/config/constants.ts`** - Game constants (XP, currency, colors, etc.)
2. **`lib/utils/debug.ts`** - Structured logging (replaces console.log)
3. **`lib/api/error-handler.ts`** - Unified API error handling
4. **`lib/theme.config.ts`** - Design system tokens
5. **`lib/performance/lazy-components.tsx`** - Lazy-loaded components

### Files Cleaned
- `app/api/auth/login/route.ts` - Removed 3 console.log
- `app/main/page.tsx` - Replaced 9 console statements

---

## 🎯 How to Use

### 1. Debug Logging
```typescript
import { debug, error, info, perfStart } from '@/lib/utils/debug';

// Simple logging
debug('Loading data...', { userId: '123' });
info('Operation completed');
error('Failed to save', err, { context: 'userProfile' });

// Performance timing
const end = perfStart('loadData');
// ... your code ...
end(); // Logs: "⏱️  loadData 142.35ms"
```

### 2. API Error Handling
```typescript
import { asyncHandler, successResponse, handleApiError } from '@/lib/api/error-handler';

// Wrap entire route (auto-catches errors)
export const POST = asyncHandler(async (req) => {
  const data = await doSomething();
  return successResponse(data, 'Success');
});

// Or manual error handling
export async function GET(req: Request) {
  try {
    // ... logic ...
    return successResponse({ users });
  } catch (err) {
    return handleApiError(err, 'GET /api/users');
  }
}
```

### 3. Using Constants
```typescript
import { XP_CONSTANTS, COLOR_CONSTANTS, CURRENCY_CONSTANTS } from '@/lib/config/constants';

// XP calculation
const xp = XP_CONSTANTS.QUESTION_BASE * XP_CONSTANTS.DIFFICULTY.hard;

// Colors
const color = COLOR_CONSTANTS.KARMA.saint; // 'text-blue-400'

// Currency
const starting = CURRENCY_CONSTANTS.STARTING_FUNDS; // 1000
```

### 4. Lazy Components
```typescript
import { LazyShop, LazyFlowRunner } from '@/lib/performance/lazy-components';

function MyPage() {
  return (
    <div>
      <LazyShop /> {/* Loads only when rendered */}
    </div>
  );
}
```

### 5. Theme Tokens
```typescript
import { SPACING, COLORS, TYPOGRAPHY, ANIMATIONS } from '@/lib/theme.config';

const styles = {
  padding: SPACING.lg,
  color: COLORS.STATUS.success,
  fontSize: TYPOGRAPHY.fontSize.xl,
};
```

---

## ⚠️ Next Steps (Phase 2)

**Not yet done** (documented in `REFACTOR_PHASE2_PLAN.md`):
- [ ] Remove 69 remaining console.log calls
- [ ] Clean unused imports
- [ ] Refactor 200+ API routes with error handler
- [ ] Add Zod validation
- [ ] Replace `<img>` with `<Image />`
- [ ] Unify import paths

**Estimated effort**: 4-6 hours

---

## 📚 Documentation

- **Full Summary**: `REFACTOR_v0.13.2c_PHASE1_SUMMARY.md`
- **Phase 2 Plan**: `REFACTOR_PHASE2_PLAN.md`
- **Changelog**: `apps/web/CHANGELOG.md` (v0.13.2c)

---

## 🔥 Commands

```bash
# Type check
cd apps/web && pnpm run typecheck

# Lint
pnpm run lint

# Build
pnpm run build

# Test
pnpm test
```

---

## 🦁 Safety Notes

✅ **All changes are backwards compatible**  
✅ **No breaking changes**  
✅ **No schema modifications**  
✅ **Build and tests still work**

Use the new utilities in new code, refactor old code incrementally.


