-- WikiBot: optional world-context metadata for FlowQuestion
ALTER TABLE "flow_questions" ADD COLUMN IF NOT EXISTS "wikiFillCandidate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "flow_questions" ADD COLUMN IF NOT EXISTS "worldContextKey" TEXT;
ALTER TABLE "flow_questions" ADD COLUMN IF NOT EXISTS "worldContextRegionPolicy" TEXT;
ALTER TABLE "flow_questions" ADD COLUMN IF NOT EXISTS "worldContextLabel" TEXT;
