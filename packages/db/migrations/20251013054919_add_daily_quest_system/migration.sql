-- CreateTable
CREATE TABLE "daily_quests" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "targetCount" INTEGER NOT NULL DEFAULT 1,
    "rewardXp" INTEGER NOT NULL DEFAULT 50,
    "rewardGold" INTEGER NOT NULL DEFAULT 25,
    "rewardItem" TEXT,
    "dropChance" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_completions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "itemDropped" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quest_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_quests_date_expiresAt_idx" ON "daily_quests"("date", "expiresAt");

-- CreateIndex
CREATE INDEX "quest_completions_userId_completed_idx" ON "quest_completions"("userId", "completed");

-- CreateIndex
CREATE UNIQUE INDEX "quest_completions_userId_questId_key" ON "quest_completions"("userId", "questId");

-- AddForeignKey
ALTER TABLE "quest_completions" ADD CONSTRAINT "quest_completions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_completions" ADD CONSTRAINT "quest_completions_questId_fkey" FOREIGN KEY ("questId") REFERENCES "daily_quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
