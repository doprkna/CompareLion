-- Reconcile flow_questions with schema.prisma (idempotent).
-- Wiki/world-context columns were added only under packages/db/prisma/migrations/ earlier;
-- deploy uses packages/db/migrations/, so those ALTERs never ran for many databases (P2022).
-- tags/arcStep live in legacy arc_step migration but are included here for DBs that skipped it.

ALTER TABLE "flow_questions" ADD COLUMN IF NOT EXISTS "wikiFillCandidate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "flow_questions" ADD COLUMN IF NOT EXISTS "worldContextKey" TEXT;
ALTER TABLE "flow_questions" ADD COLUMN IF NOT EXISTS "worldContextRegionPolicy" TEXT;
ALTER TABLE "flow_questions" ADD COLUMN IF NOT EXISTS "worldContextLabel" TEXT;
ALTER TABLE "flow_questions" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "flow_questions" ADD COLUMN IF NOT EXISTS "arcStep" TEXT;
