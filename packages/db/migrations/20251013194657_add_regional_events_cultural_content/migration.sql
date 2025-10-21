-- CreateTable
CREATE TABLE "regional_events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "region" TEXT NOT NULL,
    "country" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT,
    "eventType" TEXT NOT NULL,
    "theme" TEXT,
    "rewardXp" INTEGER NOT NULL DEFAULT 0,
    "rewardGold" INTEGER NOT NULL DEFAULT 0,
    "rewardItems" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regional_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "region_configs" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "hasRegionalLeaderboard" BOOLEAN NOT NULL DEFAULT false,
    "preferredThemes" JSONB,
    "displayName" TEXT NOT NULL,
    "flagEmoji" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "region_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cultural_items" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "culture" TEXT,
    "eventType" TEXT,
    "eventName" TEXT,
    "isSeasonalOnly" BOOLEAN NOT NULL DEFAULT false,
    "availableMonths" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cultural_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "regional_events_region_isActive_idx" ON "regional_events"("region", "isActive");

-- CreateIndex
CREATE INDEX "regional_events_startDate_endDate_idx" ON "regional_events"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "region_configs_region_key" ON "region_configs"("region");

-- CreateIndex
CREATE INDEX "cultural_items_region_idx" ON "cultural_items"("region");

-- CreateIndex
CREATE INDEX "cultural_items_eventType_idx" ON "cultural_items"("eventType");

-- AddForeignKey
ALTER TABLE "cultural_items" ADD CONSTRAINT "cultural_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
