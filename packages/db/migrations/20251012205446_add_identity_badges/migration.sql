-- AlterTable
ALTER TABLE "users" ADD COLUMN     "allowPublicCompare" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "badgeType" TEXT DEFAULT 'none',
ADD COLUMN     "karmaScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "prestigeScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "showBadges" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "initiatorId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'random',
    "categoryId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "challenges_initiatorId_status_idx" ON "challenges"("initiatorId", "status");

-- CreateIndex
CREATE INDEX "challenges_receiverId_status_idx" ON "challenges"("receiverId", "status");

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
