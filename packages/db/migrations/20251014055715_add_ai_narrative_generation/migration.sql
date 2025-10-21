-- CreateTable
CREATE TABLE "narrative_quests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "context" JSONB,
    "generatedBy" TEXT NOT NULL DEFAULT 'ai',
    "aiModel" TEXT,
    "prompt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "narrative_quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "narrative_choices" (
    "id" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "step" INTEGER NOT NULL DEFAULT 1,
    "prompt" TEXT NOT NULL,
    "option1" TEXT NOT NULL,
    "option2" TEXT NOT NULL,
    "option3" TEXT,
    "option1Effect" JSONB,
    "option2Effect" JSONB,
    "option3Effect" JSONB,
    "selectedOption" INTEGER,
    "selectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "narrative_choices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "narrative_outcomes" (
    "id" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "conclusion" TEXT NOT NULL,
    "karmaChange" INTEGER NOT NULL DEFAULT 0,
    "prestigeChange" INTEGER NOT NULL DEFAULT 0,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "goldReward" INTEGER NOT NULL DEFAULT 0,
    "archetypeShift" JSONB,
    "itemsGranted" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "narrative_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "narrative_quests_userId_status_idx" ON "narrative_quests"("userId", "status");

-- CreateIndex
CREATE INDEX "narrative_quests_status_idx" ON "narrative_quests"("status");

-- CreateIndex
CREATE INDEX "narrative_choices_questId_step_idx" ON "narrative_choices"("questId", "step");

-- CreateIndex
CREATE INDEX "narrative_outcomes_questId_idx" ON "narrative_outcomes"("questId");

-- AddForeignKey
ALTER TABLE "narrative_quests" ADD CONSTRAINT "narrative_quests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "narrative_choices" ADD CONSTRAINT "narrative_choices_questId_fkey" FOREIGN KEY ("questId") REFERENCES "narrative_quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "narrative_outcomes" ADD CONSTRAINT "narrative_outcomes_questId_fkey" FOREIGN KEY ("questId") REFERENCES "narrative_quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
