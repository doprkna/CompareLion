-- DropForeignKey
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_targetId_fkey";

-- CreateTable
CREATE TABLE "event_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "reactionsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_logs_userId_createdAt_idx" ON "event_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "event_logs_type_createdAt_idx" ON "event_logs"("type", "createdAt");

-- CreateIndex
CREATE INDEX "event_logs_visibility_createdAt_idx" ON "event_logs"("visibility", "createdAt");

-- CreateIndex
CREATE INDEX "event_logs_reactionsCount_createdAt_idx" ON "event_logs"("reactionsCount", "createdAt");

-- CreateIndex
CREATE INDEX "challenges_status_createdAt_idx" ON "challenges"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "event_logs" ADD CONSTRAINT "event_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
