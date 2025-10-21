# Import Migration TODO (v0.13.1)
**Generated:** 2025-10-18  
**Status:** Documented for gradual migration

## Overview
Many files still import from `@parel/db` (workspace package) instead of the standardized `@/lib/db` pattern. This creates inconsistency but is not currently breaking functionality.

## Why This Matters
- **Consistency:** Standardized imports improve maintainability
- **Type Safety:** Local imports provide better IDE support
- **Refactoring:** Easier to track dependencies

## Current State
The codebase has **70+ files** with legacy `@parel/db` imports that should be migrated to `@/lib/db`.

## Migration Strategy
**Do NOT migrate all at once.** Instead:
1. Fix new files as they're created
2. Update files when they're being edited for other reasons
3. Track progress incrementally

## Files Requiring Migration

### API Routes (High Priority - ~30 files)
```
app/api/admin/questions/validate/route.ts
app/api/admin/seed-db/route.ts  
app/api/audit/route.ts
app/api/flows/route.ts
(... ~26 more API route files)
```

### Library Files (Medium Priority - ~25 files)
```
lib/db.ts
lib/db/connection-pool.ts
lib/dto/authDTO.ts
lib/dto/meDTO.ts
lib/jobs/questionGen.processor.ts
(... ~20 more lib files)
```

### Scripts (Low Priority - ~5 files)
```
scripts/validate-schema.ts
scripts/generate-questions.ts
(... ~3 more scripts)
```

### Test Files (Low Priority - ~10 files)
```
tests/api/*.test.ts
tests/lib/*.test.ts
```

## How to Migrate a File

### Before:
```typescript
import { prisma } from '@parel/db';
import type { User, Question } from '@prisma/client';
```

### After:
```typescript
import { prisma } from '@/lib/db';
import type { User, Question } from '@prisma/client';
```

## Notes
- The `@prisma/client` imports are fine and should remain unchanged
- Only `@parel/db` imports need migration
- Test the file after migration
- This is a gradual, ongoing process

## Progress Tracking
- [ ] Phase 1: API routes (0/30)
- [ ] Phase 2: Library files (0/25)
- [ ] Phase 3: Scripts (0/5)
- [ ] Phase 4: Tests (0/10)

**Last Updated:** 2025-10-18




