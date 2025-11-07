/*
  Migration: Social 2.0 v0.20.0
  
  This migration adds social interaction features:
  - Enhanced messages with soft delete and flagging
  - Comment system for reflections/comparisons
  - Moderation capabilities
*/

-- Add new fields to messages table
ALTER TABLE "messages" 
  ADD COLUMN IF NOT EXISTS "flagged" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "hiddenBySender" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "hiddenByReceiver" BOOLEAN NOT NULL DEFAULT false;

-- Create comments table
CREATE TABLE IF NOT EXISTS "comments" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "flagged" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "comments_userId_fkey" 
    FOREIGN KEY ("userId") 
    REFERENCES "users"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
);

-- Create indexes on comments table
CREATE INDEX IF NOT EXISTS "comments_userId_idx" ON "comments"("userId");
CREATE INDEX IF NOT EXISTS "comments_targetType_targetId_idx" ON "comments"("targetType", "targetId");
CREATE INDEX IF NOT EXISTS "comments_createdAt_idx" ON "comments"("createdAt");

