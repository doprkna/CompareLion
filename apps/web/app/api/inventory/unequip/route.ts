/**
 * Inventory Unequip API
 * Unequip an item by itemId
 * v0.36.34 - Standardized inventory system
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { unequipUserItem } from '@/lib/services/itemService';

export const runtime = 'nodejs';

/**
 * POST /api/inventory/unequip
 * Unequip an item by itemId
 * Body: { itemId: string }
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

  // Unequip the item
  const result = await unequipUserItem(user.id, body.itemId);

  return successResponse({
    success: result.success,
    item: result.unequippedItem,
    stats: result.stats,
  });
});

