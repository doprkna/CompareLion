-- CreateTable
CREATE TABLE "totem_battles" (
    "id" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "groupAId" TEXT NOT NULL,
    "groupBId" TEXT NOT NULL,
    "phase" TEXT NOT NULL DEFAULT 'preparation',
    "scoreA" INTEGER NOT NULL DEFAULT 0,
    "scoreB" INTEGER NOT NULL DEFAULT 0,
    "winnerId" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "rewardEmblem" TEXT,
    "rewardXp" INTEGER NOT NULL DEFAULT 500,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "totem_battles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "totem_battle_results" (
    "id" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "finalScore" INTEGER NOT NULL,
    "memberCount" INTEGER NOT NULL,
    "avgLevel" DOUBLE PRECISION NOT NULL,
    "xpGained" INTEGER NOT NULL,
    "challengesCompleted" INTEGER NOT NULL,
    "ranking" INTEGER NOT NULL,
    "rewardsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "totem_battle_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "totem_battles_phase_startAt_idx" ON "totem_battles"("phase", "startAt");

-- CreateIndex
CREATE UNIQUE INDEX "totem_battles_weekNumber_year_groupAId_groupBId_key" ON "totem_battles"("weekNumber", "year", "groupAId", "groupBId");

-- CreateIndex
CREATE INDEX "totem_battle_results_battleId_idx" ON "totem_battle_results"("battleId");

-- AddForeignKey
ALTER TABLE "totem_battle_results" ADD CONSTRAINT "totem_battle_results_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "totem_battles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
