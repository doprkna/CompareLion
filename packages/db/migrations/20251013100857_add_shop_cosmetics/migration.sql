-- AlterTable
ALTER TABLE "items" ADD COLUMN     "availableUntil" TIMESTAMP(3),
ADD COLUMN     "cosmeticSubtype" TEXT,
ADD COLUMN     "cosmeticType" TEXT,
ADD COLUMN     "diamondPrice" INTEGER,
ADD COLUMN     "eventCurrency" TEXT,
ADD COLUMN     "eventPrice" INTEGER,
ADD COLUMN     "goldPrice" INTEGER,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isLimited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isShopItem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "visualConfig" JSONB;

-- CreateIndex
CREATE INDEX "items_type_rarity_idx" ON "items"("type", "rarity");

-- CreateIndex
CREATE INDEX "items_cosmeticType_cosmeticSubtype_idx" ON "items"("cosmeticType", "cosmeticSubtype");

-- CreateIndex
CREATE INDEX "items_isShopItem_isFeatured_idx" ON "items"("isShopItem", "isFeatured");
