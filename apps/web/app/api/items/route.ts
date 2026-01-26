/**
 * Items API
 * v0.35.16c - Admin sees all items, users see shop items only
 * v0.41.4 - C3 Step 5: Unified API envelope
 * v0.41.9 - C3 Step 10: DTO Consolidation Batch #2
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';
import { buildSuccess } from '@parel/api';
import type { ItemDTO, ItemsResponseDTO } from '@parel/types/dto';
import { isAdminViewServer } from '@parel/core/utils/isAdminViewServer';

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

  const formattedItems: ItemDTO[] = items.map(item => ({
    id: item.id,
    key: item.key,
    name: item.name,
    emoji: item.emoji || item.icon || 'dY"���',
    icon: item.icon || item.emoji || 'dY"���',
    description: item.description,
    goldPrice: item.goldPrice || 0,
    rarity: item.rarity,
    type: item.type,
    power: item.power,
    defense: item.defense,
    isShopItem: item.isShopItem,
    region: item.region,
  }));

  const response: ItemsResponseDTO = {
    items: formattedItems,
    count: formattedItems.length,
    isAdminView: isAdmin,
    filterRegion: region,
  };

  return buildSuccess(req, response);
});
