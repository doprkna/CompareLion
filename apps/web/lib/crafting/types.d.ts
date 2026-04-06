/**
 * Materials & Crafting Types & Enums
 * Shared types, enums, and interfaces for Materials & Crafting system
 * v0.36.40 - Materials & Crafting 1.0
 */
/**
 * Material Category
 */
export declare enum MaterialCategory {
    ORE = "ore",
    GEM = "gem",
    HERB = "herb",
    CLOTH = "cloth",
    LEATHER = "leather",
    METAL = "metal",
    WOOD = "wood",
    ESSENCE = "essence",
    OTHER = "other"
}
/**
 * Rarity Tier (reusing from existing system)
 */
export declare enum RarityTier {
    COMMON = "common",
    UNCOMMON = "uncommon",
    RARE = "rare",
    EPIC = "epic",
    LEGENDARY = "legendary"
}
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
    dropRate: number;
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
    ingredients: RecipeIngredient[];
    craftTime: number;
    skillRequirement?: number | null;
    unlockLevel?: number | null;
    goldCost?: number | null;
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
/**
 * Validate material category
 */
export declare function isValidMaterialCategory(value: string): value is MaterialCategory;
/**
 * Get material category display name
 */
export declare function getMaterialCategoryDisplayName(category: MaterialCategory): string;
/**
 * Get rarity display name
 */
export declare function getRarityDisplayName(rarity: RarityTier): string;
/**
 * Calculate rarity upgrade requirements
 * Common → Uncommon: 3 items
 * Uncommon → Rare: 5 items
 * Rare → Epic: 7 items
 * Epic → Legendary: 10 items
 */
export declare function getRarityUpgradeRequirements(currentRarity: RarityTier): number;
/**
 * Get next rarity tier
 */
export declare function getNextRarity(currentRarity: RarityTier): RarityTier | null;
