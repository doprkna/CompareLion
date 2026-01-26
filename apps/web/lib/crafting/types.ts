/**
 * Materials & Crafting Types & Enums
 * Shared types, enums, and interfaces for Materials & Crafting system
 * v0.36.40 - Materials & Crafting 1.0
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Material Category
 */
export enum MaterialCategory {
  ORE = 'ore',
  GEM = 'gem',
  HERB = 'herb',
  CLOTH = 'cloth',
  LEATHER = 'leather',
  METAL = 'metal',
  WOOD = 'wood',
  ESSENCE = 'essence',
  OTHER = 'other',
}

/**
 * Rarity Tier (reusing from existing system)
 */
export enum RarityTier {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Material definition
 */
export interface Material {
  id: string;
  name: string;
  description?: string | null;
  rarity: RarityTier;
  category: MaterialCategory;
  icon?: string | null;
  emoji?: string | null;
}

/**
 * User material inventory entry
 */
export interface UserMaterial {
  id: string;
  userId: string;
  materialId: string;
  quantity: number;
  // Relations (populated)
  material?: Material;
}

/**
 * Drop table entry for materials
 */
export interface DropTableEntry {
  id: string;
  enemyId: string;
  materialId: string;
  minQuantity: number;
  maxQuantity: number;
  dropRate: number; // 0.0 to 1.0 (percentage)
  // Relations (populated)
  material?: Material;
}

/**
 * Recipe ingredient
 */
export interface RecipeIngredient {
  materialId: string;
  quantity: number;
}

/**
 * Crafting recipe
 */
export interface Recipe {
  id: string;
  name: string;
  description?: string | null;
  outputItemId: string;
  ingredients: RecipeIngredient[]; // JSON array
  craftTime: number; // Seconds (for future use)
  skillRequirement?: number | null; // Skill level required (for future use)
  unlockLevel?: number | null; // Player level required
  goldCost?: number | null; // Optional gold cost
  // Relations (populated)
  outputItem?: {
    id: string;
    name: string;
    rarity: string;
    type: string;
  };
}

/**
 * Material drop result
 */
export interface MaterialDrop {
  materialId: string;
  quantity: number;
  material?: Material;
}

/**
 * Crafting result
 */
export interface CraftingResult {
  success: boolean;
  outputItemId?: string;
  outputItem?: any;
  materialsConsumed?: RecipeIngredient[];
  message: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate material category
 */
export function isValidMaterialCategory(value: string): value is MaterialCategory {
  return Object.values(MaterialCategory).includes(value as MaterialCategory);
}

/**
 * Get material category display name
 */
export function getMaterialCategoryDisplayName(category: MaterialCategory): string {
  const displayNames: Record<MaterialCategory, string> = {
    [MaterialCategory.ORE]: 'Ore',
    [MaterialCategory.GEM]: 'Gem',
    [MaterialCategory.HERB]: 'Herb',
    [MaterialCategory.CLOTH]: 'Cloth',
    [MaterialCategory.LEATHER]: 'Leather',
    [MaterialCategory.METAL]: 'Metal',
    [MaterialCategory.WOOD]: 'Wood',
    [MaterialCategory.ESSENCE]: 'Essence',
    [MaterialCategory.OTHER]: 'Other',
  };
  return displayNames[category] || category;
}

/**
 * Get rarity display name
 */
export function getRarityDisplayName(rarity: RarityTier): string {
  const displayNames: Record<RarityTier, string> = {
    [RarityTier.COMMON]: 'Common',
    [RarityTier.UNCOMMON]: 'Uncommon',
    [RarityTier.RARE]: 'Rare',
    [RarityTier.EPIC]: 'Epic',
    [RarityTier.LEGENDARY]: 'Legendary',
  };
  return displayNames[rarity] || rarity;
}

/**
 * Calculate rarity upgrade requirements
 * Common → Uncommon: 3 items
 * Uncommon → Rare: 5 items
 * Rare → Epic: 7 items
 * Epic → Legendary: 10 items
 */
export function getRarityUpgradeRequirements(currentRarity: RarityTier): number {
  const requirements: Record<RarityTier, number> = {
    [RarityTier.COMMON]: 3,
    [RarityTier.UNCOMMON]: 5,
    [RarityTier.RARE]: 7,
    [RarityTier.EPIC]: 10,
    [RarityTier.LEGENDARY]: 0, // Cannot upgrade legendary
  };
  return requirements[currentRarity] || 0;
}

/**
 * Get next rarity tier
 */
export function getNextRarity(currentRarity: RarityTier): RarityTier | null {
  const order: RarityTier[] = [
    RarityTier.COMMON,
    RarityTier.UNCOMMON,
    RarityTier.RARE,
    RarityTier.EPIC,
    RarityTier.LEGENDARY,
  ];
  const currentIndex = order.indexOf(currentRarity);
  if (currentIndex === -1 || currentIndex === order.length - 1) {
    return null;
  }
  return order[currentIndex + 1];
}

