/**
 * Shop Buy API
 * v0.26.2 - Economy Feedback & Shop Loop
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse, validationError, notFoundError, parseBody } from '@/lib/api-handler';
import { logger } from '@/lib/logger';

/**
 * POST /api/shop/buy
 * Purchase a shop item with gold
 * Body: { key: string }
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      funds: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await parseBody<{ key: string }>(req);

  if (!body.key) {
    return validationError('Missing required field: key');
  }

  // Find shop item by key
  const item = await prisma.item.findFirst({
    where: {
      key: body.key,
      isShopItem: true,
    },
  });

  if (!item) {
    return notFoundError(`Shop item not found: ${body.key}`);
  }

  const price = item.goldPrice || 0;

  if (price === 0) {
    return validationError('Item has no price set');
  }

  // Check if user has enough gold (funds field stores gold as Decimal)
  const userGold = Number(user.funds);

  if (userGold < price) {
    return validationError(`Not enough gold. Need ${price}, have ${userGold}`);
  }

  // Check if user already owns this item
  const existingInventory = await prisma.inventoryItem.findUnique({
    where: {
      userId_itemId: {
        userId: user.id,
        itemId: item.id,
      },
    },
  });

  if (existingInventory) {
    // Increase quantity if stackable
    await prisma.inventoryItem.update({
      where: {
        userId_itemId: {
          userId: user.id,
          itemId: item.id,
        },
      },
      data: {
        quantity: { increment: 1 },
      },
    });
  } else {
    // Create new inventory entry
    await prisma.inventoryItem.create({
      data: {
        userId: user.id,
        itemId: item.id,
        quantity: 1,
        equipped: false,
      },
    });
  }

  // Deduct gold (funds field)
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      funds: { decrement: price },
    },
    select: {
      funds: true,
    },
  });

  logger.info(`[Shop] User ${user.id} purchased ${item.name} for ${price} gold`);

  return successResponse({
    success: true,
    message: `Purchased ${item.name}!`,
    item: {
      id: item.id,
      key: item.key,
      name: item.name,
      emoji: item.emoji || item.icon,
    },
    remainingGold: Number(updatedUser.funds),
    pricePaid: price,
  });
});

