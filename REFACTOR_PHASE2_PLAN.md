# 🔧 Refactoring Sprint v0.13.2c – Phase 2 Plan

**Status**: Ready to Execute  
**Estimated Effort**: 4-6 hours  
**Risk Level**: Low (non-breaking changes)

---

## 🎯 Objectives

Complete the refactoring started in Phase 1:
1. Remove all remaining console.log calls
2. Clean up unused imports
3. Refactor key API routes with unified error handler
4. Add Zod validation to critical endpoints
5. Replace `<img>` with Next.js `<Image />`
6. Unify import paths to use `@/` prefix

---

## 📋 Task Breakdown

### Task 1: Remove Remaining Console.log (69 calls)
**Priority**: High  
**Effort**: 2 hours  
**Risk**: Low

#### Files to Update
1. `app/api/flow-answers/route.ts` - 14 calls
2. `app/api/admin/reseed/route.ts` - 2 calls  
3. `app/api/admin/overview/route.ts` - 1 call
4. `app/api/realtime/route.ts` - 3 calls
5. `app/main/page.tsx` - 3 calls (already done)
6. `app/api/user/summary/route.ts` - 8 calls
7. `app/api/presence/route.ts` - 2 calls
8. `app/api/debug-session/route.ts` - 2 calls
9. `app/api/debug-prisma/route.ts` - 10 calls
10. `app/api/flow-questions/route.ts` - 2 calls
11. `app/components/Footer.tsx` - 7 calls
12. `app/api/changelog/route.ts` - 5 calls
13. `app/api/auth/login/route.ts` - 2 calls (already done)
14. `app/api/simple-login/route.ts` - 8 calls
15. `app/api/test-login/route.ts` - 4 calls
16. `app/api/newsletter/route.ts` - 1 call
17. `app/api/shop/webhook/route.ts` - 1 call

#### Approach
```typescript
// Before
console.log('[DEBUG] Loading data...');
console.error('Failed:', error);

// After  
import { debug, error as logError } from '@/lib/utils/debug';

debug('Loading data...');
logError('Failed', error);
```

---

### Task 2: Clean Unused Imports
**Priority**: Medium  
**Effort**: 1 hour  
**Risk**: Low

#### Approach
```bash
# Run ESLint with unused-imports plugin
cd apps/web
pnpm eslint --fix --ext .ts,.tsx app lib components

# Or manually:
# 1. Search for unused imports in each file
# 2. Remove them
# 3. Verify build still works
```

#### High-Impact Files
- `app/admin/*.tsx` - Many unused lucide icons
- `app/api/**/route.ts` - Unused types/utilities
- `lib/**/*.ts` - Unused helper imports

---

### Task 3: Refactor API Routes
**Priority**: High  
**Effort**: 2 hours  
**Risk**: Medium (requires testing)

#### Priority Routes

**Auth Routes** (`app/api/auth/*`)
- ✅ `login/route.ts` (partially done)
- `signup/route.ts`
- `reset/route.ts`
- `verify/route.ts`
- `logout/route.ts`

**User Routes** (`app/api/user/*`)
- `summary/route.ts`
- `profile/route.ts`
- `settings/route.ts`

**Flow Routes** (`app/api/flow-*`)
- `flow-questions/route.ts`
- `flow-answers/route.ts`

**Shop Routes** (`app/api/shop/*`)
- `checkout/route.ts`
- `products/route.ts`
- `webhook/route.ts`

#### Pattern
```typescript
import { asyncHandler, successResponse, validationError } from '@/lib/api/error-handler';

export const POST = asyncHandler(async (req) => {
  const body = await req.json();
  
  // Validation
  if (!body.email) {
    return validationError('Email required');
  }
  
  // Business logic
  const result = await doSomething(body);
  
  // Success
  return successResponse(result, 'Success');
});
```

---

