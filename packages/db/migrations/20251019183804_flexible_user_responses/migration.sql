/*
  Migration: Flexible User Responses
  
  This migration updates the UserResponse model to support multiple answer types:
  - optionIds[] replaces single optionId (supports both single and multi-select)
  - numericVal for range/number inputs
  - textVal for open/free text responses
  
  Data migration strategy:
  - Existing optionId values migrate to optionIds array
  - Existing valueText values migrate to textVal
  - timeMs is removed (not needed for MVP)
*/

-- AlterEnum: Add RANGE question type
ALTER TYPE "QuestionType" ADD VALUE IF NOT EXISTS 'RANGE';

-- Step 1: Add new columns with defaults
ALTER TABLE "user_responses" 
  ADD COLUMN IF NOT EXISTS "optionIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "numericVal" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "textVal" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- Step 2: Migrate existing data
-- Migrate optionId to optionIds array (if optionId is not null)
UPDATE "user_responses" 
SET "optionIds" = ARRAY["optionId"]::TEXT[]
WHERE "optionId" IS NOT NULL AND "optionIds" = ARRAY[]::TEXT[];

-- Migrate valueText to textVal
UPDATE "user_responses" 
SET "textVal" = "valueText"
WHERE "valueText" IS NOT NULL AND "textVal" IS NULL;

-- Set updatedAt to createdAt for existing records
UPDATE "user_responses"
SET "updatedAt" = "createdAt"
WHERE "updatedAt" IS NULL;

-- Step 3: Make updatedAt NOT NULL now that all rows have a value
ALTER TABLE "user_responses" 
  ALTER COLUMN "updatedAt" SET NOT NULL;

-- Step 4: Drop old columns (safe now that data is migrated)
ALTER TABLE "user_responses" 
  DROP COLUMN IF EXISTS "optionId",
  DROP COLUMN IF EXISTS "timeMs",
  DROP COLUMN IF EXISTS "valueText";
