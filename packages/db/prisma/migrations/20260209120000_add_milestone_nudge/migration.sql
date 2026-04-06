-- CreateEnum
CREATE TYPE "MilestoneTriggerType" AS ENUM ('ANSWER_COUNT', 'LEVEL_UP');

-- CreateEnum
CREATE TYPE "MilestoneScope" AS ENUM ('GLOBAL', 'FLOW');

-- CreateTable
CREATE TABLE "milestone_rules" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "titleTemplate" TEXT NOT NULL,
    "bodyTemplate" TEXT NOT NULL,
    "triggerType" "MilestoneTriggerType" NOT NULL,
    "scope" "MilestoneScope" NOT NULL,
    "scopeRefId" TEXT,
    "triggerConfig" JSONB NOT NULL,
    "uiVariant" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "cooldownSeconds" INTEGER NOT NULL DEFAULT 0,
    "maxPerDay" INTEGER,
    "maxTotal" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestone_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestone_deliveries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "context" JSONB,
    "source" TEXT,
    "sessionId" TEXT,
    "dedupeKey" TEXT,

    CONSTRAINT "milestone_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "milestone_rules_key_key" ON "milestone_rules"("key");

-- CreateIndex
CREATE INDEX "milestone_rules_scope_scopeRefId_triggerType_isActive_idx" ON "milestone_rules"("scope", "scopeRefId", "triggerType", "isActive");

-- CreateIndex
CREATE INDEX "milestone_deliveries_userId_ruleId_deliveredAt_idx" ON "milestone_deliveries"("userId", "ruleId", "deliveredAt");

-- AddForeignKey
ALTER TABLE "milestone_deliveries" ADD CONSTRAINT "milestone_deliveries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone_deliveries" ADD CONSTRAINT "milestone_deliveries_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "milestone_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
