-- CreateTable
CREATE TABLE "weekly_challenges" (
    "id" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'global',
    "prompt" TEXT NOT NULL,
    "dareVariant" TEXT,
    "truthVariant" TEXT,
    "generationSource" TEXT NOT NULL DEFAULT 'ai',
    "trendingTopics" JSONB,
    "rewardXp" INTEGER NOT NULL DEFAULT 100,
    "rewardKarma" INTEGER NOT NULL DEFAULT 10,
    "participantCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_challenge_participations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "submitted" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "rewardXp" INTEGER NOT NULL DEFAULT 0,
    "rewardKarma" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "weekly_challenge_participations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "weekly_challenges_status_publishedAt_idx" ON "weekly_challenges"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_challenges_weekNumber_year_key" ON "weekly_challenges"("weekNumber", "year");

-- CreateIndex
CREATE INDEX "weekly_challenge_participations_challengeId_submitted_idx" ON "weekly_challenge_participations"("challengeId", "submitted");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_challenge_participations_userId_challengeId_key" ON "weekly_challenge_participations"("userId", "challengeId");

-- AddForeignKey
ALTER TABLE "weekly_challenge_participations" ADD CONSTRAINT "weekly_challenge_participations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_challenge_participations" ADD CONSTRAINT "weekly_challenge_participations_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "weekly_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
