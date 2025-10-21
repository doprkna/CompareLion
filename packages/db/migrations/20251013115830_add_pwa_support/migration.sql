-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "keys" JSONB NOT NULL,
    "userAgent" TEXT,
    "deviceType" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offline_actions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncedAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "offline_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa_metrics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "installCount" INTEGER NOT NULL DEFAULT 0,
    "uninstallCount" INTEGER NOT NULL DEFAULT 0,
    "activeInstalls" INTEGER NOT NULL DEFAULT 0,
    "mobileUsers" INTEGER NOT NULL DEFAULT 0,
    "tabletUsers" INTEGER NOT NULL DEFAULT 0,
    "desktopUsers" INTEGER NOT NULL DEFAULT 0,
    "pushSent" INTEGER NOT NULL DEFAULT 0,
    "pushDelivered" INTEGER NOT NULL DEFAULT 0,
    "pushClicked" INTEGER NOT NULL DEFAULT 0,
    "offlineActions" INTEGER NOT NULL DEFAULT 0,
    "syncedActions" INTEGER NOT NULL DEFAULT 0,
    "failedActions" INTEGER NOT NULL DEFAULT 0,
    "avgLoadTime" DOUBLE PRECISION,
    "cacheHitRate" DOUBLE PRECISION,

    CONSTRAINT "pwa_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_userId_isEnabled_idx" ON "push_subscriptions"("userId", "isEnabled");

-- CreateIndex
CREATE INDEX "offline_actions_userId_status_idx" ON "offline_actions"("userId", "status");

-- CreateIndex
CREATE INDEX "offline_actions_status_createdAt_idx" ON "offline_actions"("status", "createdAt");

-- CreateIndex
CREATE INDEX "pwa_metrics_date_idx" ON "pwa_metrics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "pwa_metrics_date_key" ON "pwa_metrics"("date");

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offline_actions" ADD CONSTRAINT "offline_actions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
