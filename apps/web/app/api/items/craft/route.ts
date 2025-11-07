import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const CraftSchema = z.object({
  recipeId: z.string().min(1),
});

/**
 * POST /api/items/craft
 * Validates ingredients, consumes, grants new item
 * Auth required
 * v0.29.20 - Item Ecosystem Expansion
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      xp: true,
      level: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json().catch(() => ({}));
  const parsed = CraftSchema.safeParse(body);
  if (!parsed.success) {
    return validationError('Invalid payload');
  }

  const { recipeId } = parsed.data;

  // Get recipe
  const recipe = await prisma.itemRecipe.findUnique({
    where: { id: recipeId },
    include: {
      item: true,
    },
  });

  if (!recipe) {
    return notFoundError('Recipe not found');
  }

  // Validate ingredients
  const ingredients = recipe.ingredients as Array<{ itemId: string; quantity: number }>;
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return validationError('Recipe has no ingredients');
  }

  // Check user has all required ingredients
  const userInventory = await prisma.inventoryItem.findMany({
    where: {
      userId: user.id,
      itemId: { in: ingredients.map((i) => i.itemId) },
    },
  });

  for (const ingredient of ingredients) {
    const userItem = userInventory.find((ui) => ui.itemId === ingredient.itemId);
    if (!userItem || userItem.quantity < ingredient.quantity) {
      return validationError(`Insufficient ${ingredient.itemId} (need ${ingredient.quantity})`);
    }
  }

  // Perform crafting in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Consume ingredients
    for (const ingredient of ingredients) {
      const userItem = userInventory.find((ui) => ui.itemId === ingredient.itemId)!;
      if (userItem.quantity === ingredient.quantity) {
        // Delete if quantity matches exactly
        await tx.inventoryItem.delete({
          where: { id: userItem.id },
        });
      } else {
        // Decrease quantity
        await tx.inventoryItem.update({
          where: { id: userItem.id },
          data: { quantity: userItem.quantity - ingredient.quantity },
        });
      }
    }

    // 2. Grant crafted item
    const existingItem = await tx.inventoryItem.findUnique({
      where: {
        userId_itemId: {
          userId: user.id,
          itemId: recipe.itemId,
        },
      },
    });

    let craftedItem;
    if (existingItem) {
      // Increment quantity
      craftedItem = await tx.inventoryItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + 1 },
      });
    } else {
      // Create new inventory item
      craftedItem = await tx.inventoryItem.create({
        data: {
          userId: user.id,
          itemId: recipe.itemId,
          itemKey: recipe.item.key || undefined,
          rarity: recipe.item.rarity,
          quantity: 1,
        },
      });
    }

    // 3. Record discovery if first time
    const existingDiscovery = await tx.itemDiscovery.findUnique({
      where: {
        userId_itemId: {
          userId: user.id,
          itemId: recipe.itemId,
        },
      },
    });

    let isNewDiscovery = false;
    if (!existingDiscovery) {
      await tx.itemDiscovery.create({
        data: {
          userId: user.id,
          itemId: recipe.itemId,
        },
      });
      isNewDiscovery = true;
    }

    // 4. Grant XP reward
    const newXP = user.xp + recipe.xpReward;
    const newLevel = Math.floor(newXP / 100) + 1; // Simple level calculation

    await tx.user.update({
      where: { id: user.id },
      data: {
        xp: newXP,
        level: newLevel,
      },
    });

    // 5. Log transaction
    await tx.transaction.create({
      data: {
        userId: user.id,
        type: 'craft',
        amount: recipe.xpReward,
        currencyKey: 'xp',
        note: `Crafted ${recipe.item.name}. ${isNewDiscovery ? 'New discovery!' : ''}`,
      },
    });

    return { craftedItem, isNewDiscovery, xpReward: recipe.xpReward, newXP, newLevel };
  });

  return successResponse({
    success: true,
    message: result.isNewDiscovery ? '✨ New discovery! Item crafted successfully.' : 'Item crafted successfully.',
    item: {
      id: result.craftedItem.id,
      itemId: result.craftedItem.itemId,
      quantity: result.craftedItem.quantity,
    },
    isNewDiscovery: result.isNewDiscovery,
    xpReward: result.xpReward,
    newXP: result.newXP,
    newLevel: result.newLevel,
  });
});

