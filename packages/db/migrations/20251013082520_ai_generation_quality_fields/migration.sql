-- AlterTable
ALTER TABLE "generation_jobs" ADD COLUMN     "moderatorNotes" TEXT,
ADD COLUMN     "moderatorScore" DOUBLE PRECISION,
ADD COLUMN     "moderatorStatus" TEXT,
ADD COLUMN     "moderatorUserId" TEXT,
ADD COLUMN     "qualityScore" DOUBLE PRECISION,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weightScore" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "generation_jobs_moderatorStatus_idx" ON "generation_jobs"("moderatorStatus");
