-- CreateTable
CREATE TABLE "clans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "description" TEXT,
    "emblem" TEXT NOT NULL DEFAULT '🏰',
    "color" TEXT NOT NULL DEFAULT '#8b5cf6',
    "leaderId" TEXT NOT NULL,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "weeklyXp" INTEGER NOT NULL DEFAULT 0,
    "clanGold" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "maxMembers" INTEGER NOT NULL DEFAULT 50,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "lastXpReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalChestsEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clan_members" (
    "id" TEXT NOT NULL,
    "clanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "xpContributed" INTEGER NOT NULL DEFAULT 0,
    "weeklyXpContributed" INTEGER NOT NULL DEFAULT 0,
    "goldContributed" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clan_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clan_upgrades" (
    "id" TEXT NOT NULL,
    "clanId" TEXT NOT NULL,
    "upgradeType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "maxLevel" INTEGER NOT NULL DEFAULT 5,
    "boostAmount" DOUBLE PRECISION,
    "duration" INTEGER,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "clan_upgrades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clan_activities" (
    "id" TEXT NOT NULL,
    "clanId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "userId" TEXT,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clan_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clans_name_key" ON "clans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "clans_tag_key" ON "clans"("tag");

-- CreateIndex
CREATE INDEX "clans_totalXp_weeklyXp_idx" ON "clans"("totalXp", "weeklyXp");

-- CreateIndex
CREATE INDEX "clans_isPublic_requireApproval_idx" ON "clans"("isPublic", "requireApproval");

-- CreateIndex
CREATE UNIQUE INDEX "clan_members_userId_key" ON "clan_members"("userId");

-- CreateIndex
CREATE INDEX "clan_members_clanId_role_idx" ON "clan_members"("clanId", "role");

-- CreateIndex
CREATE INDEX "clan_members_userId_idx" ON "clan_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "clan_members_clanId_userId_key" ON "clan_members"("clanId", "userId");

-- CreateIndex
CREATE INDEX "clan_upgrades_clanId_idx" ON "clan_upgrades"("clanId");

-- CreateIndex
CREATE UNIQUE INDEX "clan_upgrades_clanId_upgradeType_key" ON "clan_upgrades"("clanId", "upgradeType");

-- CreateIndex
CREATE INDEX "clan_activities_clanId_createdAt_idx" ON "clan_activities"("clanId", "createdAt");

-- AddForeignKey
ALTER TABLE "clan_members" ADD CONSTRAINT "clan_members_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "clans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_members" ADD CONSTRAINT "clan_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_upgrades" ADD CONSTRAINT "clan_upgrades_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "clans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_activities" ADD CONSTRAINT "clan_activities_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "clans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
