-- AlterTable: add lastNewsSeenAt for News unseen badge (v0.45.20); safe if column exists
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastNewsSeenAt" TIMESTAMP(3);
