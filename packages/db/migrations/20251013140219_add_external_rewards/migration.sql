-- CreateTable
CREATE TABLE "reward_offers" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "partnerId" TEXT,
    "partnerName" TEXT NOT NULL,
    "partnerLogo" TEXT,
    "minPrestige" INTEGER NOT NULL DEFAULT 0,
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "requiredBadges" TEXT[],
    "requiredTitles" TEXT[],
    "value" TEXT NOT NULL,
    "rewardCode" TEXT,
    "qrCodeUrl" TEXT,
    "externalUrl" TEXT,
    "totalStock" INTEGER,
    "remainingStock" INTEGER,
    "maxPerUser" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "category" TEXT,
    "imageUrl" TEXT,
    "termsUrl" TEXT,
    "nftEnabled" BOOLEAN NOT NULL DEFAULT false,
    "nftContract" TEXT,
    "nftMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_redemptions" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "redemptionCode" TEXT NOT NULL,
    "qrCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'claimed',
    "verificationCode" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "redeemedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "nftMinted" BOOLEAN NOT NULL DEFAULT false,
    "nftTokenId" TEXT,
    "nftTxHash" TEXT,
    "metadata" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_proofs" (
    "id" TEXT NOT NULL,
    "redemptionId" TEXT NOT NULL,
    "proofType" TEXT NOT NULL,
    "proofData" JSONB NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "reward_proofs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reward_offers_offerId_key" ON "reward_offers"("offerId");

-- CreateIndex
CREATE INDEX "reward_offers_isActive_startsAt_expiresAt_idx" ON "reward_offers"("isActive", "startsAt", "expiresAt");

-- CreateIndex
CREATE INDEX "reward_offers_type_category_idx" ON "reward_offers"("type", "category");

-- CreateIndex
CREATE INDEX "reward_offers_minPrestige_minLevel_idx" ON "reward_offers"("minPrestige", "minLevel");

-- CreateIndex
CREATE UNIQUE INDEX "reward_redemptions_redemptionCode_key" ON "reward_redemptions"("redemptionCode");

-- CreateIndex
CREATE INDEX "reward_redemptions_userId_status_idx" ON "reward_redemptions"("userId", "status");

-- CreateIndex
CREATE INDEX "reward_redemptions_offerId_status_idx" ON "reward_redemptions"("offerId", "status");

-- CreateIndex
CREATE INDEX "reward_redemptions_redemptionCode_idx" ON "reward_redemptions"("redemptionCode");

-- CreateIndex
CREATE INDEX "reward_redemptions_expiresAt_idx" ON "reward_redemptions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "reward_proofs_redemptionId_key" ON "reward_proofs"("redemptionId");

-- CreateIndex
CREATE INDEX "reward_proofs_redemptionId_idx" ON "reward_proofs"("redemptionId");

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "reward_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
