/**
 * Marketplace Buy API - Purchase an item
 * v0.36.4 - Marketplace listing + buying flow
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { buyItem } from '@/lib/services/marketService';
import { updateHeroStats } from '@/lib/services/progressionService';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';

export const runtime = 'nodejs';

/**
 * POST /api/marketplace/buy
 * Buy an item from marketplace
 * Body: { listingId: string }
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
    listingId: string;
  }>(req);

  if (!body.listingId) {
    return validationError('Missing required field: listingId');
  }

  try {
    // Buy the item
    const result = await buyItem({
      userId: user.id,
      listingId: body.listingId,
    });

    // Update hero stats if item is equipable (has power/rarity)
    if (result.item.power || result.item.rarity) {
      await updateHeroStats(user.id);
    }

    return successResponse({
      success: true,
      item: result.item,
      sellerProceeds: result.sellerProceeds,
      fee: result.fee,
    });
  } catch (error) {
    return validationError(
      error instanceof Error ? error.message : 'Failed to buy item'
    );
  }
});

