-- CreateTable
CREATE TABLE "achievement_collections" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "theme" TEXT NOT NULL,
    "icon" TEXT,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "titleReward" TEXT,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "goldReward" INTEGER NOT NULL DEFAULT 0,
    "diamondReward" INTEGER NOT NULL DEFAULT 0,
    "auraUnlock" TEXT,
    "themeUnlock" TEXT,
    "isSeasonal" BOOLEAN NOT NULL DEFAULT false,
    "seasonType" TEXT,
    "isEvent" BOOLEAN NOT NULL DEFAULT false,
    "eventId" TEXT,
    "availableFrom" TIMESTAMP(3),
    "availableUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievement_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement_collection_members" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "achievement_collection_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievement_collections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "totalRequired" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" TIMESTAMP(3),

    CONSTRAINT "user_achievement_collections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "achievement_collections_collectionId_key" ON "achievement_collections"("collectionId");

-- CreateIndex
CREATE INDEX "achievement_collections_theme_rarity_idx" ON "achievement_collections"("theme", "rarity");

-- CreateIndex
CREATE INDEX "achievement_collections_isSeasonal_seasonType_idx" ON "achievement_collections"("isSeasonal", "seasonType");

-- CreateIndex
CREATE INDEX "achievement_collections_isEvent_eventId_idx" ON "achievement_collections"("isEvent", "eventId");

-- CreateIndex
CREATE INDEX "achievement_collections_isActive_availableFrom_availableUnt_idx" ON "achievement_collections"("isActive", "availableFrom", "availableUntil");

-- CreateIndex
CREATE INDEX "achievement_collection_members_collectionId_sortOrder_idx" ON "achievement_collection_members"("collectionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_collection_members_collectionId_achievementId_key" ON "achievement_collection_members"("collectionId", "achievementId");

-- CreateIndex
CREATE INDEX "user_achievement_collections_userId_isCompleted_idx" ON "user_achievement_collections"("userId", "isCompleted");

-- CreateIndex
CREATE INDEX "user_achievement_collections_collectionId_idx" ON "user_achievement_collections"("collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievement_collections_userId_collectionId_key" ON "user_achievement_collections"("userId", "collectionId");

-- AddForeignKey
ALTER TABLE "achievement_collection_members" ADD CONSTRAINT "achievement_collection_members_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "achievement_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_collection_members" ADD CONSTRAINT "achievement_collection_members_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievement_collections" ADD CONSTRAINT "user_achievement_collections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievement_collections" ADD CONSTRAINT "user_achievement_collections_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "achievement_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
