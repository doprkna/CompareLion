-- CreateTable
CREATE TABLE "global_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "emoji" TEXT DEFAULT '🎉',
    "type" TEXT NOT NULL,
    "bonusType" TEXT NOT NULL,
    "bonusValue" INTEGER NOT NULL,
    "targetScope" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "global_events_active_startAt_endAt_idx" ON "global_events"("active", "startAt", "endAt");

-- CreateIndex
CREATE INDEX "global_events_startAt_endAt_idx" ON "global_events"("startAt", "endAt");
