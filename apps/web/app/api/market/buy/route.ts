/**
 * Marketplace Buy API
 * POST /api/market/buy - Purchase a marketplace listing
 * v0.36.39 - Marketplace 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { buyListing } from '@/lib/services/marketplaceService';
import { PurchaseListingSchema } from '@/lib/marketplace/schemas';

export const runtime = 'nodejs';

/**
 * POST /api/market/buy
 * Purchase a marketplace listing
 * Body: { listingId: string, quantity?: number }
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

  const body = await parseBody(req);
  const validation = PurchaseListingSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid purchase data', validation.error.issues);
  }

  const { listingId, quantity } = validation.data;

  try {
    const result = await buyListing({
      userId: user.id,
      listingId,
      quantity,
    });

    return successResponse({
      success: true,
      purchase: {
        listingId: result.listing.id,
        itemId: result.item.id,
        itemName: result.item.name,
        quantity: result.quantity,
        totalPrice: result.totalPrice,
        fee: result.fee,
        sellerProceeds: result.sellerProceeds,
        currency: result.currency,
      },
    });
  } catch (error) {
    return validationError(
      error instanceof Error ? error.message : 'Failed to purchase listing'
    );
  }
});
