/**
 * Crafting Recipes API
 * GET /api/crafting/recipes - List available crafting recipes
 * v0.36.40 - Materials & Crafting 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

export const runtime = 'nodejs';

/**
 * GET /api/crafting/recipes
 * Get all active crafting recipes
 * Optionally filter by user's level and materials
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const includeUserMaterials = searchParams.get('includeUserMaterials') === 'true';

  let userId: string | null = null;
  let userLevel = 1;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, level: true },
    });

    if (user) {
      userId = user.id;
      userLevel = user.level || 1;
    }
  }

  // Get all active recipes
  const recipes = await prisma.recipe.findMany({
    where: {
      isActive: true,
      // Filter by unlock level if user is logged in
      ...(userId ? {
        OR: [
          { unlockLevel: null },
          { unlockLevel: { lte: userLevel } },
        ],
      } : {}),
    },
    include: {
      outputItem: {
        select: {
          id: true,
          name: true,
          rarity: true,
          type: true,
          emoji: true,
          icon: true,
          description: true,
        },
      },
    },
    orderBy: [
      { unlockLevel: 'asc' },
      { name: 'asc' },
    ],
  });

  // If user is logged in and requested, check which recipes they can craft
  let userMaterials: Record<string, number> = {};
  if (userId && includeUserMaterials) {
    const materials = await prisma.userMaterial.findMany({
      where: { userId },
      select: {
        materialId: true,
        quantity: true,
      },
    });

    userMaterials = materials.reduce((acc, m) => {
      acc[m.materialId] = m.quantity;
      return acc;
    }, {} as Record<string, number>);
  }

  // Format recipes with craftability info
  const formattedRecipes = recipes.map(recipe => {
    const ingredients = (recipe.ingredients as Array<{ materialId: string; quantity: number }>) || [];
    
    let canCraft = false;
    if (userId && includeUserMaterials) {
      canCraft = ingredients.every(ing => {
        const userQty = userMaterials[ing.materialId] || 0;
        return userQty >= ing.quantity;
      });
    }

    return {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      outputItemId: recipe.outputItemId,
      ingredients: ingredients.map(ing => ({
        materialId: ing.materialId,
        quantity: ing.quantity,
        // Include user's quantity if available
        ...(userId && includeUserMaterials ? {
          userQuantity: userMaterials[ing.materialId] || 0,
          hasEnough: (userMaterials[ing.materialId] || 0) >= ing.quantity,
        } : {}),
      })),
      craftTime: recipe.craftTime,
      skillRequirement: recipe.skillRequirement,
      unlockLevel: recipe.unlockLevel,
      goldCost: recipe.goldCost,
      outputItem: recipe.outputItem,
      canCraft: userId ? canCraft : undefined,
    };
  });

  return successResponse({
    recipes: formattedRecipes,
    totalRecipes: formattedRecipes.length,
  });
});
