/**
 * Inventory API
 * v0.18.0 - Manage user cosmetic inventory
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, unauthorizedError } from '@/lib/api-handler';

/**
 * GET /api/inventory
 * Get user's cosmetic inventory
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { 
      id: true,
      equippedTitle: true,
      equippedIcon: true,
      equippedBackground: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  // Build where clause
  const where: any = {
    userId: user.id,
  };

  if (type) {
    where.cosmetic = {
      type: type,
    };
  }

  // Fetch user's cosmetics
  const cosmetics = await prisma.userCosmetic.findMany({
    where,
    include: {
      cosmetic: {
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          type: true,
          rarity: true,
          imageUrl: true,
          metadata: true,
        },
      },
    },
    orderBy: [
      { equipped: 'desc' },
      { cosmetic: { rarity: 'desc' } },
      { purchasedAt: 'desc' },
    ],
  });

  // Group by type
  const groupedByType: Record<string, any[]> = {};
  cosmetics.forEach(item => {
    const type = item.cosmetic.type;
    if (!groupedByType[type]) {
      groupedByType[type] = [];
    }
    groupedByType[type].push({
      id: item.id,
      cosmeticId: item.cosmeticId,
      equipped: item.equipped,
      purchasedAt: item.purchasedAt,
      ...item.cosmetic,
    });
  });

  return successResponse({
    cosmetics: cosmetics.map(item => ({
      id: item.id,
      cosmeticId: item.cosmeticId,
      equipped: item.equipped,
      purchasedAt: item.purchasedAt,
      ...item.cosmetic,
    })),
    grouped: groupedByType,
    equipped: {
      title: user.equippedTitle,
      icon: user.equippedIcon,
      background: user.equippedBackground,
    },
    totalCount: cosmetics.length,
  });
});
