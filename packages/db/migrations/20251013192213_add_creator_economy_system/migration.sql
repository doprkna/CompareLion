-- CreateTable
CREATE TABLE "creator_wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pendingBalance" INTEGER NOT NULL DEFAULT 0,
    "paidBalance" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" INTEGER NOT NULL DEFAULT 0,
    "stripeAccountId" TEXT,
    "lastPayoutAt" TIMESTAMP(3),
    "nextPayoutAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_transactions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "payoutPoolId" TEXT,
    "stripeTransferId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creator_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout_pools" (
    "id" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "weekEnd" DATE NOT NULL,
    "totalPool" INTEGER NOT NULL DEFAULT 0,
    "fromSubscriptions" INTEGER NOT NULL DEFAULT 0,
    "fromCosmetics" INTEGER NOT NULL DEFAULT 0,
    "fromDonations" INTEGER NOT NULL DEFAULT 0,
    "totalDistributed" INTEGER NOT NULL DEFAULT 0,
    "totalCreators" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "calculatedAt" TIMESTAMP(3),
    "distributedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payout_pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_metrics" (
    "id" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "weekStart" DATE NOT NULL,
    "fingerprint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engagement_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "creator_wallets_userId_key" ON "creator_wallets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "creator_wallets_stripeAccountId_key" ON "creator_wallets"("stripeAccountId");

-- CreateIndex
CREATE INDEX "creator_wallets_userId_idx" ON "creator_wallets"("userId");

-- CreateIndex
CREATE INDEX "creator_transactions_walletId_type_idx" ON "creator_transactions"("walletId", "type");

-- CreateIndex
CREATE INDEX "creator_transactions_createdAt_idx" ON "creator_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "payout_pools_status_idx" ON "payout_pools"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payout_pools_weekStart_weekEnd_key" ON "payout_pools"("weekStart", "weekEnd");

-- CreateIndex
CREATE INDEX "engagement_metrics_creatorId_weekStart_idx" ON "engagement_metrics"("creatorId", "weekStart");

-- CreateIndex
CREATE INDEX "engagement_metrics_contentType_contentId_idx" ON "engagement_metrics"("contentType", "contentId");

-- CreateIndex
CREATE INDEX "engagement_metrics_weekStart_idx" ON "engagement_metrics"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "engagement_metrics_contentType_contentId_userId_type_key" ON "engagement_metrics"("contentType", "contentId", "userId", "type");

-- AddForeignKey
ALTER TABLE "creator_wallets" ADD CONSTRAINT "creator_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_transactions" ADD CONSTRAINT "creator_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "creator_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_metrics" ADD CONSTRAINT "engagement_metrics_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_metrics" ADD CONSTRAINT "engagement_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
