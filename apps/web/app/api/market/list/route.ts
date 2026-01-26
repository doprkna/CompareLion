/**
 * Market List API - Create a listing
 * v0.36.29 - Marketplace 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { createListing } from '@/lib/services/marketplaceService';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const ListSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().positive().max(1000),
  price: z.number().int().positive().max(99999),
});

/**
 * POST /api/market/list
 * Create a marketplace listing
 * Body: { itemId: string (Item.id), quantity: number, price: number }
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

  const body = await req.json();
  const validation = ListSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request data');
  }

  const { itemId, quantity, price } = validation.data;

  try {
    const listing = await createListing({
      userId: user.id,
      itemId,
      quantity,
      price,
    });

    return successResponse({
      success: true,
      listing: {
        id: listing.id,
        itemId: listing.itemId,
        price: listing.price,
        quantity: listing.quantity,
      },
    });
  } catch (error) {
    return validationError(
      error instanceof Error ? error.message : 'Failed to create listing'
    );
  }
});
