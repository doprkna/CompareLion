import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse } from '@/lib/api-handler';

/**
 * GET /api/items/recipes
 * Available recipes
 * Public endpoint (but can filter by user if authenticated)
 * v0.29.20 - Item Ecosystem Expansion
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get('itemId');
  const includeDiscovered = searchParams.get('includeDiscovered') === 'true';

  let userId: string | undefined;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    userId = user?.id;
  }

  // Build where clause
  const where: any = {};
  if (itemId) {
    where.itemId = itemId;
  }

  // If user is authenticated and includeDiscovered is true, include user-discovered recipes
  if (userId && includeDiscovered) {
    // Include both default recipes (discoveredBy is null) and user-discovered recipes
    where.OR = [
      { discoveredBy: null },
      { discoveredBy: userId },
    ];
  } else {
    // Only default recipes
    where.discoveredBy = null;
  }

  // Get recipes
  const recipes = await prisma.itemRecipe.findMany({
    where,
    include: {
      item: {
        select: {
          id: true,
          name: true,
          type: true,
          rarity: true,
          description: true,
          icon: true,
          emoji: true,
          category: true,
          isCraftable: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return successResponse({
    recipes: recipes.map((r) => ({
      id: r.id,
      itemId: r.itemId,
      item: r.item,
      ingredients: r.ingredients,
      craftTime: r.craftTime,
      xpReward: r.xpReward,
      discoveredBy: r.discoveredBy,
      createdAt: r.createdAt,
    })),
    total: recipes.length,
  });
});

