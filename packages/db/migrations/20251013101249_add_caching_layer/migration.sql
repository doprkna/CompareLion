-- CreateTable
CREATE TABLE "cache_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ttlSeconds" INTEGER NOT NULL DEFAULT 60,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "strategy" TEXT NOT NULL DEFAULT 'redis',
    "invalidateOn" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cache_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cache_metrics" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "missCount" INTEGER NOT NULL DEFAULT 0,
    "avgHitTime" DOUBLE PRECISION,
    "avgMissTime" DOUBLE PRECISION,
    "lastHitAt" TIMESTAMP(3),
    "lastMissAt" TIMESTAMP(3),
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cache_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cache_configs_key_key" ON "cache_configs"("key");

-- CreateIndex
CREATE INDEX "cache_configs_key_isEnabled_idx" ON "cache_configs"("key", "isEnabled");

-- CreateIndex
CREATE INDEX "cache_metrics_endpoint_date_idx" ON "cache_metrics"("endpoint", "date");

-- CreateIndex
CREATE INDEX "cache_metrics_cacheKey_date_idx" ON "cache_metrics"("cacheKey", "date");

-- CreateIndex
CREATE UNIQUE INDEX "cache_metrics_cacheKey_endpoint_date_key" ON "cache_metrics"("cacheKey", "endpoint", "date");
