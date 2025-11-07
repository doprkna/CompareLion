/**
 * Market List API - Create a listing
 * v0.26.4 - Marketplace Foundations
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { listItem } from '@/lib/services/marketService';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';

/**
 * POST /api/market/list
 * Create a marketplace listing
 * Body: { itemId: string (inventoryItemId), price: number, currencyKey: string }
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await import('@/lib/db').then(m => m.prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  }));

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await parseBody<{
    itemId: string; // inventoryItemId
    price: number;
    currencyKey: string;
  }>(req);

  if (!body.itemId || !body.price || !body.currencyKey) {
    return validationError('Missing required fields: itemId, price, currencyKey');
  }

  if (body.price <= 0) {
    return validationError('Price must be greater than 0');
  }

  try {
    const listing = await listItem({
      userId: user.id,
      inventoryItemId: body.itemId,
      price: body.price,
      currencyKey: body.currencyKey,
    });

    return successResponse({
      success: true,
      listing: {
        id: listing.id,
        price: listing.price,
        currencyKey: listing.currencyKey,
      },
    });
  } catch (error) {
    return validationError(
      error instanceof Error ? error.message : 'Failed to create listing'
    );
  }
});
