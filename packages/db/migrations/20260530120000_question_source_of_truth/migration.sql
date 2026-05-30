-- Question Source of Truth: taxonomy external IDs, Question lifecycle/import fields,
-- QuestionStats, FlowQuestion.sourceQuestionId. Safe / additive only.

-- CreateEnum
CREATE TYPE "QuestionLifecycleStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED', 'REJECTED');
CREATE TYPE "QuestionSensitivityLevel" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH');

-- Taxonomy external IDs
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "externalCId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Category_externalCId_key" ON "Category"("externalCId");

ALTER TABLE "SubCategory" ADD COLUMN IF NOT EXISTS "externalScId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "SubCategory_categoryId_externalScId_key" ON "SubCategory"("categoryId", "externalScId");

ALTER TABLE "SubSubCategory" ADD COLUMN IF NOT EXISTS "externalSscId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "SubSubCategory_subCategoryId_externalSscId_key" ON "SubSubCategory"("subCategoryId", "externalSscId");

ALTER TABLE "SssCategory" ADD COLUMN IF NOT EXISTS "externalSssId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "SssCategory_subSubCategoryId_externalSssId_key" ON "SssCategory"("subSubCategoryId", "externalSssId");

-- Question canonical import fields
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "responseType" "QuestionType";
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "outcome" TEXT;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "multiplication" INTEGER;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "ageCategory" TEXT;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "sourceAuthor" TEXT;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "isWildcard" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "wildcardLabel" TEXT;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "lifecycleStatus" "QuestionLifecycleStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "isSensitive" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "sensitivityLevel" "QuestionSensitivityLevel" NOT NULL DEFAULT 'NONE';
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "qualityScore" DOUBLE PRECISION;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "importedAt" TIMESTAMP(3);
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "sourceName" TEXT;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "sourceRowNumber" INTEGER;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "externalSourceLabel" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "questions_sourceName_sourceRowNumber_key" ON "questions"("sourceName", "sourceRowNumber");
CREATE INDEX IF NOT EXISTS "questions_ssscId_lifecycleStatus_idx" ON "questions"("ssscId", "lifecycleStatus");
CREATE INDEX IF NOT EXISTS "questions_lifecycleStatus_idx" ON "questions"("lifecycleStatus");

-- Backfill lifecycle from legacy approved flag (non-destructive)
UPDATE "questions"
SET "lifecycleStatus" = 'APPROVED'
WHERE "approved" = true AND "lifecycleStatus" = 'DRAFT';

-- QuestionStats (materialized counters, not import truth)
CREATE TABLE IF NOT EXISTS "question_stats" (
    "questionId" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "answerCount" INTEGER NOT NULL DEFAULT 0,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "question_stats_pkey" PRIMARY KEY ("questionId")
);

DO $$ BEGIN
  ALTER TABLE "question_stats" ADD CONSTRAINT "question_stats_questionId_fkey"
    FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- FlowQuestion link to canonical Question
ALTER TABLE "flow_questions" ADD COLUMN IF NOT EXISTS "sourceQuestionId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "flow_questions_sourceQuestionId_key" ON "flow_questions"("sourceQuestionId");
CREATE INDEX IF NOT EXISTS "flow_questions_sourceQuestionId_idx" ON "flow_questions"("sourceQuestionId");

DO $$ BEGIN
  ALTER TABLE "flow_questions" ADD CONSTRAINT "flow_questions_sourceQuestionId_fkey"
    FOREIGN KEY ("sourceQuestionId") REFERENCES "questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
