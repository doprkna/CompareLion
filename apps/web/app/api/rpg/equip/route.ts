/**
 * RPG Equip API
 * Equip an item from inventory
 * v0.36.3 - Equipment/inventory sync
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { equipItem } from '@/lib/services/itemService';

export const runtime = 'nodejs';

/**
 * POST /api/rpg/equip
 * Equip an inventory item
 * Body: { inventoryItemId: string }
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

  const body = await parseBody<{
    inventoryItemId: string;
  }>(req);

  if (!body.inventoryItemId) {
    return validationError('Missing required field: inventoryItemId');
  }

  // Equip the item
  const result = await equipItem(user.id, body.inventoryItemId);

  // Get updated inventory
  const inventory = await prisma.inventoryItem.findMany({
    where: { userId: user.id },
    include: {
      item: true,
    },
    orderBy: [
      { equipped: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return successResponse({
    success: result.success,
    equippedItem: result.equippedItem,
    unequippedItem: result.unequippedItem,
    stats: result.stats,
    inventory: inventory.map(ii => ({
      id: ii.id,
      itemId: ii.itemId,
      equipped: ii.equipped,
      rarity: ii.rarity,
      power: ii.power,
      item: {
        id: ii.item.id,
        name: ii.item.name,
        type: ii.item.type,
        emoji: ii.item.emoji,
        icon: ii.item.icon,
      },
    })),
  });
});

