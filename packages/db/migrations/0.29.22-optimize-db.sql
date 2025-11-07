-- Migration: v0.29.22 - DB Optimization (Schema Audit & Index Boost)
-- Apply this migration manually after schema changes:
-- pnpm prisma migrate dev --name optimize-db-0_29_22

-- 1. Create ActivityType enum (if not exists)
DO $$ BEGIN
  CREATE TYPE "ActivityType" AS ENUM ('reflection', 'question', 'quest', 'badge', 'achievement', 'social', 'system', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Update Activity.type column to use enum
ALTER TABLE "activities" 
  ALTER COLUMN "type" TYPE "ActivityType" USING "type"::"ActivityType";

-- 3. Create UserStats table (unified stats)
CREATE TABLE IF NOT EXISTS "user_stats" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL UNIQUE,
  "totalXP" INTEGER NOT NULL DEFAULT 0,
  "totalCoins" INTEGER NOT NULL DEFAULT 0,
  "totalKarma" INTEGER NOT NULL DEFAULT 0,
  "questionsCount" INTEGER NOT NULL DEFAULT 0,
  "streakDays" INTEGER NOT NULL DEFAULT 0,
  "currentRank" INTEGER,
  "lastWeekXP" INTEGER NOT NULL DEFAULT 0,
  "lastWeekCoins" INTEGER NOT NULL DEFAULT 0,
  "lastWeekKarma" INTEGER NOT NULL DEFAULT 0,
  "lastWeekQuestions" INTEGER NOT NULL DEFAULT 0,
  "lastWeekStreak" INTEGER NOT NULL DEFAULT 0,
  "rankChange" INTEGER,
  "metadata" JSONB,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_stats_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 4. Add indexes for UserStats
CREATE INDEX IF NOT EXISTS "user_stats_userId_idx" ON "user_stats"("userId");
CREATE INDEX IF NOT EXISTS "user_stats_currentRank_idx" ON "user_stats"("currentRank");

-- 5. Add composite indexes for optimization
CREATE INDEX IF NOT EXISTS "user_reflections_userId_createdAt_desc_idx" ON "user_reflections"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "user_quests_userId_isCompleted_isClaimed_idx" ON "user_quests"("userId", "isCompleted", "isClaimed");

-- 6. Drop old separate indexes if they exist (replaced by composite)
-- Note: UserBadge already has composite index (userId, isClaimed), Transaction already has (userId, createdAt DESC)
-- UserLoreEntry already has (userId, createdAt DESC)

-- 7. Create materialized view for leaderboard (optional - refresh daily via cron)
CREATE MATERIALIZED VIEW IF NOT EXISTS "leaderboard_view" AS
  SELECT 
    u."id",
    u."email",
    u."name",
    u."xp",
    u."level",
    u."streakCount",
    u."avatarUrl",
    u."image",
    u."karmaScore",
    u."seasonXP",
    u."seasonLevel",
    ROW_NUMBER() OVER (ORDER BY u."xp" DESC, u."streakCount" DESC, u."level" DESC) as "rank"
  FROM "users" u
  WHERE u."xp" > 0
  ORDER BY u."xp" DESC, u."streakCount" DESC, u."level" DESC;

CREATE INDEX IF NOT EXISTS "leaderboard_view_rank_idx" ON "leaderboard_view"("rank");
CREATE INDEX IF NOT EXISTS "leaderboard_view_xp_idx" ON "leaderboard_view"("xp" DESC);

-- 8. Migration complete
-- Note: Refresh materialized view daily: REFRESH MATERIALIZED VIEW "leaderboard_view";
-- Data migration from UserWeeklyStats to UserStats should be done via application code

