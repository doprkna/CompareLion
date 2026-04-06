-- Alpha: Starter Flow + User.starterFlowCompletedAt
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "starterFlowCompletedAt" TIMESTAMP(3);
ALTER TABLE "SssCategory" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "SssCategory" ADD COLUMN IF NOT EXISTS "isStarter" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SssCategory" ADD COLUMN IF NOT EXISTS "visibleInBrowse" BOOLEAN NOT NULL DEFAULT true;
CREATE UNIQUE INDEX IF NOT EXISTS "SssCategory_slug_key" ON "SssCategory"("slug") WHERE "slug" IS NOT NULL;
