-- CreateTable
CREATE TABLE "mentor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mentorName" TEXT NOT NULL DEFAULT 'Sage',
    "mentorAvatar" TEXT NOT NULL DEFAULT '🧙',
    "mentorTone" TEXT NOT NULL DEFAULT 'supportive',
    "preferredTopics" TEXT[],
    "communicationStyle" TEXT NOT NULL DEFAULT 'balanced',
    "reminderFrequency" TEXT NOT NULL DEFAULT 'weekly',
    "lastAnalyzedAt" TIMESTAMP(3),
    "currentFocus" TEXT,
    "growthAreas" TEXT[],
    "strengths" TEXT[],
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "journalingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reflectionPrompts" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "logType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT,
    "timeframe" TEXT,
    "metrics" JSONB,
    "suggestions" TEXT[],
    "flowLinks" TEXT[],
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "userRating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentor_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insight_prompts" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "subtext" TEXT,
    "icon" TEXT NOT NULL DEFAULT '💭',
    "archetypes" TEXT[],
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "karmaRange" JSONB,
    "expectedWordCount" INTEGER,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insight_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reflection_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptId" TEXT,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "mood" TEXT,
    "aiInsights" TEXT,
    "themes" TEXT[],
    "sentiment" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reflection_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mentor_profiles_userId_key" ON "mentor_profiles"("userId");

-- CreateIndex
CREATE INDEX "mentor_logs_userId_createdAt_idx" ON "mentor_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "mentor_logs_logType_createdAt_idx" ON "mentor_logs"("logType", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "insight_prompts_promptId_key" ON "insight_prompts"("promptId");

-- CreateIndex
CREATE INDEX "insight_prompts_category_isActive_idx" ON "insight_prompts"("category", "isActive");

-- CreateIndex
CREATE INDEX "reflection_entries_userId_createdAt_idx" ON "reflection_entries"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "mentor_profiles" ADD CONSTRAINT "mentor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_logs" ADD CONSTRAINT "mentor_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reflection_entries" ADD CONSTRAINT "reflection_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
