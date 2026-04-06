-- AlterTable
ALTER TABLE "users" ADD COLUMN "birthYear" INTEGER;

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('VISIBLE', 'PENDING_REVIEW', 'FLAGGED', 'REJECTED', 'APPROVED', 'SHADOW_BANNED');

-- CreateEnum
CREATE TYPE "ModerationReportReason" AS ENUM ('SPAM', 'HARASSMENT', 'HATE', 'SEXUAL', 'VIOLENCE', 'MISINFORMATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ContentRating" AS ENUM ('GENERAL', 'TEEN', 'ADULT');

-- CreateTable
CREATE TABLE "moderation_entities" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT,
    "status" "ModerationStatus" NOT NULL DEFAULT 'VISIBLE',
    "rating" "ContentRating" NOT NULL DEFAULT 'GENERAL',
    "autoFlagScore" INTEGER NOT NULL DEFAULT 0,
    "isAutoFlagged" BOOLEAN NOT NULL DEFAULT false,
    "lastReviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moderation_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_reports" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "reason" "ModerationReportReason" NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_moderation_actions" (
    "id" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entity_moderation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "moderation_entities_entityType_entityId_key" ON "moderation_entities"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "moderation_entities_status_idx" ON "moderation_entities"("status");

-- CreateIndex
CREATE INDEX "content_reports_entityType_entityId_idx" ON "content_reports"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "entity_moderation_actions_entityType_entityId_idx" ON "entity_moderation_actions"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_moderation_actions" ADD CONSTRAINT "entity_moderation_actions_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
