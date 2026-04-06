-- Add statusMessage to users (short bio/vibe). Schema had it; DB was missing the column.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "statusMessage" TEXT;
