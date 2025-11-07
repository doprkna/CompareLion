/*
  Migration: Echo Layer v0.19.6
  
  This migration adds social foundation features:
  - User presence fields (username, bio, visibility)
  - Enhanced notifications with sender tracking
  - Type enums for structured notification handling
*/

-- Create UserVisibility enum
CREATE TYPE "UserVisibility" AS ENUM ('PUBLIC', 'FRIENDS', 'PRIVATE');

-- Create NotificationType enum
CREATE TYPE "NotificationType" AS ENUM ('REFLECTION', 'LIKE', 'COMMENT', 'SYSTEM');

-- Add new fields to users table
ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "username" TEXT,
  ADD COLUMN IF NOT EXISTS "bio" TEXT,
  ADD COLUMN IF NOT EXISTS "visibility" "UserVisibility" NOT NULL DEFAULT 'FRIENDS';

-- Create unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");

-- Create index on username for lookups
CREATE INDEX IF NOT EXISTS "users_username_idx" ON "users"("username");

-- Add senderId to notifications table
ALTER TABLE "notifications" 
  ADD COLUMN IF NOT EXISTS "senderId" TEXT;

-- Store existing type values temporarily
ALTER TABLE "notifications"
  ADD COLUMN IF NOT EXISTS "type_temp" TEXT;

UPDATE "notifications"
SET "type_temp" = "type";

-- Drop the old type column
ALTER TABLE "notifications"
  DROP COLUMN IF EXISTS "type";

-- Add the new type column as enum
ALTER TABLE "notifications"
  ADD COLUMN "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM';

-- Migrate data - map existing string types to enum values
UPDATE "notifications"
SET "type" = CASE 
  WHEN "type_temp" ILIKE '%reflection%' THEN 'REFLECTION'::"NotificationType"
  WHEN "type_temp" ILIKE '%like%' THEN 'LIKE'::"NotificationType"
  WHEN "type_temp" ILIKE '%comment%' THEN 'COMMENT'::"NotificationType"
  ELSE 'SYSTEM'::"NotificationType"
END;

-- Drop temporary column
ALTER TABLE "notifications"
  DROP COLUMN IF EXISTS "type_temp";

-- Add sender foreign key constraint
ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_senderId_fkey" 
  FOREIGN KEY ("senderId") 
  REFERENCES "users"("id") 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

-- Create index on senderId for lookups
CREATE INDEX IF NOT EXISTS "notifications_senderId_idx" ON "notifications"("senderId");

