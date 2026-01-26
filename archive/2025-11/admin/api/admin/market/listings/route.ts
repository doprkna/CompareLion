/**
 * Admin Marketplace Listings API
 * GET /api/admin/market/listings - List all listings (with filters)
 * v0.36.39 - Marketplace 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, forbiddenError, successResponse } from '@/lib/api-handler';
import { ListingStatus } from '@/lib/marketplace/types';

export const runtime = 'nodejs';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
}

/**
 * GET /api/admin/market/listings
 * List all marketplace listings (admin view)
 * Query params: status, sellerId, limit, cursor
 */
export const GET = safeAsync(async (req: NextRequest) => {
  await requireAdmin();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') as ListingStatus | null;
  const sellerId = searchParams.get('sellerId') || undefined;
  const limit = parseInt(searchParams.get('limit') || '50');
  const cursor = searchParams.get('cursor') || undefined;

  const where: any = {};
  
  if (status && Object.values(ListingStatus).includes(status)) {
    where.status = status;
  }
  
  if (sellerId) {
    where.sellerId = sellerId;
  }

  const listings = await prisma.marketListing.findMany({
    where,
    include: {
      item: {
        select: {
          id: true,
          name: true,
          emoji: true,
          icon: true,
          rarity: true,
          type: true,
        },
      },
      seller: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
        },
      },
      buyer: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
  });

  const hasMore = listings.length > limit;
  const items = hasMore ? listings.slice(0, limit) : listings;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return successResponse({
    listings: items.map(listing => ({
      id: listing.id,
      sellerId: listing.sellerId,
      buyerId: listing.buyerId,
      itemId: listing.itemId,
      quantity: listing.quantity,
      price: listing.price,
      currency: listing.currencyKey,
      status: listing.status,
      createdAt: listing.createdAt.toISOString(),
      expiresAt: listing.expiresAt?.toISOString() || null,
      item: listing.item,
      seller: listing.seller,
      buyer: listing.buyer,
    })),
    nextCursor,
    hasMore,
  });
});

