/**
 * Crafting System
 * 
 * Item combination, rarity upgrades, and stat variance.
 */

import { prisma } from "@/lib/db";
import { publishEvent } from "@/lib/realtime";
import { createFeedItem } from "@/lib/feed";
import { logActivity } from "@/lib/activity";

export type RarityTier = "common" | "uncommon" | "rare" | "epic" | "legendary";

const RARITY_ORDER: RarityTier[] = ["common", "uncommon", "rare", "epic", "legendary"];

/**
 * Get next rarity tier
 */
export function getNextRarity(current: RarityTier): RarityTier {
  const currentIndex = RARITY_ORDER.indexOf(current);
  if (currentIndex === -1 || currentIndex === RARITY_ORDER.length - 1) {
    return current;
  }
  return RARITY_ORDER[currentIndex + 1];
}

/**
 * Apply stat variance (±10%)
 */
export function applyStatVariance(baseStat: number): number {
  const variance = Math.random() * 0.2 - 0.1; // -10% to +10%
  return Math.round(baseStat * (1 + variance));
}

/**
 * Calculate crafting success (5% failure rate by default)
 */
export function rollCraftingSuccess(successRate: number = 95): boolean {
  return Math.random() * 100 < successRate;
}

/**
 * Check if user has required items
 */
export async function hasRequiredItems(
  userId: string,
  itemIds: string[]
): Promise<{ hasAll: boolean; missing: string[] }> {
  const inventory = await prisma.inventoryItem.findMany({
    where: {
      userId,
      itemId: { in: itemIds },
      quantity: { gt: 0 },
    },
    include: {
      item: true,
    },
  });

  const foundIds = inventory.map((inv) => inv.itemId);
  const missing = itemIds.filter((id) => !foundIds.includes(id));

  return {
    hasAll: missing.length === 0,
    missing,
  };
}

/**
 * Consume items from inventory
 */
export async function consumeItems(
  userId: string,
  itemIds: string[]
): Promise<void> {
  for (const itemId of itemIds) {
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        userId,
        itemId,
        quantity: { gt: 0 },
      },
    });

    if (!inventoryItem) {
      throw new Error(`Item ${itemId} not found in inventory`);
    }

    if (inventoryItem.quantity === 1) {
      // Remove from inventory
      await prisma.inventoryItem.delete({
        where: { id: inventoryItem.id },
      });
    } else {
      // Decrease quantity
      await prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: { quantity: { decrement: 1 } },
      });
    }
  }
}

/**
 * Add crafted item to inventory
 */
export async function addCraftedItem(
  userId: string,
  itemId: string,
  quantity: number = 1
): Promise<void> {
  const existing = await prisma.inventoryItem.findFirst({
    where: {
      userId,
      itemId,
    },
  });

  if (existing) {
    await prisma.inventoryItem.update({
      where: { id: existing.id },
      data: { quantity: { increment: quantity } },
    });
  } else {
    await prisma.inventoryItem.create({
      data: {
        userId,
        itemId,
        quantity,
      },
    });
  }
}

/**
 * Perform crafting with all checks
 */
