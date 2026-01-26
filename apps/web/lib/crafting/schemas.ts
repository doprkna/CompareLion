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
export const RecipeIngredientSchema = z.object({
  materialId: z.string().min(1, 'Material ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

/**
 * Create Material Schema (Admin)
 */
export const CreateMaterialSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500).optional().nullable(),
  rarity: z.nativeEnum(RarityTier),
  category: z.nativeEnum(MaterialCategory),
  icon: z.string().optional().nullable(),
  emoji: z.string().optional().nullable(),
});

/**
 * Update Material Schema (Admin)
 */
export const UpdateMaterialSchema = CreateMaterialSchema.partial();

/**
 * Create Drop Table Entry Schema (Admin)
 */
export const CreateDropTableEntrySchema = z.object({
  enemyId: z.string().min(1, 'Enemy ID is required'),
  materialId: z.string().min(1, 'Material ID is required'),
  minQuantity: z.number().int().min(1, 'Min quantity must be at least 1'),
  maxQuantity: z.number().int().min(1, 'Max quantity must be at least 1'),
  dropRate: z.number().min(0, 'Drop rate must be >= 0').max(1, 'Drop rate must be <= 1'),
}).refine(data => data.maxQuantity >= data.minQuantity, {
  message: 'Max quantity must be >= min quantity',
  path: ['maxQuantity'],
});

/**
 * Create Recipe Schema (Admin)
 */
export const CreateRecipeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500).optional().nullable(),
  outputItemId: z.string().min(1, 'Output item ID is required'),
  ingredients: z.array(RecipeIngredientSchema).min(1, 'At least one ingredient is required'),
  craftTime: z.number().int().min(0, 'Craft time must be >= 0').default(0),
  skillRequirement: z.number().int().min(0).optional().nullable(),
  unlockLevel: z.number().int().min(1).optional().nullable(),
  goldCost: z.number().int().min(0).optional().nullable(),
});

/**
 * Update Recipe Schema (Admin)
 */
export const UpdateRecipeSchema = CreateRecipeSchema.partial();

/**
 * Craft Item Schema
 */
export const CraftItemSchema = z.object({
  recipeId: z.string().min(1, 'Recipe ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity too high').default(1),
});

/**
 * Rarity Upgrade Schema
 */
export const RarityUpgradeSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

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

