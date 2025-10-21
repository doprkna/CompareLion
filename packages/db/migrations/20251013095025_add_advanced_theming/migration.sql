-- CreateTable
CREATE TABLE "theme_packs" (
    "id" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "isSeasonal" BOOLEAN NOT NULL DEFAULT false,
    "seasonType" TEXT,
    "gradientConfig" JSONB NOT NULL,
    "particleConfig" JSONB,
    "animationConfig" JSONB,
    "unlockLevel" INTEGER NOT NULL DEFAULT 1,
    "unlockCondition" TEXT,
    "goldCost" INTEGER,
    "diamondCost" INTEGER,
    "vipOnly" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "availableFrom" TIMESTAMP(3),
    "availableUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "theme_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_theme_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "autoSeasonalTheme" BOOLEAN NOT NULL DEFAULT false,
    "preferredThemeId" TEXT,
    "lastAutoSwitchAt" TIMESTAMP(3),

    CONSTRAINT "user_theme_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "theme_packs_themeId_key" ON "theme_packs"("themeId");

-- CreateIndex
CREATE INDEX "theme_packs_isSeasonal_seasonType_idx" ON "theme_packs"("isSeasonal", "seasonType");

-- CreateIndex
CREATE INDEX "theme_packs_type_rarity_idx" ON "theme_packs"("type", "rarity");

-- CreateIndex
CREATE INDEX "theme_packs_isActive_availableFrom_availableUntil_idx" ON "theme_packs"("isActive", "availableFrom", "availableUntil");

-- CreateIndex
CREATE UNIQUE INDEX "user_theme_settings_userId_key" ON "user_theme_settings"("userId");

-- AddForeignKey
ALTER TABLE "user_theme_settings" ADD CONSTRAINT "user_theme_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
