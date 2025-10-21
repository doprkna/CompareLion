-- CreateTable
CREATE TABLE "telemetry_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "page" TEXT,
    "action" TEXT,
    "duration" INTEGER,
    "metadata" JSONB,
    "userAgent" TEXT,
    "platform" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telemetry_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telemetry_aggregates" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "type" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "avgDuration" DOUBLE PRECISION,
    "p50Duration" DOUBLE PRECISION,
    "p95Duration" DOUBLE PRECISION,
    "p99Duration" DOUBLE PRECISION,
    "errorRate" DOUBLE PRECISION,
    "context" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telemetry_aggregates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "telemetry_events_type_createdAt_idx" ON "telemetry_events"("type", "createdAt");

-- CreateIndex
CREATE INDEX "telemetry_events_sessionId_idx" ON "telemetry_events"("sessionId");

-- CreateIndex
CREATE INDEX "telemetry_events_createdAt_idx" ON "telemetry_events"("createdAt");

-- CreateIndex
CREATE INDEX "telemetry_aggregates_date_type_idx" ON "telemetry_aggregates"("date", "type");

-- CreateIndex
CREATE UNIQUE INDEX "telemetry_aggregates_date_type_context_key" ON "telemetry_aggregates"("date", "type", "context");
