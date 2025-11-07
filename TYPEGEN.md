# Type Generation Documentation

**Version:** 0.34.8 - Schema-First Types  
**Date:** November 6, 2025  
**Status:** âœ… Successfully Implemented

---

## ðŸŽ¯ Overview

PAREL now uses **Prisma + Zod** as the single source of truth for all data contracts. Types are automatically generated from the Prisma schema, eliminating manual type maintenance.

---

## ðŸ“¦ Setup

### Dependencies

- **zod-prisma-types** (^3.3.5) - Generates Zod schemas from Prisma
- **zod** (^4.1.11) - Runtime validation library

Both installed in \packages/db\

---

## ðŸ› ï¸ Commands

### Generate Types

\\\ash
# From packages/db
cd packages/db
pnpm generate

# Or from apps/web
pnpm gen:types

# Or sync types across workspace
pnpm types:sync
\\\

### Auto-generation

Types are automatically regenerated on:
- \pnpm install\ (postinstall hook in packages/db)
- \pnpm gen:types\ (manual)
- \prisma generate\ (direct)

---

## ðŸ“ Generated Files

**Location:** \packages/db/generated/\

**Key Files:**
- \index.ts\ - All Zod schemas and types
- Exports for every Prisma model (UserSchema, FlowQuestionSchema, etc.)

**Example:**
\\\	ypescript
import { UserSchema, FlowQuestionSchema, MarketItemSchema } from '@parel/db/generated';
import { z } from 'zod';

// Infer TypeScript type from Zod schema
type User = z.infer<typeof UserSchema>;
type Question = z.infer<typeof FlowQuestionSchema>;
\\\

---

## ðŸ”„ Migration from Old DTOs

### Before (Manual DTOs)

\\\	ypescript
// apps/web/lib/dto/questionDto.ts
export function toQuestionDTO(q: any): {
  id: string;
  ssscId: string;
  // ... 15+ fields manually typed
} {
  return {
    id: q.id.toString(),
    // ... manual mapping
  };
}
\\\

### After (Generated Types)

\\\	ypescript
// apps/web/lib/dto/questionDto.ts
import { FlowQuestionSchema } from '@parel/db/generated';
import { z } from 'zod';

export type QuestionDTO = z.infer<typeof FlowQuestionSchema>;

export function toQuestionDTO(q: unknown): QuestionDTO {
  return FlowQuestionSchema.parse(q); // Runtime validation!
}
\\\

---

## âœ… Refactored Files

**DTOs (3 files):**
1. \pps/web/lib/dto/questionDto.ts\ - Now uses FlowQuestionSchema
2. \pps/web/lib/dto/taskDTO.ts\ - Now uses TaskSchema
3. \pps/web/lib/dto/jobDTO.ts\ - Now uses JobLogSchema

**Type Files (2 files):**
1. \pps/web/lib/marketplace/types.ts\ - Uses MarketItemSchema
2. \pps/web/lib/mounts/types.ts\ - Uses MountTrialSchema, UserMountTrialSchema

**API Routes (4 files):**
- \pps/web/app/api/questions/route.ts\
- \pps/web/app/api/tasks/route.ts\
- \pps/web/app/api/jobs/[id]/route.ts\
- \pps/web/app/api/jobs/start/[ssscId]/route.ts\

---

## ðŸŽ¨ Usage Patterns

### Pattern 1: Type Inference

\\\	ypescript
import { UserSchema } from '@parel/db/generated';
import { z } from 'zod';

type User = z.infer<typeof UserSchema>;

function processUser(user: User) {
  // Fully typed!
  console.log(user.email, user.level, user.xp);
}
\\\

### Pattern 2: Runtime Validation

\\\	ypescript
import { MarketItemSchema } from '@parel/db/generated';

export async function POST(req: Request) {
  const body = await req.json();
  
  // Validate + parse
  const result = MarketItemSchema.safeParse(body);
  
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  
  const item = result.data; // Fully typed and validated
}
\\\

### Pattern 3: Partial Types

\\\	ypescript
import { UserSchema } from '@parel/db/generated';
import { z } from 'zod';

// Create partial for updates
const UserUpdateSchema = UserSchema.partial();
type UserUpdate = z.infer<typeof UserUpdateSchema>;
\\\

---

## ðŸ“Š Benefits

âœ… **Single source of truth** - Schema â†’ Types (no drift)  
âœ… **Runtime validation** - Zod catches invalid data at runtime  
âœ… **Auto-sync** - Types update when schema changes  
âœ… **Reduced code** - Eliminated ~6 handwritten DTO/type files  
âœ… **Type safety** - Full TypeScript coverage across API boundaries  
âœ… **Developer experience** - IntelliSense for all models  

---

## ðŸ”§ Configuration

### Prisma Generator Config

Location: \packages/db/schema.prisma\

\\\prisma
generator zod {
  provider              = "zod-prisma-types"
  output                = "./generated"
  useDecimalJs          = false
  prismaJsonNullability = true
  createInputTypes      = false
  createModelTypes      = true
}
\\\

---

## ðŸš« .gitignore

The generated folder is gitignored:

\\\
# packages/db/.gitignore
/generated/
\\\

Types are regenerated on install, so no need to commit them.

---

## ðŸŽ¯ Next Steps

1. **Extend schemas** - Add Zod refinements for custom validation
2. **API validation** - Use schemas in all API routes
3. **Form validation** - Use schemas with react-hook-form
4. **Documentation** - Auto-generate API docs from schemas

---

**End of Documentation**
