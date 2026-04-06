/**
 * Crafting Engine
 * Core crafting logic: validation, crafting, rarity upgrades
 * v0.36.40 - Materials & Crafting 1.0
 */
import { RecipeIngredient, CraftingResult } from './types';
/**
 * Validate that user has all required ingredients
 *
 * @param userId - User ID
 * @param ingredients - Array of required ingredients
 * @returns Object with validation result and missing ingredients
 */
export declare function validateIngredients(userId: string, ingredients: RecipeIngredient[]): Promise<{
    valid: boolean;
    missing: RecipeIngredient[];
}>;
/**
 * Craft an item from a recipe
 * Atomic transaction: validates, deducts materials, creates item
 *
 * @param userId - User ID
 * @param recipeId - Recipe ID
 * @param quantity - Quantity to craft (default: 1)
 * @returns Crafting result
 */
export declare function craftItem(userId: string, recipeId: string, quantity?: number): Promise<CraftingResult>;
/**
 * Upgrade item rarity by combining multiple lower-tier items
 *
 * @param userId - User ID
 * @param itemId - Item ID to upgrade
 * @param quantity - Quantity of items to use (must meet requirements)
 * @returns Crafting result
 */
export declare function rarityUpgrade(userId: string, itemId: string, quantity: number): Promise<CraftingResult>;
