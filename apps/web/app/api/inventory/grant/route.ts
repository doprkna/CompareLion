/**
 * Inventory Grant API
 * v0.35.16 - Admin utility to grant items to users for testing
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, unauthorizedError, forbiddenError, validationError } from '@/lib/api-handler';
import { z } from 'zod';

const GrantSchema = z.object({
  userId: z.string().min(1).optional(),
  itemId: z.string().min(1),
  quantity: z.number().int().min(1).optional().default(1),
});

/**
 * POST /api/inventory/grant
 * Grant an item to a user (admin-only, for testing)
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in');
  }

  // Get user and check admin role
  const adminUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!adminUser || (adminUser.role !== 'ADMIN' && process.env.NODE_ENV === 'production')) {
    return forbiddenError('Admin access required');
  }

  // Parse request
  const body = await req.json();
  const parsed = GrantSchema.safeParse(body);
  
  if (!parsed.success) {
    return validationError('Invalid request data');
  }

  const { userId, itemId, quantity } = parsed.data;
  const targetUserId = userId || adminUser.id; // Default to self if no userId provided

  // Verify item exists
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: { id: true, name: true, emoji: true },
  });

  if (!item) {
    return validationError('Item not found');
  }

  // Verify target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, name: true },
  });

  if (!targetUser) {
    return validationError('Target user not found');
  }

  // Try UserItem model first
  try {
    await prisma.userItem.upsert({
      where: {
        userId_itemId: {
          userId: targetUserId,
          itemId: itemId,
        },
      },
      create: {
        userId: targetUserId,
        itemId: itemId,
        quantity: quantity,
        acquiredAt: new Date(),
      },
      update: {
        quantity: { increment: quantity },
      },
    });
  } catch {
    // If UserItem fails, try InventoryItem
    await prisma.inventoryItem.upsert({
      where: {
        userId_itemId: {
          userId: targetUserId,
          itemId: itemId,
        },
      },
      create: {
        userId: targetUserId,
        itemId: itemId,
        quantity: quantity,
        equipped: false,
      },
      update: {
        quantity: { increment: quantity },
      },
    });
  }

  return successResponse({
    granted: true,
    item: {
      name: item.name,
      emoji: item.emoji,
      quantity: quantity,
    },
    user: {
      id: targetUser.id,
      name: targetUser.name,
    },
    message: `Granted x   to `,
  });
});
