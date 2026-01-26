/**
 * Market User API - Get user's listings and trade history
 * v0.36.29 - Marketplace 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { getUserMarketplaceData } from '@/lib/services/marketplaceService';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { prisma } from '@/lib/db';

/**
 * GET /api/market/user
 * Get user's listings and trade history
 */
export const GET = safeAsync(async (req: NextRequest) => {
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

  const data = await getUserMarketplaceData(user.id);

  return successResponse({
    listings: data.listings.map(listing => ({
      id: listing.id,
      itemId: listing.itemId,
      price: listing.price,
      quantity: listing.quantity,
      status: listing.status,
      createdAt: listing.createdAt,
      item: {
        id: listing.item.id,
        name: listing.item.name,
        emoji: listing.item.emoji || listing.item.icon || '📦',
        icon: listing.item.icon || listing.item.emoji || '📦',
        rarity: listing.item.rarity,
        type: listing.item.type,
      },
    })),
    trades: data.trades.map(trade => ({
      id: trade.id,
      type: trade.type,
      itemId: trade.itemId,
      quantity: trade.quantity,
      price: trade.price,
      createdAt: trade.createdAt,
      item: {
        id: trade.item.id,
        name: trade.item.name,
        emoji: trade.item.emoji || trade.item.icon || '📦',
        icon: trade.item.icon || trade.item.emoji || '📦',
      },
    })),
  });
});

