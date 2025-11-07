/**
 * Shop Items API
 * v0.18.0 - List available cosmetic items
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse } from '@/lib/api-handler';

/**
 * GET /api/shop/items
 * List all available cosmetic items
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const rarity = searchParams.get('rarity');
  const limit = parseInt(searchParams.get('limit') || '50');

  // Build where clause
  const where: any = {
    active: true,
  };

  if (type) {
    where.type = type;
  }

  if (rarity) {
    where.rarity = rarity;
  }

  // Fetch cosmetic items
  const items = await prisma.cosmeticItem.findMany({
    where,
    orderBy: [
      { rarity: 'desc' },
      { price: 'asc' },
      { name: 'asc' },
    ],
    take: limit,
  });

  // Get featured items (random selection of 3)
  const featuredItems = await prisma.cosmeticItem.findMany({
    where: { active: true },
    take: 3,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return successResponse({
    items,
    featured: featuredItems,
    totalCount: items.length,
  });
});

