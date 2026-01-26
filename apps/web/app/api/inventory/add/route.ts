/**
 * Inventory Add API (Internal)
 * Add items to user inventory (used by loot system)
 * v0.36.34 - Standardized inventory system
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { addItemToInventory } from '@/lib/services/itemService';
import { isAdminViewServer } from '@parel/core/utils/isAdminViewServer';

export const runtime = 'nodejs';

/**
 * POST /api/inventory/add
 * Add item(s) to user inventory (internal use, admin or system only)
 * Body: { userId?: string, itemId: string, quantity?: number }
 * If userId not provided, uses authenticated user
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const isAdmin = await isAdminViewServer();

  // Only allow admin or authenticated users (for internal system calls)
  if (!isAdmin && !session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const body = await parseBody<{
    userId?: string;
    itemId: string;
    quantity?: number;
  }>(req);

  if (!body.itemId) {
    return validationError('Missing required field: itemId');
  }

  // Determine target user
  let targetUserId: string;
  if (body.userId && isAdmin) {
    // Admin can add items to any user
    targetUserId = body.userId;
  } else if (session?.user?.email) {
    // Regular user can only add to themselves
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return unauthorizedError('User not found');
    }
    targetUserId = user.id;
  } else {
    return unauthorizedError('User not found');
  }

  // Verify item exists
  const item = await prisma.item.findUnique({
    where: { id: body.itemId },
  });

  if (!item) {
    return validationError('Item not found');
  }

  // Add item to inventory
  const quantity = body.quantity || 1;
  const result = await addItemToInventory(targetUserId, body.itemId, quantity);

  return successResponse({
    success: true,
    userId: targetUserId,
    itemId: body.itemId,
    itemName: item.name,
    quantity: result.quantity,
    message: `Added ${quantity}x ${item.name} to inventory`,
  });
});

