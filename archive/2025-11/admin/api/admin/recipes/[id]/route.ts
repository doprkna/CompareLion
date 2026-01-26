/**
 * Admin Recipe API (Single)
 * PUT /api/admin/recipes/[id] - Update a recipe
 * DELETE /api/admin/recipes/[id] - Delete a recipe
 * v0.36.40 - Materials & Crafting 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody, notFoundError } from '@/lib/api-handler';
import { UpdateRecipeSchema } from '@/lib/crafting/schemas';

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
 * PUT /api/admin/recipes/[id]
 * Update a recipe
 */
export const PUT = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  await requireAdmin();

  const recipe = await prisma.recipe.findUnique({
    where: { id: params.id },
  });

  if (!recipe) {
    return notFoundError('Recipe');
  }

  const body = await parseBody(req);
  const validation = UpdateRecipeSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid recipe data', validation.error.issues);
  }

  const updateData: any = {};

  // Validate output item if being updated
  if (validation.data.outputItemId) {
    const outputItem = await prisma.item.findUnique({
      where: { id: validation.data.outputItemId },
    });
    if (!outputItem) {
      return validationError('Output item not found');
    }
    updateData.outputItemId = validation.data.outputItemId;
  }

  // Validate materials if ingredients are being updated
  if (validation.data.ingredients) {
    const materialIds = validation.data.ingredients.map((ing: any) => ing.materialId);
    const materials = await prisma.material.findMany({
      where: { id: { in: materialIds } },
    });
    if (materials.length !== materialIds.length) {
      return validationError('One or more materials not found');
    }
    updateData.ingredients = validation.data.ingredients;
  }

  // Add other fields
  if (validation.data.name !== undefined) updateData.name = validation.data.name;
  if (validation.data.description !== undefined) updateData.description = validation.data.description;
  if (validation.data.craftTime !== undefined) updateData.craftTime = validation.data.craftTime;
  if (validation.data.skillRequirement !== undefined) updateData.skillRequirement = validation.data.skillRequirement;
  if (validation.data.unlockLevel !== undefined) updateData.unlockLevel = validation.data.unlockLevel;
  if (validation.data.goldCost !== undefined) updateData.goldCost = validation.data.goldCost;

  try {
    const updated = await prisma.recipe.update({
      where: { id: params.id },
      data: updateData,
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
        id: updated.id,
        name: updated.name,
        description: updated.description,
        outputItemId: updated.outputItemId,
        ingredients: updated.ingredients,
        craftTime: updated.craftTime,
        skillRequirement: updated.skillRequirement,
        unlockLevel: updated.unlockLevel,
        goldCost: updated.goldCost,
        isActive: updated.isActive,
        outputItem: updated.outputItem,
      },
    });
  } catch (error) {
    return validationError(
      error instanceof Error ? error.message : 'Failed to update recipe'
    );
  }
});

/**
 * DELETE /api/admin/recipes/[id]
 * Delete a recipe
 */
export const DELETE = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  await requireAdmin();

  const recipe = await prisma.recipe.findUnique({
    where: { id: params.id },
  });

  if (!recipe) {
    return notFoundError('Recipe');
  }

  try {
    await prisma.recipe.delete({
      where: { id: params.id },
    });

    return successResponse({
      success: true,
      message: 'Recipe deleted successfully',
    });
  } catch (error) {
    return validationError(
      error instanceof Error ? error.message : 'Failed to delete recipe'
    );
  }
});