### Task 4: Add Zod Validation
**Priority**: Medium  
**Effort**: 1 hour  
**Risk**: Low

#### Create Validation Schemas
**Location**: `lib/validation/api.ts`

```typescript
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  captcha: z.string().optional(),
});

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(50).optional(),
});

export const FlowAnswerSchema = z.object({
  questionId: z.string().uuid(),
  optionIds: z.array(z.string()).optional(),
  numericVal: z.number().optional(),
  textVal: z.string().optional(),
});

// ... more schemas
```

#### Use in Routes
```typescript
import { FlowAnswerSchema } from '@/lib/validation/api';
import { asyncHandler, successResponse } from '@/lib/api/error-handler';

export const POST = asyncHandler(async (req) => {
  const body = await req.json();
  const validated = FlowAnswerSchema.parse(body); // Auto-caught
  
  // ... use validated data
  
  return successResponse({ success: true });
});
```

---

### Task 5: Replace `<img>` with `<Image />`
**Priority**: Low  
**Effort**: 30 minutes  
**Risk**: Low

#### Find All Images
```bash
cd apps/web
grep -r "<img" app components --include="*.tsx" --include="*.jsx"
```

#### Replace Pattern
```typescript
// Before
<img src="/logo.png" alt="Logo" />

// After
import Image from 'next/image';

<Image 
  src="/logo.png" 
  alt="Logo" 
  width={200} 
  height={50} 
  priority={true} // for above-fold images
/>
```

#### Common Locations
- Profile avatars
- Logo images
- Badge/achievement icons
- Shop item images

---

### Task 6: Unify Import Paths
**Priority**: Low  
**Effort**: 30 minutes  
**Risk**: Low

#### Find Relative Imports
```bash
grep -r "from '\.\." app lib components --include="*.ts" --include="*.tsx"
```

#### Replace Pattern
```typescript
// Before
import { something } from '../../../lib/utils';
import { Component } from '../../components/ui/card';

// After
import { something } from '@/lib/utils';
import { Component } from '@/components/ui/card';
```

---

## 🧪 Testing Checklist

After each task:
- [ ] `pnpm run typecheck` passes
- [ ] `pnpm run lint` passes
- [ ] `pnpm run build` succeeds
- [ ] Manual test of affected pages
- [ ] Check dev server runs without errors

---

## 📊 Success Metrics

| Metric | Before | After Phase 2 Target |
|--------|--------|---------------------|
| console.log calls | 69 | 0 |
| Unused imports | ~50 | 0 |
| API routes with unified error handling | 2 | 20+ |
| Zod validation schemas | 1 | 10+ |
| `<img>` tags | Unknown | 0 (in main pages) |
| Relative imports | Unknown | 0 |

---

## ⚠️ Risks & Mitigation

### Risk 1: Breaking Changes in API Routes
**Mitigation**: 
- Test each route after refactoring
- Keep old error format temporarily if needed
- Use feature flags for gradual rollout

### Risk 2: Image Optimization Issues
**Mitigation**:
- Start with non-critical images
- Test different sizes/formats
- Use placeholder prop for loading states

### Risk 3: Type Errors After Import Changes
**Mitigation**:
- Run typecheck after each batch
- Fix immediately before moving to next file
- Keep backup of working state

---

## 📝 Execution Order

1. ✅ **Task 1: Remove console.log** (least risky, high impact)
2. ✅ **Task 2: Clean unused imports** (automated, low risk)
3. **Task 3: Refactor API routes** (highest value)
4. **Task 4: Add Zod validation** (works with Task 3)
5. **Task 5: Replace images** (independent, low priority)
6. **Task 6: Unify imports** (cleanup, low risk)

---

## 🚀 Ready to Execute

Phase 2 can begin immediately with Task 1. Each task is independent and can be done incrementally.

**Estimated Timeline**: 1-2 days of focused work

**Review Points**: After Tasks 1, 3, and completion of all tasks


