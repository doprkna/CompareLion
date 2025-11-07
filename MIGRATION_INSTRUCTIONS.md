# Database Migration Instructions for v0.5.20

## New Models Added
- FlowQuestion
- FlowQuestionOption  
- UserResponse
- QuestionType enum

## Migration Command

Run this in a **new PowerShell window** (interactive mode required):

```powershell
cd C:\Users\doprk\parel-mvp\packages\db
pnpm exec prisma migrate dev --name questions_and_user_responses
```

This will:
1. Create migration files for the new models
2. Apply the migration to your database
3. Update the Prisma client

## After Migration

Return here and I'll continue with:
- Seed script updates
- API routes
- UI components

**Note:** The Prisma client has already been generated, so the types are available.













