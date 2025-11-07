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

/**
 * POST /api/inventory/equip
 * Toggle equip state of an inventory item
 * Body: { inventoryItemId: string, equip: boolean }
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
    equip: boolean;
  }>(req);

  if (!body.inventoryItemId) {
    return validationError('Missing required field: inventoryItemId');
  }

  // Verify ownership
  const inventoryItem = await prisma.inventoryItem.findUnique({
    where: { id: body.inventoryItemId },
    include: {
      item: true,
    },
  });

  if (!inventoryItem) {
    return validationError('Inventory item not found');
  }

  if (inventoryItem.userId !== user.id) {
    return unauthorizedError('Not authorized to modify this item');
  }

  // Update equip state
  const updated = await prisma.inventoryItem.update({
    where: { id: body.inventoryItemId },
    data: {
      equipped: body.equip,
    },
    include: {
      item: true,
      effect: true,
    },
  });

  return successResponse({
    success: true,
    item: {
      id: updated.id,
      equipped: updated.equipped,
      rarity: updated.rarity,
      power: updated.power,
      effectKey: updated.effectKey,
      effect: updated.effect ? {
        name: updated.effect.name,
        description: updated.effect.description,
      } : null,
    },
  });
});
