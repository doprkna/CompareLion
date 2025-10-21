-- CreateTable
CREATE TABLE "mini_events" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '🎯',
    "eventType" TEXT NOT NULL,
    "goalType" TEXT NOT NULL,
    "targetCount" INTEGER NOT NULL,
    "currentProgress" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "rewards" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "participantCount" INTEGER NOT NULL DEFAULT 0,
    "isSuccessful" BOOLEAN,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mini_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mini_event_progress" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contribution" INTEGER NOT NULL DEFAULT 0,
    "lastUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rewardsClaimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" TIMESTAMP(3),

    CONSTRAINT "mini_event_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mini_event_rewards" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardType" TEXT NOT NULL,
    "rewardId" TEXT,
    "amount" INTEGER,
    "description" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mini_event_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mini_events_eventId_key" ON "mini_events"("eventId");

-- CreateIndex
CREATE INDEX "mini_events_status_startTime_endTime_idx" ON "mini_events"("status", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "mini_events_eventType_status_idx" ON "mini_events"("eventType", "status");

-- CreateIndex
CREATE INDEX "mini_event_progress_eventId_contribution_idx" ON "mini_event_progress"("eventId", "contribution");

-- CreateIndex
CREATE INDEX "mini_event_progress_userId_idx" ON "mini_event_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "mini_event_progress_eventId_userId_key" ON "mini_event_progress"("eventId", "userId");

-- CreateIndex
CREATE INDEX "mini_event_rewards_eventId_userId_idx" ON "mini_event_rewards"("eventId", "userId");

-- CreateIndex
CREATE INDEX "mini_event_rewards_userId_awardedAt_idx" ON "mini_event_rewards"("userId", "awardedAt");

-- AddForeignKey
ALTER TABLE "mini_event_progress" ADD CONSTRAINT "mini_event_progress_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "mini_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mini_event_progress" ADD CONSTRAINT "mini_event_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
