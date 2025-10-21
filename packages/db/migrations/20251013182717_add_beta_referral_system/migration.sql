-- CreateTable
CREATE TABLE "beta_invites" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "creatorId" TEXT,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "rewardsGranted" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "source" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beta_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "xpRewarded" INTEGER NOT NULL DEFAULT 50,
    "diamondsRewarded" INTEGER NOT NULL DEFAULT 1,
    "rewardsGranted" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rewardedAt" TIMESTAMP(3),

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beta_users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inviteCode" TEXT,
    "wave" INTEGER,
    "firstLoginAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "referralsSent" INTEGER NOT NULL DEFAULT 0,
    "referralsAccepted" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beta_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "beta_invites_code_key" ON "beta_invites"("code");

-- CreateIndex
CREATE INDEX "beta_invites_code_idx" ON "beta_invites"("code");

-- CreateIndex
CREATE INDEX "beta_invites_creatorId_idx" ON "beta_invites"("creatorId");

-- CreateIndex
CREATE INDEX "beta_invites_isActive_idx" ON "beta_invites"("isActive");

-- CreateIndex
CREATE INDEX "referrals_referrerId_idx" ON "referrals"("referrerId");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "referrals"("status");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referredId_key" ON "referrals"("referredId");

-- CreateIndex
CREATE UNIQUE INDEX "beta_users_userId_key" ON "beta_users"("userId");

-- CreateIndex
CREATE INDEX "beta_users_wave_idx" ON "beta_users"("wave");

-- CreateIndex
CREATE INDEX "beta_users_joinedAt_idx" ON "beta_users"("joinedAt");

-- AddForeignKey
ALTER TABLE "beta_invites" ADD CONSTRAINT "beta_invites_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "beta_invites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beta_users" ADD CONSTRAINT "beta_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
