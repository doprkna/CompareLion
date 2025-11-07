import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { safeAsync, successResponse } from "@/lib/api-handler";

/**
 * GET /api/shop
 * Fetch all available shop items for purchase
 * v0.26.2 - Economy Feedback & Shop Loop
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const items = await prisma.item.findMany({
    where: {
      isShopItem: true,
    },
    orderBy: [
      { rarity: 'desc' },
      { goldPrice: 'asc' },
      { name: 'asc' },
    ],
  });

  // Format items with display info
  const shopItems = items.map(item => ({
    id: item.id,
    key: item.key,
    name: item.name,
    emoji: item.emoji || item.icon || '📦',
    description: item.description,
    price: item.goldPrice || 0,
    rarity: item.rarity,
    type: item.type,
    power: item.power,
    defense: item.defense,
  }));

  return successResponse({
    items: shopItems,
    count: shopItems.length,
  });
});



