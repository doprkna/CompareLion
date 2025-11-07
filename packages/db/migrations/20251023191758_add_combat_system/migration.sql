-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('QUESTION', 'PACK', 'EVENT');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('CHALLENGE', 'THEMED_WEEK', 'SPOTLIGHT', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'ACTIVE', 'UPCOMING', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- CreateEnum
CREATE TYPE "SeasonStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'ENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CosmeticType" AS ENUM ('ICON', 'TITLE', 'BACKGROUND', 'BADGE', 'FRAME');

-- CreateEnum
CREATE TYPE "CosmeticRarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "SeasonalEventStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "ReflectionType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'MILESTONE');

-- AlterTable
ALTER TABLE "event_logs" ADD COLUMN     "eventData" JSONB,
ADD COLUMN     "eventType" TEXT,
ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "telemetry_events" ADD COLUMN     "anonymousId" TEXT,
ADD COLUMN     "deviceType" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "ageGroup" TEXT,
ADD COLUMN     "coins" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "combatBattles" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "combatHighestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "combatKills" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "equippedBackground" TEXT,
ADD COLUMN     "equippedIcon" TEXT,
ADD COLUMN     "equippedTitle" TEXT,
ADD COLUMN     "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "seasonalXP" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tone" TEXT;

-- CreateTable
CREATE TABLE "question_generations" (
    "id" TEXT NOT NULL,
    "ssscId" TEXT NOT NULL,
    "targetCount" INTEGER NOT NULL DEFAULT 10,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "prompt" TEXT,
    "insertedCount" INTEGER NOT NULL DEFAULT 0,
    "rawResponse" TEXT,
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "refCode" TEXT,
    "source" TEXT NOT NULL DEFAULT 'landing',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_campaigns" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "link" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sentAt" TIMESTAMP(3),
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "openedCount" INTEGER NOT NULL DEFAULT 0,
    "clickedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_logs" (
    "id" TEXT NOT NULL,
    "errorType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "page" TEXT,
    "userAgent" TEXT,
    "userId" TEXT,
    "sessionId" TEXT,
    "buildId" TEXT,
    "environment" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'error',
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'new',
    "assignedTo" TEXT,
    "metadata" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SubmissionType" NOT NULL DEFAULT 'QUESTION',
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "languageId" TEXT,
    "tags" TEXT[],
    "imageUrl" TEXT,
    "metadata" JSONB,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "moderatorId" TEXT,
    "moderatorNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "EventType" NOT NULL DEFAULT 'CHALLENGE',
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "rewardXP" INTEGER NOT NULL DEFAULT 0,
    "rewardDiamonds" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "metadata" JSONB,
    "participants" INTEGER NOT NULL DEFAULT 0,
    "creatorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "submissionId" TEXT NOT NULL,
    "voteType" "VoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "SeasonStatus" NOT NULL DEFAULT 'UPCOMING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "season_archives" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "finalXP" INTEGER NOT NULL DEFAULT 0,
    "finalCoins" INTEGER NOT NULL DEFAULT 0,
    "finalRank" INTEGER,
    "finalKarma" INTEGER NOT NULL DEFAULT 0,
    "achievements" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "season_archives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cosmetic_items" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CosmeticType" NOT NULL,
    "rarity" "CosmeticRarity" NOT NULL DEFAULT 'COMMON',
    "price" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "metadata" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "seasonOnly" BOOLEAN NOT NULL DEFAULT false,
    "seasonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cosmetic_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_cosmetics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cosmeticId" TEXT NOT NULL,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_cosmetics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasonal_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "bonusType" TEXT NOT NULL,
    "bonusValue" INTEGER NOT NULL DEFAULT 0,
    "status" "SeasonalEventStatus" NOT NULL DEFAULT 'INACTIVE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seasonal_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_reflections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "ReflectionType" NOT NULL DEFAULT 'DAILY',
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "sentiment" TEXT DEFAULT 'neutral',
    "stats" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_reflections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_weekly_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "xpGain" INTEGER NOT NULL DEFAULT 0,
    "coinsGain" INTEGER NOT NULL DEFAULT 0,
    "karmaGain" INTEGER NOT NULL DEFAULT 0,
    "questionsCount" INTEGER NOT NULL DEFAULT 0,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "rankChange" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_weekly_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combat_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "heroHp" INTEGER NOT NULL DEFAULT 100,
    "heroMaxHp" INTEGER NOT NULL DEFAULT 100,
    "enemyHp" INTEGER NOT NULL DEFAULT 100,
    "enemyMaxHp" INTEGER NOT NULL DEFAULT 100,
    "enemyName" TEXT NOT NULL DEFAULT 'Shadow',
    "enemyType" TEXT NOT NULL DEFAULT 'shadow',
    "xpGained" INTEGER NOT NULL DEFAULT 0,
    "goldGained" INTEGER NOT NULL DEFAULT 0,
    "kills" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastActionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "combat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "question_generations_ssscId_idx" ON "question_generations"("ssscId");

-- CreateIndex
CREATE INDEX "question_generations_status_idx" ON "question_generations"("status");

-- CreateIndex
CREATE INDEX "question_generations_createdAt_idx" ON "question_generations"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_email_key" ON "waitlist"("email");

-- CreateIndex
CREATE INDEX "waitlist_status_idx" ON "waitlist"("status");

-- CreateIndex
CREATE INDEX "waitlist_createdAt_idx" ON "waitlist"("createdAt");

-- CreateIndex
CREATE INDEX "marketing_campaigns_status_idx" ON "marketing_campaigns"("status");

-- CreateIndex
CREATE INDEX "marketing_campaigns_createdAt_idx" ON "marketing_campaigns"("createdAt");

-- CreateIndex
CREATE INDEX "error_logs_errorType_status_idx" ON "error_logs"("errorType", "status");

-- CreateIndex
CREATE INDEX "error_logs_severity_resolved_idx" ON "error_logs"("severity", "resolved");

-- CreateIndex
CREATE INDEX "error_logs_createdAt_idx" ON "error_logs"("createdAt");

-- CreateIndex
CREATE INDEX "error_logs_frequency_idx" ON "error_logs"("frequency");

-- CreateIndex
CREATE INDEX "user_submissions_userId_idx" ON "user_submissions"("userId");

-- CreateIndex
CREATE INDEX "user_submissions_status_idx" ON "user_submissions"("status");

-- CreateIndex
CREATE INDEX "user_submissions_categoryId_idx" ON "user_submissions"("categoryId");

-- CreateIndex
CREATE INDEX "user_submissions_createdAt_idx" ON "user_submissions"("createdAt");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "events_startDate_idx" ON "events"("startDate");

-- CreateIndex
CREATE INDEX "events_endDate_idx" ON "events"("endDate");

-- CreateIndex
CREATE INDEX "votes_submissionId_idx" ON "votes"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "votes_userId_submissionId_key" ON "votes"("userId", "submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "votes_sessionId_submissionId_key" ON "votes"("sessionId", "submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "seasons_number_key" ON "seasons"("number");

-- CreateIndex
CREATE INDEX "seasons_status_idx" ON "seasons"("status");

-- CreateIndex
CREATE INDEX "seasons_startDate_idx" ON "seasons"("startDate");

-- CreateIndex
CREATE INDEX "seasons_endDate_idx" ON "seasons"("endDate");

-- CreateIndex
CREATE INDEX "season_archives_seasonId_idx" ON "season_archives"("seasonId");

-- CreateIndex
CREATE INDEX "season_archives_userId_idx" ON "season_archives"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "season_archives_userId_seasonId_key" ON "season_archives"("userId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "cosmetic_items_slug_key" ON "cosmetic_items"("slug");

-- CreateIndex
CREATE INDEX "cosmetic_items_type_idx" ON "cosmetic_items"("type");

-- CreateIndex
CREATE INDEX "cosmetic_items_active_idx" ON "cosmetic_items"("active");

-- CreateIndex
CREATE INDEX "user_cosmetics_userId_idx" ON "user_cosmetics"("userId");

-- CreateIndex
CREATE INDEX "user_cosmetics_equipped_idx" ON "user_cosmetics"("equipped");

-- CreateIndex
CREATE UNIQUE INDEX "user_cosmetics_userId_cosmeticId_key" ON "user_cosmetics"("userId", "cosmeticId");

-- CreateIndex
CREATE INDEX "seasonal_events_status_idx" ON "seasonal_events"("status");

-- CreateIndex
CREATE INDEX "seasonal_events_startDate_idx" ON "seasonal_events"("startDate");

-- CreateIndex
CREATE INDEX "user_reflections_userId_idx" ON "user_reflections"("userId");

-- CreateIndex
CREATE INDEX "user_reflections_date_idx" ON "user_reflections"("date");

-- CreateIndex
CREATE INDEX "user_reflections_type_idx" ON "user_reflections"("type");

-- CreateIndex
CREATE INDEX "user_weekly_stats_userId_idx" ON "user_weekly_stats"("userId");

-- CreateIndex
CREATE INDEX "user_weekly_stats_weekStart_idx" ON "user_weekly_stats"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "user_weekly_stats_userId_weekStart_key" ON "user_weekly_stats"("userId", "weekStart");

-- CreateIndex
CREATE INDEX "combat_sessions_userId_isActive_idx" ON "combat_sessions"("userId", "isActive");

-- CreateIndex
CREATE INDEX "combat_sessions_lastActionAt_idx" ON "combat_sessions"("lastActionAt");

-- CreateIndex
CREATE INDEX "telemetry_events_userId_idx" ON "telemetry_events"("userId");

-- AddForeignKey
ALTER TABLE "question_generations" ADD CONSTRAINT "question_generations_ssscId_fkey" FOREIGN KEY ("ssscId") REFERENCES "SssCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_submissions" ADD CONSTRAINT "user_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_submissions" ADD CONSTRAINT "user_submissions_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_submissions" ADD CONSTRAINT "user_submissions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_submissions" ADD CONSTRAINT "user_submissions_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "user_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_archives" ADD CONSTRAINT "season_archives_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_archives" ADD CONSTRAINT "season_archives_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_cosmetics" ADD CONSTRAINT "user_cosmetics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_cosmetics" ADD CONSTRAINT "user_cosmetics_cosmeticId_fkey" FOREIGN KEY ("cosmeticId") REFERENCES "cosmetic_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reflections" ADD CONSTRAINT "user_reflections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_weekly_stats" ADD CONSTRAINT "user_weekly_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combat_sessions" ADD CONSTRAINT "combat_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
