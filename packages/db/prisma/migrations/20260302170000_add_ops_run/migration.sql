CREATE TABLE "ops_runs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "counts" JSONB,
    "message" TEXT,
    "reportPath" TEXT,
    "triggeredBy" TEXT,

    CONSTRAINT "ops_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ops_runs_type_idx" ON "ops_runs"("type");
CREATE INDEX "ops_runs_startedAt_idx" ON "ops_runs"("startedAt");
