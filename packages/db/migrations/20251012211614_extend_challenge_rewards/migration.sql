-- AlterTable
ALTER TABLE "challenges" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "prompt" TEXT,
ADD COLUMN     "response" TEXT,
ADD COLUMN     "rewardKarma" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "rewardXp" INTEGER NOT NULL DEFAULT 25;
