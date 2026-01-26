/**
 * Marketplace List API - Create a listing
 * v0.36.4 - Marketplace listing + buying flow
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { listItem } from '@/lib/services/marketService';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';

export const runtime = 'nodejs';

/**
 * POST /api/marketplace/list
 * Create a marketplace listing
 * Body: { itemId: string (inventoryItemId), price: number, currencyKey: string }
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
    itemId: string; // inventoryItemId or UserItem.itemId
    price: number;
    currencyKey: string;
    quantity?: number; // Optional: quantity to list (for stackable items)
  }>(req);

  if (!body.itemId || body.price === undefined || !body.currencyKey) {
    return validationError('Missing required fields: itemId, price, currencyKey');
  }

  if (body.price <= 0) {
    return validationError('Price must be greater than 0');
  }

  if (!['gold', 'diamonds'].includes(body.currencyKey)) {
    return validationError('Invalid currencyKey. Must be "gold" or "diamonds"');
  }

  // Check if item is tradable (v0.36.34)
  const item = await prisma.item.findUnique({
    where: { id: body.itemId },
    select: { isTradable: true },
  });

  if (item && item.isTradable === false) {
    return validationError('This item cannot be traded');
  }

  // Check if user owns the item and it's not equipped
  const userItem = await prisma.userItem.findUnique({
    where: {
      userId_itemId: {
        userId: user.id,
        itemId: body.itemId,
      },
    },
  });

  if (!userItem) {
    return validationError('Item not found in inventory');
  }

  if (userItem.equipped) {
    return validationError('Cannot list equipped items');
  }

  const quantityToList = body.quantity || 1;
  if (quantityToList > userItem.quantity) {
    return validationError('Insufficient quantity');
  }

  try {
    const listing = await listItem({
      userId: user.id,
      inventoryItemId: body.itemId, // Note: Still uses inventoryItemId for now, will migrate later
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

