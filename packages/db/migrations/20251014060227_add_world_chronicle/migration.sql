-- CreateTable
CREATE TABLE "world_chronicles" (
    "id" TEXT NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "seasonName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "fullChronicle" TEXT NOT NULL,
    "totalPlayers" INTEGER NOT NULL DEFAULT 0,
    "totalXpEarned" BIGINT NOT NULL DEFAULT 0,
    "totalChallenges" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "topFaction" TEXT,
    "topPlayer" TEXT,
    "topGroup" TEXT,
    "worldStateStart" JSONB,
    "worldStateEnd" JSONB,
    "generatedBy" TEXT NOT NULL DEFAULT 'ai',
    "generatedAt" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "world_chronicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "season_summaries" (
    "id" TEXT NOT NULL,
    "chronicleId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "highlights" JSONB,
    "stats" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "season_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_quotes" (
    "id" TEXT NOT NULL,
    "chronicleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "context" TEXT,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "world_chronicles_seasonNumber_key" ON "world_chronicles"("seasonNumber");

-- CreateIndex
CREATE INDEX "world_chronicles_seasonNumber_idx" ON "world_chronicles"("seasonNumber");

-- CreateIndex
CREATE INDEX "world_chronicles_isPublished_idx" ON "world_chronicles"("isPublished");

-- CreateIndex
CREATE INDEX "season_summaries_chronicleId_category_idx" ON "season_summaries"("chronicleId", "category");

-- CreateIndex
CREATE INDEX "player_quotes_chronicleId_isFeatured_idx" ON "player_quotes"("chronicleId", "isFeatured");

-- AddForeignKey
ALTER TABLE "season_summaries" ADD CONSTRAINT "season_summaries_chronicleId_fkey" FOREIGN KEY ("chronicleId") REFERENCES "world_chronicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_quotes" ADD CONSTRAINT "player_quotes_chronicleId_fkey" FOREIGN KEY ("chronicleId") REFERENCES "world_chronicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_quotes" ADD CONSTRAINT "player_quotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
