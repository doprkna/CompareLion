/**
 * Inventory Equip API
 * Equip or unequip an inventory item
 * v0.26.5 - Items 2.0: Rarity, Power & Effects
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { equipUserItem } from '@/lib/services/itemService';

/**
 * POST /api/inventory/equip
 * Equip an item by itemId
 * Enforces slot rules: only 1 item per slot, unequips previous item in same slot
 * Body: { itemId: string }
 * v0.36.34 - Standardized inventory system
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
    itemId: string;
  }>(req);

  if (!body.itemId) {
    return validationError('Missing required field: itemId');
  }

  // Equip the item (will unequip previous item in same slot if any)
  const result = await equipUserItem(user.id, body.itemId);

  return successResponse({
    success: result.success,
    item: result.equippedItem,
    stats: result.stats,
    unequippedItem: result.unequippedItem,
  });
});
