/**
 * Buy Companion API
 * v0.36.17 - Companions + Pets System v0.1
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, successResponse, validationError, notFoundError, parseBody } from '@/lib/api-handler';
import { prisma } from '@/lib/db';
import { equipCompanion } from '@/lib/rpg/companion';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

/**
 * POST /api/companion/buy
 * Purchase a companion from shop
 * Body: { companionKey: string }
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

  const body = await parseBody<{ companionKey: string }>(req);

  if (!body.companionKey) {
    return validationError('Missing required field: companionKey');
  }

  // Find companion item in shop
  const item = await prisma.item.findFirst({
    where: {
      key: body.companionKey,
      type: 'companion',
      isShopItem: true,
    },
  });

  if (!item) {
    return notFoundError(`Companion not found: ${body.companionKey}`);
  }

  const price = item.goldPrice || 0;

  if (price === 0) {
    return validationError('Companion has no price set');
  }

  // Check if user has enough gold
  const userGold = Number(user.funds || 0);

  if (userGold < price) {
    return validationError(`Not enough gold. Need ${price}, have ${userGold}`);
  }

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

  // Auto-equip if user has no equipped companion (v0.36.17)
  const hasEquipped = await prisma.userCompanion.findFirst({
    where: {
      userId: user.id,
      equipped: true,
    },
  });

  if (!hasEquipped) {
    try {
      await equipCompanion(user.id, userCompanion.id);
      logger.info(`[Companion] Auto-equipped ${companion.name} for user ${user.id}`);
    } catch (error) {
      logger.warn(`[Companion] Failed to auto-equip companion`, error);
      // Don't fail purchase if auto-equip fails
    }
  }

  logger.info(`[Companion] User ${user.id} purchased companion ${companion.name} for ${price} gold`);

  return successResponse({
    success: true,
    message: `Purchased ${companion.name}!`,
    companion: {
      id: userCompanion.id,
      name: companion.name,
      icon: companion.icon,
      autoEquipped: !hasEquipped,
    },
    remainingGold: userGold - price,
    pricePaid: price,
  });
});


