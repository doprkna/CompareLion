-- AlterTable
ALTER TABLE "user_achievements" ADD COLUMN     "animationShownAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "profile_themes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_themes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "profile_themes_userId_idx" ON "profile_themes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "profile_themes_userId_themeId_key" ON "profile_themes"("userId", "themeId");

-- AddForeignKey
ALTER TABLE "profile_themes" ADD CONSTRAINT "profile_themes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
