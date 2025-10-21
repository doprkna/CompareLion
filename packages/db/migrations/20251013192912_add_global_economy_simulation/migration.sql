-- CreateTable
CREATE TABLE "economy_stats" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalGold" BIGINT NOT NULL DEFAULT 0,
    "totalDiamonds" BIGINT NOT NULL DEFAULT 0,
    "totalXp" BIGINT NOT NULL DEFAULT 0,
    "goldCreated" BIGINT NOT NULL DEFAULT 0,
    "goldDestroyed" BIGINT NOT NULL DEFAULT 0,
    "diamondsCreated" BIGINT NOT NULL DEFAULT 0,
    "diamondsDestroyed" BIGINT NOT NULL DEFAULT 0,
    "marketTransactions" INTEGER NOT NULL DEFAULT 0,
    "marketVolume" BIGINT NOT NULL DEFAULT 0,
    "craftingVolume" INTEGER NOT NULL DEFAULT 0,
    "inflationRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "economy_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury" (
    "id" TEXT NOT NULL,
    "gold" BIGINT NOT NULL DEFAULT 0,
    "diamonds" BIGINT NOT NULL DEFAULT 0,
    "taxCollected" BIGINT NOT NULL DEFAULT 0,
    "donationsReceived" BIGINT NOT NULL DEFAULT 0,
    "eventsSpent" BIGINT NOT NULL DEFAULT 0,
    "projectsSpent" BIGINT NOT NULL DEFAULT 0,
    "lifetimeCollected" BIGINT NOT NULL DEFAULT 0,
    "lifetimeSpent" BIGINT NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dynamic_prices" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "currentPrice" INTEGER NOT NULL,
    "demand" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "supply" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "purchaseVolume" INTEGER NOT NULL DEFAULT 0,
    "craftingVolume" INTEGER NOT NULL DEFAULT 0,
    "lastAdjustedAt" TIMESTAMP(3),
    "priceHistory" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dynamic_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_transactions" (
    "id" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "amount" BIGINT NOT NULL,
    "taxAmount" BIGINT NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "currency" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "economy_stats_date_idx" ON "economy_stats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "economy_stats_date_key" ON "economy_stats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "dynamic_prices_itemId_key" ON "dynamic_prices"("itemId");

-- CreateIndex
CREATE INDEX "dynamic_prices_itemId_idx" ON "dynamic_prices"("itemId");

-- CreateIndex
CREATE INDEX "tax_transactions_userId_idx" ON "tax_transactions"("userId");

-- CreateIndex
CREATE INDEX "tax_transactions_sourceType_idx" ON "tax_transactions"("sourceType");

-- CreateIndex
CREATE INDEX "tax_transactions_createdAt_idx" ON "tax_transactions"("createdAt");

-- AddForeignKey
ALTER TABLE "dynamic_prices" ADD CONSTRAINT "dynamic_prices_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_transactions" ADD CONSTRAINT "tax_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
