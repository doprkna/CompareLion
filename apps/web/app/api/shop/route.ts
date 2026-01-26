import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { safeAsync } from "@/lib/api-handler";
import { buildSuccess } from '@parel/api';
import type { ShopItemDTO, ShopResponseDTO } from '@parel/types/dto';

/**
 * GET /api/shop
 * Fetch all available shop items for purchase
 * v0.26.2 - Economy Feedback & Shop Loop
 * v0.41.4 - C3 Step 5: Unified API envelope
 * v0.41.9 - C3 Step 10: DTO Consolidation Batch #2
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
  const shopItems: ShopItemDTO[] = items.map(item => ({
    id: item.id,
    key: item.key,
    name: item.name,
    emoji: item.emoji || item.icon || 'dY"���',
    description: item.description,
    price: item.goldPrice || 0,
    rarity: item.rarity,
    type: item.type,
    power: item.power,
    defense: item.defense,
  }));

  const response: ShopResponseDTO = {
    items: shopItems,
    count: shopItems.length,
  };

  return buildSuccess(req, response);
});
