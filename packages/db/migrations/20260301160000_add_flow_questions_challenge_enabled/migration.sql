-- AlterTable: add challengeEnabled for flow question challenges; safe if column exists
ALTER TABLE "flow_questions" ADD COLUMN IF NOT EXISTS "challengeEnabled" BOOLEAN NOT NULL DEFAULT false;
