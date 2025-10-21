-- CreateTable
CREATE TABLE "job_queues" (
    "id" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "concurrency" INTEGER NOT NULL DEFAULT 1,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "backoffStrategy" TEXT NOT NULL DEFAULT 'exponential',
    "backoffDelay" INTEGER NOT NULL DEFAULT 1000,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_queues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_queue_metrics" (
    "id" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "retried" INTEGER NOT NULL DEFAULT 0,
    "stalled" INTEGER NOT NULL DEFAULT 0,
    "avgProcessTime" DOUBLE PRECISION,
    "maxProcessTime" DOUBLE PRECISION,
    "minProcessTime" DOUBLE PRECISION,
    "processedPerSec" DOUBLE PRECISION,
    "failureRate" DOUBLE PRECISION,

    CONSTRAINT "job_queue_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_failures" (
    "id" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "payload" JSONB,
    "error" TEXT NOT NULL,
    "stackTrace" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "maxRetries" INTEGER NOT NULL,
    "willRetry" BOOLEAN NOT NULL,
    "nextRetryAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "isResolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "job_failures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_queues_queueName_key" ON "job_queues"("queueName");

-- CreateIndex
CREATE INDEX "job_queues_priority_isEnabled_idx" ON "job_queues"("priority", "isEnabled");

-- CreateIndex
CREATE INDEX "job_queue_metrics_queueName_date_idx" ON "job_queue_metrics"("queueName", "date");

-- CreateIndex
CREATE INDEX "job_queue_metrics_date_idx" ON "job_queue_metrics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "job_queue_metrics_queueName_date_key" ON "job_queue_metrics"("queueName", "date");

-- CreateIndex
CREATE INDEX "job_failures_queueName_failedAt_idx" ON "job_failures"("queueName", "failedAt");

-- CreateIndex
CREATE INDEX "job_failures_isResolved_failedAt_idx" ON "job_failures"("isResolved", "failedAt");

-- AddForeignKey
ALTER TABLE "job_queue_metrics" ADD CONSTRAINT "job_queue_metrics_queueName_fkey" FOREIGN KEY ("queueName") REFERENCES "job_queues"("queueName") ON DELETE CASCADE ON UPDATE CASCADE;
