-- CreateTable
CREATE TABLE "avatar_layers" (
    "id" TEXT NOT NULL,
    "layerType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rarity" TEXT NOT NULL,
    "unlockLevel" INTEGER NOT NULL DEFAULT 1,
    "unlockCondition" TEXT,
    "goldCost" INTEGER,
    "diamondCost" INTEGER,
    "imageUrl" TEXT,
    "zIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avatar_layers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_avatar_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "layerId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_avatar_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_avatars" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "equippedLayers" JSONB NOT NULL,
    "presetName" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_avatars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "avatar_layers_layerType_rarity_idx" ON "avatar_layers"("layerType", "rarity");

-- CreateIndex
CREATE INDEX "user_avatar_items_userId_idx" ON "user_avatar_items"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_avatar_items_userId_layerId_key" ON "user_avatar_items"("userId", "layerId");

-- CreateIndex
CREATE UNIQUE INDEX "user_avatars_userId_key" ON "user_avatars"("userId");

-- AddForeignKey
ALTER TABLE "user_avatar_items" ADD CONSTRAINT "user_avatar_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_avatar_items" ADD CONSTRAINT "user_avatar_items_layerId_fkey" FOREIGN KEY ("layerId") REFERENCES "avatar_layers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_avatars" ADD CONSTRAINT "user_avatars_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
