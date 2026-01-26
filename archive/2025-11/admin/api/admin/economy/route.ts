/**
 * Admin Economy Dashboard API
 * v0.36.14 - Economy Sanity Pass
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { UserRole } from '@parel/db/client';

export const runtime = 'nodejs';

/**
 * GET /api/admin/economy
 * Returns economy statistics for admin dashboard
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return unauthorizedError('Admin access required');
  }

  // Total gold in circulation (sum of all user funds)
  const totalGoldResult = await prisma.user.aggregate({
    _sum: {
      funds: true,
    },
  });
  const totalGold = Number(totalGoldResult._sum.funds || 0);

  // Average gold per user
  const userCount = await prisma.user.count();
  const avgGoldPerUser = userCount > 0 ? Math.floor(totalGold / userCount) : 0;

  // Top 10 richest players
  const topRichUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      funds: true,
    },
    orderBy: {
      funds: 'desc',
    },
    take: 10,
  });

  // Total items sold in marketplace
  const totalItemsSold = await prisma.marketListing.count({
    where: {
      status: 'sold',
    },
  });

  // Total potions purchased (items with type='consumable' in inventory)
  const potionKeys = ['health_potion_small', 'health_potion_medium', 'power_potion'];
  const potionItems = await prisma.item.findMany({
    where: {
      key: { in: potionKeys },
    },
    select: { id: true },
  });
  const potionItemIds = potionItems.map(item => item.id);
  
  const totalPotionsPurchased = await prisma.inventoryItem.aggregate({
    where: {
      itemId: { in: potionItemIds },
    },
    _sum: {
      quantity: true,
    },
  });

  return successResponse({
    totalGold,
    avgGoldPerUser,
    userCount,
    topRichUsers: topRichUsers.map(user => ({
      id: user.id,
      name: user.name || user.email,
      gold: Number(user.funds || 0),
    })),
    totalItemsSold,
    totalPotionsPurchased: Number(totalPotionsPurchased._sum.quantity || 0),
  });
});

