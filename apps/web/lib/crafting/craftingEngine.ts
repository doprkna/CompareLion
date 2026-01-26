/**
 * Crafting Engine
 * Core crafting logic: validation, crafting, rarity upgrades
 * v0.36.40 - Materials & Crafting 1.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { RecipeIngredient, CraftingResult, RarityTier, getNextRarity, getRarityUpgradeRequirements } from './types';

/**
 * Validate that user has all required ingredients
 * 
 * @param userId - User ID
 * @param ingredients - Array of required ingredients
 * @returns Object with validation result and missing ingredients
 */
export async function validateIngredients(
  userId: string,
  ingredients: RecipeIngredient[]
): Promise<{
  valid: boolean;
  missing: RecipeIngredient[];
}> {
  try {
    // Get user's materials
    const userMaterials = await prisma.userMaterial.findMany({
      where: {
        userId,
        materialId: { in: ingredients.map(i => i.materialId) },
      },
    });

    const missing: RecipeIngredient[] = [];

    for (const ingredient of ingredients) {
      const userMaterial = userMaterials.find(um => um.materialId === ingredient.materialId);
      
      if (!userMaterial || userMaterial.quantity < ingredient.quantity) {
        missing.push({
          materialId: ingredient.materialId,
          quantity: ingredient.quantity - (userMaterial?.quantity || 0),
        });
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  } catch (error) {
    logger.error('[CraftingEngine] Failed to validate ingredients', { userId, error });
    return { valid: false, missing: ingredients };
  }
}

/**
 * Craft an item from a recipe
 * Atomic transaction: validates, deducts materials, creates item
 * 
 * @param userId - User ID
 * @param recipeId - Recipe ID
 * @param quantity - Quantity to craft (default: 1)
 * @returns Crafting result
 */
export async function craftItem(
  userId: string,
  recipeId: string,
  quantity: number = 1
): Promise<CraftingResult> {
  try {
    // Get recipe
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        outputItem: {
          select: {
            id: true,
            name: true,
            rarity: true,
            type: true,
            emoji: true,
            icon: true,
          },
        },
      },
    });

    if (!recipe) {
      return {
        success: false,
        message: 'Recipe not found',
      };
    }

    if (!recipe.isActive) {
      return {
        success: false,
        message: 'Recipe is not active',
      };
    }

    // Check unlock level
    if (recipe.unlockLevel) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true },
      });

      if (!user || (user.level || 1) < recipe.unlockLevel) {
        return {
          success: false,
          message: `Level ${recipe.unlockLevel} required to craft this item`,
        };
      }
    }

    // Calculate total ingredients needed
    const totalIngredients: RecipeIngredient[] = recipe.ingredients.map(ing => ({
      materialId: ing.materialId,
      quantity: ing.quantity * quantity,
    }));

    // Validate ingredients
    const validation = await validateIngredients(userId, totalIngredients);
    if (!validation.valid) {
      return {
        success: false,
        message: 'Insufficient materials',
        materialsConsumed: [],
      };
    }

    // Check gold cost
    if (recipe.goldCost && recipe.goldCost > 0) {
      const totalGoldCost = recipe.goldCost * quantity;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { funds: true },
      });

      if (!user || (Number(user.funds) || 0) < totalGoldCost) {
        return {
          success: false,
          message: `Insufficient gold. Need ${totalGoldCost}, have ${Number(user.funds) || 0}`,
        };
      }
    }

    // Perform crafting in atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct materials
      for (const ingredient of totalIngredients) {
        const userMaterial = await tx.userMaterial.findUnique({
          where: {
            userId_materialId: {
              userId,
              materialId: ingredient.materialId,
            },
          },
        });

        if (!userMaterial) {
          throw new Error(`Material ${ingredient.materialId} not found`);
        }

        if (userMaterial.quantity === ingredient.quantity) {
          // Delete if quantity matches exactly
          await tx.userMaterial.delete({
            where: { id: userMaterial.id },
          });
        } else {
          // Decrease quantity
          await tx.userMaterial.update({
            where: { id: userMaterial.id },
            data: { quantity: { decrement: ingredient.quantity } },
          });
        }
      }

      // 2. Deduct gold if required
      if (recipe.goldCost && recipe.goldCost > 0) {
        const totalGoldCost = recipe.goldCost * quantity;
        await tx.user.update({
          where: { id: userId },
          data: { funds: { decrement: totalGoldCost } },
        });
      }

      // 3. Grant output item(s)
      for (let i = 0; i < quantity; i++) {
        const existingItem = await tx.inventoryItem.findUnique({
          where: {
            userId_itemId: {
              userId,
              itemId: recipe.outputItemId,
            },
          },
        });

        if (existingItem) {
          await tx.inventoryItem.update({
            where: { id: existingItem.id },
            data: { quantity: { increment: 1 } },
          });
        } else {
          await tx.inventoryItem.create({
            data: {
              userId,
              itemId: recipe.outputItemId,
              quantity: 1,
            },
          });
        }
      }

      return {
        success: true,
        outputItemId: recipe.outputItemId,
        outputItem: recipe.outputItem,
        materialsConsumed: totalIngredients,
      };
    });

    logger.info(`[CraftingEngine] User ${userId} crafted ${quantity}x ${recipe.outputItem?.name} from recipe ${recipeId}`);

    return {
      success: true,
      outputItemId: result.outputItemId,
      outputItem: result.outputItem,
      materialsConsumed: result.materialsConsumed,
      message: `Successfully crafted ${quantity}x ${recipe.outputItem?.name}`,
    };
  } catch (error) {
    logger.error('[CraftingEngine] Failed to craft item', { userId, recipeId, error });
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to craft item',
    };
  }
}

