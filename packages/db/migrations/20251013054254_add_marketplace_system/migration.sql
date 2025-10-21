-- CreateTable
CREATE TABLE "market_listings" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'gold',
    "status" TEXT NOT NULL DEFAULT 'active',
    "listedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "soldAt" TIMESTAMP(3),
    "buyerId" TEXT,

    CONSTRAINT "market_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_pool" (
    "id" TEXT NOT NULL,
    "poolType" TEXT NOT NULL DEFAULT 'market_tax',
    "goldAmount" INTEGER NOT NULL DEFAULT 0,
    "diamondAmount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_pool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "market_listings_status_listedAt_idx" ON "market_listings"("status", "listedAt");

-- CreateIndex
CREATE INDEX "market_listings_sellerId_idx" ON "market_listings"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "global_pool_poolType_key" ON "global_pool"("poolType");

-- AddForeignKey
ALTER TABLE "market_listings" ADD CONSTRAINT "market_listings_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
