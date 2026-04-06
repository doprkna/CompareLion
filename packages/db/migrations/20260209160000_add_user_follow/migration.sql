-- AlterTable
ALTER TABLE "users" ADD COLUMN "allowFollow" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "isPrivate" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "user_follows" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_follows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_follows_followerId_followedId_key" ON "user_follows"("followerId", "followedId");

-- CreateIndex
CREATE INDEX "user_follows_followedId_createdAt_idx" ON "user_follows"("followedId", "createdAt");

-- CreateIndex
CREATE INDEX "user_follows_followerId_createdAt_idx" ON "user_follows"("followerId", "createdAt");

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followedId_fkey" FOREIGN KEY ("followedId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
