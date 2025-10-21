-- CreateTable
CREATE TABLE "system_metrics" (
    "id" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "endpoint" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_logs" (
    "id" TEXT NOT NULL,
    "checkType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "responseTime" DOUBLE PRECISION,
    "metadata" JSONB,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_heal_logs" (
    "id" TEXT NOT NULL,
    "healType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "itemsAffected" INTEGER NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auto_heal_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_alerts" (
    "id" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stackTrace" TEXT,
    "metadata" JSONB,
    "notifiedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "system_metrics_metricType_timestamp_idx" ON "system_metrics"("metricType", "timestamp");

-- CreateIndex
CREATE INDEX "system_metrics_endpoint_timestamp_idx" ON "system_metrics"("endpoint", "timestamp");

-- CreateIndex
CREATE INDEX "health_logs_checkType_checkedAt_idx" ON "health_logs"("checkType", "checkedAt");

-- CreateIndex
CREATE INDEX "health_logs_status_checkedAt_idx" ON "health_logs"("status", "checkedAt");

-- CreateIndex
CREATE INDEX "auto_heal_logs_healType_executedAt_idx" ON "auto_heal_logs"("healType", "executedAt");

-- CreateIndex
CREATE INDEX "error_alerts_severity_isResolved_createdAt_idx" ON "error_alerts"("severity", "isResolved", "createdAt");

-- CreateIndex
CREATE INDEX "error_alerts_source_createdAt_idx" ON "error_alerts"("source", "createdAt");
