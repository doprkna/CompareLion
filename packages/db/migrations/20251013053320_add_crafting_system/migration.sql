-- CreateTable
CREATE TABLE "crafting_recipes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "inputItemIds" TEXT[],
    "outputItemId" TEXT NOT NULL,
    "goldCost" INTEGER NOT NULL DEFAULT 0,
    "requiresToken" BOOLEAN NOT NULL DEFAULT false,
    "rarityBoost" INTEGER NOT NULL DEFAULT 0,
    "successRate" INTEGER NOT NULL DEFAULT 95,
    "craftingTime" INTEGER NOT NULL DEFAULT 0,
    "unlockLevel" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crafting_recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crafting_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recipeId" TEXT,
    "inputItems" JSONB NOT NULL,
    "outputItem" JSONB,
    "success" BOOLEAN NOT NULL,
    "goldSpent" INTEGER NOT NULL,
    "rarityAchieved" TEXT,
    "statVariance" JSONB,
    "craftedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crafting_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "crafting_recipes_unlockLevel_idx" ON "crafting_recipes"("unlockLevel");

-- CreateIndex
CREATE INDEX "crafting_logs_userId_craftedAt_idx" ON "crafting_logs"("userId", "craftedAt");

-- AddForeignKey
ALTER TABLE "crafting_logs" ADD CONSTRAINT "crafting_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
