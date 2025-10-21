-- CreateTable
CREATE TABLE "creator_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "avatar" TEXT,
    "bannerImage" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "badge" TEXT NOT NULL DEFAULT '🎨',
    "tier" TEXT NOT NULL DEFAULT 'basic',
    "totalFlows" INTEGER NOT NULL DEFAULT 0,
    "totalEngagement" INTEGER NOT NULL DEFAULT 0,
    "totalEarnings" INTEGER NOT NULL DEFAULT 0,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "revenueShare" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "goldPerPlay" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "allowComments" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_flows" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "questions" JSONB NOT NULL,
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "completionCount" INTEGER NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "goldReward" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_flows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_followers" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "followedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creator_followers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_rewards" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "flowId" TEXT,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creator_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "creator_profiles_userId_key" ON "creator_profiles"("userId");

-- CreateIndex
CREATE INDEX "creator_profiles_isVerified_isActive_idx" ON "creator_profiles"("isVerified", "isActive");

-- CreateIndex
CREATE INDEX "creator_profiles_totalEngagement_followerCount_idx" ON "creator_profiles"("totalEngagement", "followerCount");

-- CreateIndex
CREATE INDEX "creator_flows_creatorId_status_idx" ON "creator_flows"("creatorId", "status");

-- CreateIndex
CREATE INDEX "creator_flows_status_publishedAt_idx" ON "creator_flows"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "creator_flows_category_difficulty_idx" ON "creator_flows"("category", "difficulty");

-- CreateIndex
CREATE INDEX "creator_flows_isFeatured_playCount_idx" ON "creator_flows"("isFeatured", "playCount");

-- CreateIndex
CREATE INDEX "creator_followers_creatorId_idx" ON "creator_followers"("creatorId");

-- CreateIndex
CREATE INDEX "creator_followers_userId_idx" ON "creator_followers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "creator_followers_creatorId_userId_key" ON "creator_followers"("creatorId", "userId");

-- CreateIndex
CREATE INDEX "creator_rewards_creatorId_earnedAt_idx" ON "creator_rewards"("creatorId", "earnedAt");

-- AddForeignKey
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_flows" ADD CONSTRAINT "creator_flows_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "creator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_followers" ADD CONSTRAINT "creator_followers_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "creator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_followers" ADD CONSTRAINT "creator_followers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_rewards" ADD CONSTRAINT "creator_rewards_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "creator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
