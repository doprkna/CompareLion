/**
 * Materials & Crafting Schema Definition
 * 
 * This file documents the Prisma schema structure for Materials & Crafting 1.0
 * Note: Models may already exist (Material, Recipe, etc.)
 * 
 * v0.36.40 - Materials & Crafting 1.0
 */

/**
 * Prisma Schema Structure:
 * 
 * Models that should exist:
 * 
 * 1. Material:
 *    - id (String, @id, @default(cuid()))
 *    - name (String)
 *    - description (String?, nullable)
 *    - rarity (String, enum: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary')
 *    - category (String, enum: 'ore' | 'gem' | 'herb' | 'cloth' | 'leather' | 'metal' | 'wood' | 'essence' | 'other')
 *    - icon (String?, nullable)
 *    - emoji (String?, nullable)
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: dropTableEntries (DropTableEntry[]), userMaterials (UserMaterial[])
 *    - Indexes: [category], [rarity]
 * 
 * 2. DropTableEntry:
 *    - id (String, @id, @default(cuid()))
 *    - enemyId (String, relation to Enemy)
 *    - materialId (String, relation to Material)
 *    - minQuantity (Int, default 1)
 *    - maxQuantity (Int, default 1)
 *    - dropRate (Float, 0.0 to 1.0, default 0.1)
 *    - Relations: enemy (Enemy), material (Material)
 *    - Indexes: [enemyId], [materialId]
 *    - Unique: [enemyId, materialId] (optional, if one enemy can only drop one material type)
 * 
 * 3. Recipe:
 *    - id (String, @id, @default(cuid()))
 *    - name (String)
 *    - description (String?, nullable)
 *    - outputItemId (String, relation to Item)
 *    - ingredients (Json, array of { materialId: string, quantity: number })
 *    - craftTime (Int, seconds, default 0 - for future use)
 *    - skillRequirement (Int?, nullable, skill level required)
 *    - unlockLevel (Int?, nullable, player level required)
 *    - goldCost (Int?, nullable, optional gold cost)
 *    - isActive (Boolean, default true)
 *    - Relations: outputItem (Item)
 *    - Indexes: [outputItemId], [isActive]
 * 
 * 4. UserMaterial:
 *    - id (String, @id, @default(cuid()))
 *    - userId (String, relation to User)
 *    - materialId (String, relation to Material)
 *    - quantity (Int, default 0)
 *    - Relations: user (User), material (Material)
 *    - Unique: [userId, materialId]
 *    - Indexes: [userId], [materialId]
 * 
 * Enums (if using Prisma enum):
 *    enum MaterialCategory {
 *      ore
 *      gem
 *      herb
 *      cloth
 *      leather
 *      metal
 *      wood
 *      essence
 *      other
 *    }
 * 
 *    enum RarityTier {
 *      common
 *      uncommon
 *      rare
 *      epic
 *      legendary
 *    }
 * 
 * Note: The system currently uses string values, but enums are recommended for type safety.
 * 
 * Integration Points:
 * - DropTableEntry.enemyId → Enemy.id (for combat drops)
 * - Recipe.outputItemId → Item.id (for crafting output)
 * - UserMaterial.userId → User.id (for player inventory)
 * - UserMaterial.materialId → Material.id (for material reference)
 */

export const SCHEMA_VERSION = '0.36.40';
export const SCHEMA_MODULE = 'Materials & Crafting 1.0';

