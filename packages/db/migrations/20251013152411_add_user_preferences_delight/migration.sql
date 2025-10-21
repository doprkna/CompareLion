-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "soundVolume" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "levelUpSound" BOOLEAN NOT NULL DEFAULT true,
    "purchaseSound" BOOLEAN NOT NULL DEFAULT true,
    "challengeSound" BOOLEAN NOT NULL DEFAULT true,
    "notificationSound" BOOLEAN NOT NULL DEFAULT true,
    "ambientMusicEnabled" BOOLEAN NOT NULL DEFAULT false,
    "ambientTheme" TEXT,
    "animationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reducedMotion" BOOLEAN NOT NULL DEFAULT false,
    "particleEffects" BOOLEAN NOT NULL DEFAULT true,
    "backgroundAnimation" BOOLEAN NOT NULL DEFAULT true,
    "transitionSpeed" TEXT NOT NULL DEFAULT 'normal',
    "glowEffects" BOOLEAN NOT NULL DEFAULT true,
    "shimmerEffects" BOOLEAN NOT NULL DEFAULT true,
    "confettiEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sound_assets" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER,
    "duration" DOUBLE PRECISION,
    "category" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "defaultVolume" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "loop" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sound_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "sound_assets_assetId_key" ON "sound_assets"("assetId");

-- CreateIndex
CREATE INDEX "sound_assets_category_isActive_idx" ON "sound_assets"("category", "isActive");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
