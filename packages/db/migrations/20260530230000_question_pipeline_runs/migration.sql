-- Question pipeline operational audit trail

CREATE TABLE IF NOT EXISTS "question_pipeline_runs" (
    "id" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "triggeredBy" TEXT,
    "sourceName" TEXT,
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsCreated" INTEGER NOT NULL DEFAULT 0,
    "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
    "recordsSkipped" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "summaryJson" JSONB,
    "errorMessage" TEXT,
    CONSTRAINT "question_pipeline_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "question_pipeline_runs_jobType_idx"
  ON "question_pipeline_runs"("jobType");
CREATE INDEX IF NOT EXISTS "question_pipeline_runs_status_idx"
  ON "question_pipeline_runs"("status");
CREATE INDEX IF NOT EXISTS "question_pipeline_runs_startedAt_idx"
  ON "question_pipeline_runs"("startedAt");
