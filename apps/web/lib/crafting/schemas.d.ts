/**
 * Materials & Crafting Zod Schemas
 * Validation schemas for Materials & Crafting API endpoints
 * v0.36.40 - Materials & Crafting 1.0
 */
import { z } from 'zod';
import { MaterialCategory, RarityTier } from './types';
/**
 * Recipe Ingredient Schema
 */
export declare const RecipeIngredientSchema: z.ZodObject<{
    materialId: z.ZodString;
    quantity: z.ZodNumber;
}, z.core.$strip>;
/**
 * Create Material Schema (Admin)
 */
export declare const CreateMaterialSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    rarity: z.ZodEnum<typeof RarityTier>;
    category: z.ZodEnum<typeof MaterialCategory>;
    icon: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    emoji: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
/**
 * Update Material Schema (Admin)
 */
export declare const UpdateMaterialSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    rarity: z.ZodOptional<z.ZodEnum<typeof RarityTier>>;
    category: z.ZodOptional<z.ZodEnum<typeof MaterialCategory>>;
    icon: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    emoji: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
}, z.core.$strip>;
/**
 * Create Drop Table Entry Schema (Admin)
 */
export declare const CreateDropTableEntrySchema: z.ZodObject<{
    enemyId: z.ZodString;
    materialId: z.ZodString;
    minQuantity: z.ZodNumber;
    maxQuantity: z.ZodNumber;
    dropRate: z.ZodNumber;
}, z.core.$strip>;
/**
 * Create Recipe Schema (Admin)
 */
export declare const CreateRecipeSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    outputItemId: z.ZodString;
    ingredients: z.ZodArray<z.ZodObject<{
        materialId: z.ZodString;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
    craftTime: z.ZodDefault<z.ZodNumber>;
    skillRequirement: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    unlockLevel: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    goldCost: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
/**
 * Update Recipe Schema (Admin)
 */
export declare const UpdateRecipeSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    outputItemId: z.ZodOptional<z.ZodString>;
    ingredients: z.ZodOptional<z.ZodArray<z.ZodObject<{
        materialId: z.ZodString;
        quantity: z.ZodNumber;
    }, z.core.$strip>>>;
    craftTime: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    skillRequirement: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    unlockLevel: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    goldCost: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
}, z.core.$strip>;
/**
 * Craft Item Schema
 */
export declare const CraftItemSchema: z.ZodObject<{
    recipeId: z.ZodString;
    quantity: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
/**
 * Rarity Upgrade Schema
 */
export declare const RarityUpgradeSchema: z.ZodObject<{
    itemId: z.ZodString;
    quantity: z.ZodNumber;
}, z.core.$strip>;
/**
 * Type exports for TypeScript
 */
export type CreateMaterialInput = z.infer<typeof CreateMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof UpdateMaterialSchema>;
export type CreateDropTableEntryInput = z.infer<typeof CreateDropTableEntrySchema>;
export type CreateRecipeInput = z.infer<typeof CreateRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof UpdateRecipeSchema>;
export type CraftItemInput = z.infer<typeof CraftItemSchema>;
export type RarityUpgradeInput = z.infer<typeof RarityUpgradeSchema>;
