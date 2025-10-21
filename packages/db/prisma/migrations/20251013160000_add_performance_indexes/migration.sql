-- Add Performance Indexes (v0.11.2)
-- Optimize queries for major models with (userId, createdAt) composite indexes

-- User indexes
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_createdAt_idx" ON "users"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "users_xp_level_idx" ON "users"("xp" DESC, "level" DESC);
CREATE INDEX IF NOT EXISTS "users_lastActiveAt_idx" ON "users"("lastActiveAt" DESC) WHERE "lastActiveAt" IS NOT NULL;

-- Activity/EventLog indexes (userId, createdAt composite)
CREATE INDEX IF NOT EXISTS "activities_userId_createdAt_idx" ON "activities"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "event_logs_userId_createdAt_idx" ON "event_logs"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "event_logs_type_createdAt_idx" ON "event_logs"("type", "createdAt" DESC);

-- Notification indexes
CREATE INDEX IF NOT EXISTS "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- Message indexes
CREATE INDEX IF NOT EXISTS "messages_senderId_createdAt_idx" ON "messages"("senderId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "messages_receiverId_createdAt_idx" ON "messages"("receiverId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "messages_isRead_idx" ON "messages"("isRead") WHERE "isRead" = false;

-- Challenge indexes
CREATE INDEX IF NOT EXISTS "challenges_initiatorId_createdAt_idx" ON "challenges"("initiatorId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "challenges_receiverId_createdAt_idx" ON "challenges"("receiverId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "challenges_status_createdAt_idx" ON "challenges"("status", "createdAt" DESC);

-- GlobalFeedItem indexes
CREATE INDEX IF NOT EXISTS "global_feed_items_userId_createdAt_idx" ON "global_feed_items"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "global_feed_items_type_createdAt_idx" ON "global_feed_items"("type", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "global_feed_items_reactionsCount_idx" ON "global_feed_items"("reactionsCount" DESC, "createdAt" DESC);

-- UserAchievement indexes
CREATE INDEX IF NOT EXISTS "user_achievements_userId_earnedAt_idx" ON "user_achievements"("userId", "earnedAt" DESC);

-- InventoryItem indexes
CREATE INDEX IF NOT EXISTS "inventory_items_userId_idx" ON "inventory_items"("userId");

-- DailyQuizCompletion indexes
CREATE INDEX IF NOT EXISTS "daily_quiz_completions_userId_completedAt_idx" ON "daily_quiz_completions"("userId", "completedAt" DESC);

-- QuestCompletion indexes
CREATE INDEX IF NOT EXISTS "quest_completions_userId_completedAt_idx" ON "quest_completions"("userId", "completedAt" DESC);

-- Session indexes (NextAuth)
CREATE INDEX IF NOT EXISTS "sessions_userId_idx" ON "sessions"("userId");
CREATE INDEX IF NOT EXISTS "sessions_expires_idx" ON "sessions"("expires");

-- Account indexes (NextAuth OAuth)
CREATE INDEX IF NOT EXISTS "accounts_userId_idx" ON "accounts"("userId");
CREATE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_idx" ON "accounts"("provider", "providerAccountId");

-- Group/Clan indexes
CREATE INDEX IF NOT EXISTS "group_members_groupId_userId_idx" ON "group_members"("groupId", "userId");
CREATE INDEX IF NOT EXISTS "group_activities_groupId_createdAt_idx" ON "group_activities"("groupId", "createdAt" DESC);

-- Faction indexes
CREATE INDEX IF NOT EXISTS "faction_members_userId_idx" ON "faction_members"("userId");
CREATE INDEX IF NOT EXISTS "faction_members_factionId_idx" ON "faction_members"("factionId");

-- Performance: Partial indexes for common filters
CREATE INDEX IF NOT EXISTS "users_active_idx" ON "users"("lastActiveAt" DESC) 
  WHERE "lastActiveAt" > NOW() - INTERVAL '7 days';

CREATE INDEX IF NOT EXISTS "notifications_unread_idx" ON "notifications"("userId", "createdAt" DESC) 
  WHERE "isRead" = false;

-- Archive old EventLog/Activity entries (older than 30 days)
-- Note: This is a placeholder for archival job, not executed in migration
-- Actual archival should be done via scheduled job










