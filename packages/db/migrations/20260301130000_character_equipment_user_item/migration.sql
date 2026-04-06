-- Unify RPG equipment to UserItem (alpha canonical stash)
-- CharacterEquipment: add userItemId, make inventoryItemId nullable for legacy fallback

ALTER TABLE "character_equipment" ADD COLUMN "userItemId" TEXT;
ALTER TABLE "character_equipment" ALTER COLUMN "inventoryItemId" DROP NOT NULL;
CREATE INDEX "character_equipment_userItemId_idx" ON "character_equipment"("userItemId");
ALTER TABLE "character_equipment" ADD CONSTRAINT "character_equipment_userItemId_fkey" FOREIGN KEY ("userItemId") REFERENCES "user_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
