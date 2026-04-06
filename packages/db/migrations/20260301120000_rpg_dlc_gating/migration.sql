-- RPG DLC Gating + Multi-Character + Inventory/Equip (v0.46.01)

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "characters_userId_idx" ON "characters"("userId");

-- AlterTable
ALTER TABLE "users" ADD COLUMN "rpgEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "rpgCreatedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "rpgPromptSeenAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "rpgDismissedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "activeCharacterId" TEXT;
CREATE UNIQUE INDEX "users_activeCharacterId_key" ON "users"("activeCharacterId");

-- AddForeignKey (User -> Character for active)
ALTER TABLE "users" ADD CONSTRAINT "users_activeCharacterId_fkey" FOREIGN KEY ("activeCharacterId") REFERENCES "characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey (Character -> User)
ALTER TABLE "characters" ADD CONSTRAINT "characters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable CharacterEquipment
CREATE TABLE "character_equipment" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "equippedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "character_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "character_equipment_characterId_slot_key" ON "character_equipment"("characterId", "slot");
CREATE INDEX "character_equipment_characterId_idx" ON "character_equipment"("characterId");
CREATE INDEX "character_equipment_inventoryItemId_idx" ON "character_equipment"("inventoryItemId");

-- AddForeignKey
ALTER TABLE "character_equipment" ADD CONSTRAINT "character_equipment_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "character_equipment" ADD CONSTRAINT "character_equipment_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
