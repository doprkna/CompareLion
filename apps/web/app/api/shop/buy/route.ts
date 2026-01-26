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
import { equipCompanion } from '@/lib/rpg/companion';

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

  // Handle companion items differently (v0.36.20 - Unified companion system)
  if (item.type === 'companion') {
    // Find companion by name (matching item name)
    const companion = await prisma.companion.findFirst({
      where: {
        name: item.name,
      },
    });

    if (!companion) {
      return notFoundError('Companion data not found');
    }

    // Check if user already owns this companion
    const existingUserCompanion = await prisma.userCompanion.findFirst({
      where: {
        userId: user.id,
        companionId: companion.id,
      },
    });

    if (existingUserCompanion) {
      return validationError('You already own this companion');
    }

    // Deduct gold
    await prisma.user.update({
      where: { id: user.id },
      data: {
        funds: { decrement: price },
      },
    });

    // Create UserCompanion entry
    const userCompanion = await prisma.userCompanion.create({
      data: {
        userId: user.id,
        companionId: companion.id,
        level: 1,
        xp: 0,
        equipped: false,
      },
    });

    // Auto-equip if user has no equipped companion
    const hasEquipped = await prisma.userCompanion.findFirst({
      where: {
        userId: user.id,
        equipped: true,
      },
    });

    if (!hasEquipped) {
      try {
        await equipCompanion(user.id, userCompanion.id);
        logger.info(`[Shop] Auto-equipped ${companion.name} for user ${user.id}`);
      } catch (error) {
        logger.warn(`[Shop] Failed to auto-equip companion`, error);
        // Don't fail purchase if auto-equip fails
      }
    }

    logger.info(`[Shop] User ${user.id} purchased companion ${companion.name} for ${price} gold`);

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { funds: true },
    });

    return successResponse({
      success: true,
      message: `Purchased ${companion.name}!`,
      item: {
        id: item.id,
        key: item.key,
        name: item.name,
        emoji: item.emoji || item.icon,
        type: 'companion',
      },
      companion: {
        id: userCompanion.id,
        name: companion.name,
        icon: companion.icon,
        autoEquipped: !hasEquipped,
      },
      remainingGold: Number(updatedUser?.funds || 0),
      pricePaid: price,
    });
  }

  // Handle regular items
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

