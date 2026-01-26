/**
 * Admin Recipes API
 * GET /api/admin/recipes - List all recipes
 * POST /api/admin/recipes - Create a new recipe
 * v0.36.40 - Materials & Crafting 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { CreateRecipeSchema } from '@/lib/crafting/schemas';

export const runtime = 'nodejs';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
}

/**
 * GET /api/admin/recipes
 * List all recipes
 */
export const GET = safeAsync(async (req: NextRequest) => {
  await requireAdmin();

  const recipes = await prisma.recipe.findMany({
    include: {
      outputItem: {
        select: {
          id: true,
          name: true,
          rarity: true,
          type: true,
        },
      },
    },
    orderBy: [
      { unlockLevel: 'asc' },
      { name: 'asc' },
    ],
  });

  return successResponse({
    recipes: recipes.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      outputItemId: r.outputItemId,
      ingredients: r.ingredients,
      craftTime: r.craftTime,
      skillRequirement: r.skillRequirement,
      unlockLevel: r.unlockLevel,
      goldCost: r.goldCost,
      isActive: r.isActive,
      outputItem: r.outputItem,
      createdAt: r.createdAt.toISOString(),
    })),
    totalRecipes: recipes.length,
  });
});

/**
 * POST /api/admin/recipes
 * Create a new recipe
 */
export const POST = safeAsync(async (req: NextRequest) => {
  await requireAdmin();

  const body = await parseBody(req);
  const validation = CreateRecipeSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid recipe data', validation.error.issues);
  }

  const {
    name,
    description,
    outputItemId,
    ingredients,
    craftTime,
    skillRequirement,
    unlockLevel,
    goldCost,
  } = validation.data;

  // Verify output item exists
  const outputItem = await prisma.item.findUnique({
    where: { id: outputItemId },
  });

  if (!outputItem) {
    return validationError('Output item not found');
  }

  // Verify all materials exist
  const materialIds = ingredients.map(ing => ing.materialId);
  const materials = await prisma.material.findMany({
    where: { id: { in: materialIds } },
  });

  if (materials.length !== materialIds.length) {
    return validationError('One or more materials not found');
  }

  try {
    const recipe = await prisma.recipe.create({
      data: {
        name,
        description,
        outputItemId,
        ingredients: ingredients as any, // JSON field
        craftTime: craftTime || 0,
        skillRequirement,
        unlockLevel,
        goldCost,
        isActive: true,
      },
      include: {
        outputItem: {
          select: {
            id: true,
            name: true,
            rarity: true,
            type: true,
          },
        },
      },
    });

    return successResponse({
      recipe: {
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
        outputItemId: recipe.outputItemId,
        ingredients: recipe.ingredients,
        craftTime: recipe.craftTime,
        skillRequirement: recipe.skillRequirement,
        unlockLevel: recipe.unlockLevel,
        goldCost: recipe.goldCost,
        isActive: recipe.isActive,
        outputItem: recipe.outputItem,
      },
    });
  } catch (error) {
    return validationError(
      error instanceof Error ? error.message : 'Failed to create recipe'
    );
  }
});

