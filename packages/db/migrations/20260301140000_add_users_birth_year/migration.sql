-- AlterTable: add birthYear for age-gating (moderation); safe if column exists
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "birthYear" INTEGER;
