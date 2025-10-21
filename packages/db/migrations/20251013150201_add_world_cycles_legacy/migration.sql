-- CreateTable
CREATE TABLE "world_cycles" (
    "id" TEXT NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "cycleName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "duration" INTEGER NOT NULL,
    "finalHope" DOUBLE PRECISION,
    "finalChaos" DOUBLE PRECISION,
    "finalCreativity" DOUBLE PRECISION,
    "finalKnowledge" DOUBLE PRECISION,
    "finalHarmony" DOUBLE PRECISION,
    "dominantForce" TEXT,
    "totalPlayers" INTEGER NOT NULL DEFAULT 0,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "threatsDefeated" INTEGER NOT NULL DEFAULT 0,
    "eventsCompleted" INTEGER NOT NULL DEFAULT 0,
    "topPlayerId" TEXT,
    "topFactionId" TEXT,
    "topClanId" TEXT,
    "unlockedFactions" TEXT[],
    "unlockedResources" TEXT[],
    "unlockedEnvironments" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "world_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legacy_records" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "finalLevel" INTEGER NOT NULL,
    "finalXp" INTEGER NOT NULL,
    "finalGold" INTEGER NOT NULL,
    "finalDiamonds" INTEGER NOT NULL,
    "finalPrestige" INTEGER NOT NULL,
    "finalKarma" INTEGER NOT NULL,
    "xpRank" INTEGER,
    "karmaRank" INTEGER,
    "prestigeRank" INTEGER,
    "achievements" TEXT[],
    "titles" TEXT[],
    "badges" TEXT[],
    "ascensionChoice" TEXT NOT NULL,
    "playTime" INTEGER NOT NULL,
    "majorEvents" JSONB,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legacy_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_legacy_bonuses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bonusType" TEXT NOT NULL,
    "prestigeCarry" INTEGER,
    "legacyTitle" TEXT,
    "xpBoostPercent" DOUBLE PRECISION,
    "mutation" TEXT,
    "artifactId" TEXT,
    "artifactType" TEXT,
    "earnedInCycle" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "user_legacy_bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abyss_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentLayer" INTEGER NOT NULL DEFAULT 0,
    "maxLayer" INTEGER NOT NULL DEFAULT 0,
    "totalClears" INTEGER NOT NULL DEFAULT 0,
    "layerMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "abyssTokens" INTEGER NOT NULL DEFAULT 0,
    "abyssArtifacts" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lastClear" TIMESTAMP(3),

    CONSTRAINT "abyss_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "world_cycles_cycleNumber_key" ON "world_cycles"("cycleNumber");

-- CreateIndex
CREATE INDEX "world_cycles_cycleNumber_status_idx" ON "world_cycles"("cycleNumber", "status");

-- CreateIndex
CREATE INDEX "legacy_records_userId_idx" ON "legacy_records"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "legacy_records_cycleId_userId_key" ON "legacy_records"("cycleId", "userId");

-- CreateIndex
CREATE INDEX "user_legacy_bonuses_userId_isActive_idx" ON "user_legacy_bonuses"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "abyss_progress_userId_key" ON "abyss_progress"("userId");

-- AddForeignKey
ALTER TABLE "legacy_records" ADD CONSTRAINT "legacy_records_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "world_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legacy_records" ADD CONSTRAINT "legacy_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_legacy_bonuses" ADD CONSTRAINT "user_legacy_bonuses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
