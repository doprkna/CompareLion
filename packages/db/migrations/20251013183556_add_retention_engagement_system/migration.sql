-- CreateTable
CREATE TABLE "user_streaks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" TIMESTAMP(3),
    "lastQuizAt" TIMESTAMP(3),
    "lastDuelAt" TIMESTAMP(3),
    "lastChallengeAt" TIMESTAMP(3),
    "loginStreak" INTEGER NOT NULL DEFAULT 0,
    "quizStreak" INTEGER NOT NULL DEFAULT 0,
    "duelStreak" INTEGER NOT NULL DEFAULT 0,
    "totalDaysActive" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_calendars" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "calendarType" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "rewardType" TEXT NOT NULL,
    "rewardAmount" INTEGER,
    "rewardItemId" TEXT,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" TIMESTAMP(3),
    "cycleStart" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_bonuses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inactiveDays" INTEGER NOT NULL,
    "xpBonus" INTEGER NOT NULL DEFAULT 0,
    "goldBonus" INTEGER NOT NULL DEFAULT 0,
    "diamondBonus" INTEGER NOT NULL DEFAULT 0,
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "grantedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "return_bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_moods" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "context" TEXT,
    "sessionId" TEXT,
    "comment" TEXT,
    "sentiment" DOUBLE PRECISION,
    "analyzed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_moods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_summaries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "challengesSent" INTEGER NOT NULL DEFAULT 0,
    "challengesReceived" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "sessionCount" INTEGER NOT NULL DEFAULT 0,
    "totalSessionTime" INTEGER NOT NULL DEFAULT 0,
    "averageMood" DOUBLE PRECISION,
    "viewed" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_streaks_userId_key" ON "user_streaks"("userId");

-- CreateIndex
CREATE INDEX "user_streaks_userId_idx" ON "user_streaks"("userId");

-- CreateIndex
CREATE INDEX "reward_calendars_userId_claimed_idx" ON "reward_calendars"("userId", "claimed");

-- CreateIndex
CREATE INDEX "reward_calendars_cycleStart_idx" ON "reward_calendars"("cycleStart");

-- CreateIndex
CREATE UNIQUE INDEX "reward_calendars_userId_calendarType_day_cycleStart_key" ON "reward_calendars"("userId", "calendarType", "day", "cycleStart");

-- CreateIndex
CREATE INDEX "return_bonuses_userId_granted_idx" ON "return_bonuses"("userId", "granted");

-- CreateIndex
CREATE INDEX "return_bonuses_expiresAt_idx" ON "return_bonuses"("expiresAt");

-- CreateIndex
CREATE INDEX "feedback_moods_userId_createdAt_idx" ON "feedback_moods"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "feedback_moods_context_idx" ON "feedback_moods"("context");

-- CreateIndex
CREATE INDEX "daily_summaries_userId_date_idx" ON "daily_summaries"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_summaries_userId_date_key" ON "daily_summaries"("userId", "date");

-- AddForeignKey
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_calendars" ADD CONSTRAINT "reward_calendars_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_bonuses" ADD CONSTRAINT "return_bonuses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_moods" ADD CONSTRAINT "feedback_moods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_summaries" ADD CONSTRAINT "daily_summaries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
