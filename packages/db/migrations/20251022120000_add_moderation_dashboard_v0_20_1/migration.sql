/*
  Migration: Content Moderation Dashboard v0.20.1
  
  This migration adds admin moderation capabilities:
  - Banned flag on users
  - Moderation log for tracking admin actions
*/

-- Add banned field to users table
ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "banned" BOOLEAN NOT NULL DEFAULT false;

-- Create moderation_logs table
CREATE TABLE IF NOT EXISTS "moderation_logs" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "moderatorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "moderation_logs_moderatorId_fkey" 
    FOREIGN KEY ("moderatorId") 
    REFERENCES "users"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
);

-- Create indexes on moderation_logs table
CREATE INDEX IF NOT EXISTS "moderation_logs_moderatorId_idx" ON "moderation_logs"("moderatorId");
CREATE INDEX IF NOT EXISTS "moderation_logs_targetType_targetId_idx" ON "moderation_logs"("targetType", "targetId");
CREATE INDEX IF NOT EXISTS "moderation_logs_createdAt_idx" ON "moderation_logs"("createdAt");

