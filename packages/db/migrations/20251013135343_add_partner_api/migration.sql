-- CreateTable
CREATE TABLE "partner_apps" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "contactEmail" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "tier" TEXT NOT NULL DEFAULT 'free',
    "rateLimit" INTEGER NOT NULL DEFAULT 1000,
    "dailyLimit" INTEGER NOT NULL DEFAULT 10000,
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "webhookEvents" TEXT[],
    "canEmbed" BOOLEAN NOT NULL DEFAULT true,
    "canAccessData" BOOLEAN NOT NULL DEFAULT false,
    "canCreateContent" BOOLEAN NOT NULL DEFAULT false,
    "logoUrl" TEXT,
    "industry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "partner_apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_api_keys" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPreview" TEXT NOT NULL,
    "name" TEXT,
    "scopes" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "partner_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_stats" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalRequests" INTEGER NOT NULL DEFAULT 0,
    "successRequests" INTEGER NOT NULL DEFAULT 0,
    "failedRequests" INTEGER NOT NULL DEFAULT 0,
    "rateLimitHits" INTEGER NOT NULL DEFAULT 0,
    "embedViews" INTEGER NOT NULL DEFAULT 0,
    "embedClicks" INTEGER NOT NULL DEFAULT 0,
    "embedResponses" INTEGER NOT NULL DEFAULT 0,
    "questionsServed" INTEGER NOT NULL DEFAULT 0,
    "answersReceived" INTEGER NOT NULL DEFAULT 0,
    "uniqueUsers" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTime" DOUBLE PRECISION,
    "errorRate" DOUBLE PRECISION,

    CONSTRAINT "partner_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_webhooks" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "signature" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "error" TEXT,
    "nextRetryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partner_apps_clientId_key" ON "partner_apps"("clientId");

-- CreateIndex
CREATE INDEX "partner_apps_status_tier_idx" ON "partner_apps"("status", "tier");

-- CreateIndex
CREATE INDEX "partner_apps_clientId_idx" ON "partner_apps"("clientId");

-- CreateIndex
CREATE INDEX "partner_api_keys_partnerId_isActive_idx" ON "partner_api_keys"("partnerId", "isActive");

-- CreateIndex
CREATE INDEX "partner_api_keys_keyHash_idx" ON "partner_api_keys"("keyHash");

-- CreateIndex
CREATE INDEX "partner_stats_partnerId_date_idx" ON "partner_stats"("partnerId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "partner_stats_partnerId_date_key" ON "partner_stats"("partnerId", "date");

-- CreateIndex
CREATE INDEX "partner_webhooks_partnerId_status_idx" ON "partner_webhooks"("partnerId", "status");

-- CreateIndex
CREATE INDEX "partner_webhooks_status_nextRetryAt_idx" ON "partner_webhooks"("status", "nextRetryAt");

-- AddForeignKey
ALTER TABLE "partner_api_keys" ADD CONSTRAINT "partner_api_keys_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partner_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_stats" ADD CONSTRAINT "partner_stats_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partner_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