export async function performCrafting(
  userId: string,
  recipeId: string
): Promise<{
  success: boolean;
  outputItem?: any;
  message: string;
  goldSpent: number;
  rarityAchieved?: RarityTier;
}> {
  // Get recipe
  const recipe = await prisma.craftingRecipe.findUnique({
    where: { id: recipeId },
  });

  if (!recipe) {
    return { success: false, message: "Recipe not found", goldSpent: 0 };
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { success: false, message: "User not found", goldSpent: 0 };
  }

  // Check level requirement
  if ((user.level || 1) < recipe.unlockLevel) {
    return {
      success: false,
      message: `Level ${recipe.unlockLevel} required`,
      goldSpent: 0,
    };
  }

  // Check gold
  if ((user.funds || 0) < recipe.goldCost) {
    return {
      success: false,
      message: `Insufficient gold (need ${recipe.goldCost})`,
      goldSpent: 0,
    };
  }

  // Check items
  const { hasAll } = await hasRequiredItems(userId, recipe.inputItemIds);
  if (!hasAll) {
    return {
      success: false,
      message: `Missing required items`,
      goldSpent: 0,
    };
  }

  // Get item details
  const inputItems = await prisma.item.findMany({
    where: { id: { in: recipe.inputItemIds } },
  });

  const outputItemBase = await prisma.item.findUnique({
    where: { id: recipe.outputItemId },
  });

  if (!outputItemBase) {
    return { success: false, message: "Output item not found", goldSpent: 0 };
  }

  // Deduct gold
  await prisma.user.update({
    where: { id: userId },
    data: { funds: { decrement: recipe.goldCost } },
  });

  // Consume input items
  await consumeItems(userId, recipe.inputItemIds);

  // Roll for success
  const success = rollCraftingSuccess(recipe.successRate);

  let outputItem = null;
  let rarityAchieved: RarityTier | undefined = undefined;

  if (success) {
    // Apply rarity boost
    const baseRarity = (outputItemBase.rarity as RarityTier) || "common";
    rarityAchieved = recipe.rarityBoost > 0 ? getNextRarity(baseRarity) : baseRarity;

    // Apply stat variance
    const statVariance = {
      power: outputItemBase.power ? applyStatVariance(outputItemBase.power) : null,
      defense: outputItemBase.defense ? applyStatVariance(outputItemBase.defense) : null,
    };

    outputItem = {
      ...outputItemBase,
      rarity: rarityAchieved,
      power: statVariance.power,
      defense: statVariance.defense,
    };

    // Add to inventory
    await addCraftedItem(userId, recipe.outputItemId);

    // Log activity
    await logActivity(
      userId,
      "crafting_success",
      `Crafted ${outputItemBase.name}`,
      `Rarity: ${rarityAchieved}`
    );

    // Log to feed
    await createFeedItem({
      type: "crafting",
      title: `Crafted ${rarityAchieved} ${outputItemBase.name}!`,
      description: recipe.rarityBoost > 0 ? "🌟 Rarity upgraded!" : undefined,
      userId,
      metadata: {
        itemName: outputItemBase.name,
        rarity: rarityAchieved,
        recipe: recipe.name,
      },
    });
  } else {
    // Crafting failed - items lost
    await logActivity(
      userId,
      "crafting_failed",
      "Crafting attempt failed",
      `Lost materials for ${recipe.name}`
    );
  }

  // Log crafting attempt
  await prisma.craftingLog.create({
    data: {
      userId,
      recipeId: recipe.id,
      inputItems: inputItems.map((item) => ({
        id: item.id,
        name: item.name,
        rarity: item.rarity,
      })),
      outputItem: outputItem,
      success,
      goldSpent: recipe.goldCost,
      rarityAchieved,
      statVariance: outputItem
        ? { power: outputItem.power, defense: outputItem.defense }
        : null,
    },
  });

  // Publish real-time event
  await publishEvent("crafting:complete", {
    userId,
    success,
    recipeName: recipe.name,
    outputItem: outputItem?.name,
    rarity: rarityAchieved,
  });

  return {
    success,
    outputItem,
    message: success
      ? `Crafted ${outputItem?.name}!`
      : "Crafting failed - materials lost!",
    goldSpent: recipe.goldCost,
    rarityAchieved,
  };
}

/**
 * Get available recipes for user
 */
export async function getAvailableRecipes(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return [];

  const recipes = await prisma.craftingRecipe.findMany({
    where: {
      unlockLevel: {
        lte: user.level || 1,
      },
    },
    orderBy: {
      unlockLevel: "asc",
    },
  });

  return recipes;
}

/**
 * Get crafting history for user
 */
export async function getCraftingHistory(userId: string, limit: number = 20) {
  return await prisma.craftingLog.findMany({
    where: { userId },
    orderBy: { craftedAt: "desc" },
    take: limit,
  });
}













