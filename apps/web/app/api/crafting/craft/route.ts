/**
 * Crafting Craft API
 * POST /api/crafting/craft - Craft an item from a recipe
 * v0.36.40 - Materials & Crafting 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { craftItem } from '@/lib/crafting/craftingEngine';
import { CraftItemSchema } from '@/lib/crafting/schemas';

export const runtime = 'nodejs';

/**
 * POST /api/crafting/craft
 * Craft an item from a recipe using materials
 * Body: { recipeId: string, quantity?: number }
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await parseBody(req);
  const validation = CraftItemSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid craft request', validation.error.issues);
  }

  const { recipeId, quantity = 1 } = validation.data;

  try {
    const result = await craftItem(user.id, recipeId, quantity);

    if (!result.success) {
      return validationError(result.message || 'Crafting failed');
    }

    return successResponse({
      success: true,
      outputItemId: result.outputItemId,
      outputItem: result.outputItem,
      materialsConsumed: result.materialsConsumed,
      message: result.message,
    });
  } catch (error) {
    return validationError(
      error instanceof Error ? error.message : 'Failed to craft item'
    );
  }
});

