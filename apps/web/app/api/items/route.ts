/**
 * Items API
 * v0.35.16c - Admin sees all items, users see shop items only
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse } from '@/lib/api-handler';
import { isAdminViewServer } from '@/lib/utils/isAdminViewServer';

// Force Node.js runtime (uses NextAuth session)
export const runtime = 'nodejs';

/**
 * GET /api/items
 * Fetch shop items (admin sees all items for verification)
 * v0.35.17 - Region filtering support
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const isAdmin = await isAdminViewServer();
  const { searchParams } = new URL(req.url);
  const region = searchParams.get('region');
  
  // Admin/dev sees ALL items (for verification)
  // Regular users see only shop items, optionally filtered by region
  const where: any = isAdmin ? {} : { isShopItem: true };
  
  // Add region filter if provided (only for non-admin or if admin wants to filter)
  if (region && !isAdmin) {
    where.OR = [
      { region: region },
      { region: null }, // Include global items
    ];
  }
  
  const items = await prisma.item.findMany({
    where,
    select: {
      id: true,
      key: true,
      name: true,
      emoji: true,
      icon: true,
      rarity: true,
      goldPrice: true,
      isShopItem: true,
      description: true,
      type: true,
      power: true,
      defense: true,
      region: true,
    },
    orderBy: [
      { rarity: 'desc' },
      { goldPrice: 'asc' },
      { name: 'asc' },
    ],
  });

  return successResponse({
    items: items.map(item => ({
      id: item.id,
      key: item.key,
      name: item.name,
      emoji: item.emoji || item.icon || 'ðŸ"¦',
      icon: item.icon || item.emoji || 'ðŸ"¦',
      description: item.description,
      goldPrice: item.goldPrice || 0,
      rarity: item.rarity,
      type: item.type,
      power: item.power,
      defense: item.defense,
      isShopItem: item.isShopItem,
      region: item.region,
    })),
    count: items.length,
    isAdminView: isAdmin,
    filterRegion: region,
  });
});
