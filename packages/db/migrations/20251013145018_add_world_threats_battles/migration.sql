-- CreateTable
CREATE TABLE "world_threats" (
    "id" TEXT NOT NULL,
    "threatId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "loreText" TEXT,
    "avatar" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "maxHealth" INTEGER NOT NULL,
    "currentHealth" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "threatLevel" INTEGER NOT NULL,
    "spawnedBy" TEXT NOT NULL,
    "triggerMetrics" JSONB,
    "region" TEXT,
    "controlledBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "totalDamage" INTEGER NOT NULL DEFAULT 0,
    "attackCount" INTEGER NOT NULL DEFAULT 0,
    "participantCount" INTEGER NOT NULL DEFAULT 0,
    "xpReward" INTEGER NOT NULL,
    "goldReward" INTEGER NOT NULL,
    "specialReward" JSONB,
    "spawnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "defeatedAt" TIMESTAMP(3),
    "isPostedToFeed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "world_threats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "threat_battles" (
    "id" TEXT NOT NULL,
    "threatId" TEXT NOT NULL,
    "userId" TEXT,
    "factionId" TEXT,
    "attackType" TEXT NOT NULL,
    "damageDealt" INTEGER NOT NULL,
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "attackerLevel" INTEGER NOT NULL,
    "attackerPrestige" INTEGER NOT NULL,
    "randomFactor" DOUBLE PRECISION NOT NULL,
    "xpGained" INTEGER NOT NULL DEFAULT 0,
    "goldGained" INTEGER NOT NULL DEFAULT 0,
    "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,
    "attackedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "threat_battles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faction_territories" (
    "id" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "region" TEXT NOT NULL,
    "mapPosition" JSONB,
    "controlledBy" TEXT,
    "controlStrength" INTEGER NOT NULL DEFAULT 0,
    "xpBonus" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "goldBonus" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "resourceType" TEXT,
    "isContested" BOOLEAN NOT NULL DEFAULT false,
    "contestStarted" TIMESTAMP(3),
    "lastCaptured" TIMESTAMP(3),
    "captureCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "faction_territories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "territory_contests" (
    "id" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,
    "attackerFaction" TEXT NOT NULL,
    "defenderFaction" TEXT,
    "attackerScore" INTEGER NOT NULL DEFAULT 0,
    "defenderScore" INTEGER NOT NULL DEFAULT 0,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "winnerId" TEXT,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "territory_contests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "world_threats_threatId_key" ON "world_threats"("threatId");

-- CreateIndex
CREATE INDEX "world_threats_status_spawnedAt_idx" ON "world_threats"("status", "spawnedAt");

-- CreateIndex
CREATE INDEX "world_threats_difficulty_status_idx" ON "world_threats"("difficulty", "status");

-- CreateIndex
CREATE INDEX "threat_battles_threatId_attackedAt_idx" ON "threat_battles"("threatId", "attackedAt");

-- CreateIndex
CREATE INDEX "threat_battles_userId_idx" ON "threat_battles"("userId");

-- CreateIndex
CREATE INDEX "threat_battles_factionId_idx" ON "threat_battles"("factionId");

-- CreateIndex
CREATE UNIQUE INDEX "faction_territories_territoryId_key" ON "faction_territories"("territoryId");

-- CreateIndex
CREATE INDEX "faction_territories_region_controlledBy_idx" ON "faction_territories"("region", "controlledBy");

-- CreateIndex
CREATE INDEX "faction_territories_isContested_idx" ON "faction_territories"("isContested");

-- CreateIndex
CREATE INDEX "territory_contests_territoryId_status_idx" ON "territory_contests"("territoryId", "status");

-- AddForeignKey
ALTER TABLE "threat_battles" ADD CONSTRAINT "threat_battles_threatId_fkey" FOREIGN KEY ("threatId") REFERENCES "world_threats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "threat_battles" ADD CONSTRAINT "threat_battles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