/**
 * Upgrade item rarity by combining multiple lower-tier items
 * 
 * @param userId - User ID
 * @param itemId - Item ID to upgrade
 * @param quantity - Quantity of items to use (must meet requirements)
 * @returns Crafting result
 */
export async function rarityUpgrade(
  userId: string,
  itemId: string,
  quantity: number
): Promise<CraftingResult> {
  try {
    // Get item
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return {
        success: false,
        message: 'Item not found',
      };
    }

    const currentRarity = item.rarity as RarityTier;
    const nextRarity = getNextRarity(currentRarity);

    if (!nextRarity) {
      return {
        success: false,
        message: 'Item is already at maximum rarity',
      };
    }

    const requiredQuantity = getRarityUpgradeRequirements(currentRarity);
    
    if (quantity < requiredQuantity) {
      return {
        success: false,
        message: `Need ${requiredQuantity} items to upgrade from ${currentRarity} to ${nextRarity}`,
      };
    }

    // Check user has enough items
    const userItem = await prisma.inventoryItem.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId,
        },
      },
    });

    if (!userItem || userItem.quantity < requiredQuantity) {
      return {
        success: false,
        message: `Insufficient items. Need ${requiredQuantity}, have ${userItem?.quantity || 0}`,
      };
    }

    // Perform upgrade in atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct items
      if (userItem.quantity === requiredQuantity) {
        await tx.inventoryItem.delete({
          where: { id: userItem.id },
        });
      } else {
        await tx.inventoryItem.update({
          where: { id: userItem.id },
          data: { quantity: { decrement: requiredQuantity } },
        });
      }

      // 2. Create upgraded item
      const upgradedItem = await tx.inventoryItem.findUnique({
        where: {
          userId_itemId: {
            userId,
            itemId,
          },
        },
      });

      if (upgradedItem) {
        // Update existing item's rarity and increment quantity
        await tx.inventoryItem.update({
          where: { id: upgradedItem.id },
          data: {
            rarity: nextRarity,
            quantity: { increment: 1 },
          },
        });
      } else {
        // Create new item with upgraded rarity
        await tx.inventoryItem.create({
          data: {
            userId,
            itemId,
            rarity: nextRarity,
            quantity: 1,
          },
        });
      }

      return {
        success: true,
        outputItemId: itemId,
        rarity: nextRarity,
      };
    });

    logger.info(`[CraftingEngine] User ${userId} upgraded ${item.name} from ${currentRarity} to ${nextRarity}`);

    return {
      success: true,
      outputItemId: result.outputItemId,
      message: `Successfully upgraded ${item.name} to ${nextRarity}`,
    };
  } catch (error) {
    logger.error('[CraftingEngine] Failed to upgrade rarity', { userId, itemId, error });
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to upgrade rarity',
    };
  }
}

