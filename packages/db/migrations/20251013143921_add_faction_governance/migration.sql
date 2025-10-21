-- CreateTable
CREATE TABLE "factions" (
    "id" TEXT NOT NULL,
    "factionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "secondaryColor" TEXT NOT NULL,
    "emblem" TEXT NOT NULL,
    "pattern" TEXT,
    "glowEffect" TEXT,
    "moralAxis" TEXT NOT NULL,
    "orderAxis" TEXT NOT NULL,
    "philosophy" TEXT NOT NULL,
    "xpBonus" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "goldBonus" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "karmaMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "specialAbility" TEXT,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "avgKarma" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "avgPrestige" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "hasCouncil" BOOLEAN NOT NULL DEFAULT false,
    "councilSize" INTEGER NOT NULL DEFAULT 5,
    "votingPower" TEXT NOT NULL DEFAULT 'karma_based',
    "lore" TEXT,
    "motto" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faction_members" (
    "id" TEXT NOT NULL,
    "factionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "rank" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT,
    "xpContributed" INTEGER NOT NULL DEFAULT 0,
    "karmaContributed" INTEGER NOT NULL DEFAULT 0,
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "loyaltyScore" INTEGER NOT NULL DEFAULT 50,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canSwitchAt" TIMESTAMP(3),
    "switchCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "faction_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faction_change_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromFactionId" TEXT,
    "toFactionId" TEXT,
    "changeType" TEXT NOT NULL,
    "reason" TEXT,
    "penaltyType" TEXT,
    "penaltyAmount" INTEGER,
    "questCompleted" BOOLEAN,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faction_change_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faction_votes" (
    "id" TEXT NOT NULL,
    "factionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voteType" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "vote" TEXT NOT NULL,
    "votingPower" INTEGER NOT NULL,
    "comment" TEXT,
    "votedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faction_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faction_proposals" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "factionId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "proposalType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "votesFor" INTEGER NOT NULL DEFAULT 0,
    "votesAgainst" INTEGER NOT NULL DEFAULT 0,
    "votesAbstain" INTEGER NOT NULL DEFAULT 0,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3) NOT NULL,
    "result" TEXT,
    "executedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faction_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "factions_factionId_key" ON "factions"("factionId");

-- CreateIndex
CREATE INDEX "factions_isActive_memberCount_idx" ON "factions"("isActive", "memberCount");

-- CreateIndex
CREATE UNIQUE INDEX "faction_members_userId_key" ON "faction_members"("userId");

-- CreateIndex
CREATE INDEX "faction_members_factionId_role_idx" ON "faction_members"("factionId", "role");

-- CreateIndex
CREATE INDEX "faction_members_userId_idx" ON "faction_members"("userId");

-- CreateIndex
CREATE INDEX "faction_change_logs_userId_changedAt_idx" ON "faction_change_logs"("userId", "changedAt");

-- CreateIndex
CREATE INDEX "faction_votes_factionId_voteType_idx" ON "faction_votes"("factionId", "voteType");

-- CreateIndex
CREATE UNIQUE INDEX "faction_votes_proposalId_userId_key" ON "faction_votes"("proposalId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "faction_proposals_proposalId_key" ON "faction_proposals"("proposalId");

-- CreateIndex
CREATE INDEX "faction_proposals_factionId_status_idx" ON "faction_proposals"("factionId", "status");

-- CreateIndex
CREATE INDEX "faction_proposals_status_endTime_idx" ON "faction_proposals"("status", "endTime");

-- AddForeignKey
ALTER TABLE "faction_members" ADD CONSTRAINT "faction_members_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "factions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faction_members" ADD CONSTRAINT "faction_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faction_change_logs" ADD CONSTRAINT "faction_change_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faction_votes" ADD CONSTRAINT "faction_votes_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "factions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faction_votes" ADD CONSTRAINT "faction_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
