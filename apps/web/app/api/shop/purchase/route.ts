/**
 * Shop Purchase API
 * v0.18.0 - Purchase cosmetic items
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, validationError, unauthorizedError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';
import { spendCoins } from '@/lib/economy-service';

const PurchaseSchema = z.object({
  itemId: z.string(),
});

/**
 * POST /api/shop/purchase
 * Purchase a cosmetic item
 */
export const POST = safeAsync(async (req: NextRequest) => {
  // Get authenticated session
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in to purchase items');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { 
      id: true, 
      coins: true,
      cosmetics: {
        select: {
          cosmeticId: true,
        },
      },
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Parse and validate request
  const body = await req.json();
  const validation = PurchaseSchema.safeParse(body);

  if (!validation.success) {
    return validationError(
      validation.error.issues[0]?.message || 'Invalid purchase data'
    );
  }

  const { itemId } = validation.data;

  // Find cosmetic item
  const item = await prisma.cosmeticItem.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      name: true,
      price: true,
      active: true,
      slug: true,
      type: true,
    },
  });

  if (!item) {
    return notFoundError('Item not found');
  }

  if (!item.active) {
    return validationError('This item is no longer available');
  }

  // Check if user already owns this item
  const alreadyOwned = user.cosmetics.some(c => c.cosmeticId === itemId);
  if (alreadyOwned) {
    return validationError('You already own this item');
  }

  // Check if user can afford the item
  if (user.coins < item.price) {
    return validationError(
      `Insufficient coins. Need ${item.price}, have ${user.coins}`
    );
  }

  // Spend coins
  const spendResult = await spendCoins(user.id, item.price, item.name);
  
  if (!spendResult.success) {
    return validationError(spendResult.error || 'Purchase failed');
  }

  // Add item to user's inventory
  const userCosmetic = await prisma.userCosmetic.create({
    data: {
      userId: user.id,
      cosmeticId: itemId,
      equipped: false,
    },
    include: {
      cosmetic: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          rarity: true,
          imageUrl: true,
        },
      },
    },
  });

  // Create notification (fire and forget, don't block purchase)
  prisma.notification.create({
    data: {
      userId: user.id,
      title: 'Purchase Successful! 🎉',
      message: `You purchased "${item.name}" for ${item.price} coins.`,
      type: 'success',
      read: false,
    },
  }).catch(() => {
    // Silently fail - notification is not critical
  });

  return successResponse({
    message: `Successfully purchased ${item.name}!`,
    item: userCosmetic.cosmetic,
    remainingCoins: spendResult.remainingCoins,
  });
});

