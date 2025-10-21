-- CreateTable
CREATE TABLE "world_states" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hope" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "chaos" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "creativity" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "knowledge" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "harmony" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "overallAlignment" TEXT NOT NULL DEFAULT 'balanced',
    "dominantForce" TEXT,
    "totalPlayers" INTEGER NOT NULL DEFAULT 0,
    "activeEvents" INTEGER NOT NULL DEFAULT 0,
    "dayNumber" INTEGER NOT NULL DEFAULT 1,
    "hopeChange" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "chaosChange" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "creativityChange" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "knowledgeChange" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "harmonyChange" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "world_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "world_variables" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "variableName" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "category" TEXT,

    CONSTRAINT "world_variables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "world_events" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "loreText" TEXT,
    "triggerType" TEXT NOT NULL,
    "triggerConditions" JSONB NOT NULL,
    "variableImpacts" JSONB NOT NULL,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "participantCount" INTEGER NOT NULL DEFAULT 0,
    "requiredActions" INTEGER,
    "currentProgress" INTEGER NOT NULL DEFAULT 0,
    "rewards" JSONB,
    "isPostedToFeed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "world_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "world_contributions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hopePoints" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "chaosPoints" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "creativityPoints" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "knowledgePoints" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "harmonyPoints" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "fromAnswers" INTEGER NOT NULL DEFAULT 0,
    "fromChallenges" INTEGER NOT NULL DEFAULT 0,
    "fromFlows" INTEGER NOT NULL DEFAULT 0,
    "fromSocialActions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "world_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "world_states_timestamp_key" ON "world_states"("timestamp");

-- CreateIndex
CREATE INDEX "world_states_timestamp_idx" ON "world_states"("timestamp");

-- CreateIndex
CREATE INDEX "world_variables_stateId_idx" ON "world_variables"("stateId");

-- CreateIndex
CREATE UNIQUE INDEX "world_variables_stateId_variableName_key" ON "world_variables"("stateId", "variableName");

-- CreateIndex
CREATE UNIQUE INDEX "world_events_eventId_key" ON "world_events"("eventId");

-- CreateIndex
CREATE INDEX "world_events_status_triggeredAt_idx" ON "world_events"("status", "triggeredAt");

-- CreateIndex
CREATE INDEX "world_events_triggerType_idx" ON "world_events"("triggerType");

-- CreateIndex
CREATE INDEX "world_contributions_userId_idx" ON "world_contributions"("userId");

-- CreateIndex
CREATE INDEX "world_contributions_date_idx" ON "world_contributions"("date");

-- CreateIndex
CREATE UNIQUE INDEX "world_contributions_userId_date_key" ON "world_contributions"("userId", "date");

-- AddForeignKey
ALTER TABLE "world_variables" ADD CONSTRAINT "world_variables_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "world_states"("id") ON DELETE CASCADE ON UPDATE CASCADE;
