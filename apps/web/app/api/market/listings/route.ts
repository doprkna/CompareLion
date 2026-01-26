/**
 * Marketplace Listings API
 * GET /api/market/listings - List marketplace listings with filters and sorting
 * POST /api/market/listings - Create a new listing
 * v0.36.39 - Marketplace 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { getMarketplaceListings } from '@/lib/services/marketplaceService';
import { createListing } from '@/lib/services/marketplaceService';
import { ListingFiltersSchema, CreateListingSchema } from '@/lib/marketplace/schemas';
import { ListingStatus, CurrencyType } from '@/lib/marketplace/types';

export const runtime = 'nodejs';

/**
 * GET /api/market/listings
 * Get marketplace listings with filters and sorting
 * Query params: category, rarity, minPrice, maxPrice, sellerId, currency, sortBy, limit, cursor
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  
  // Parse and validate filters
  const filters = ListingFiltersSchema.safeParse({
    category: searchParams.get('category') || undefined,
    rarity: searchParams.get('rarity') || undefined,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    sellerId: searchParams.get('sellerId') || undefined,
    currency: searchParams.get('currency') as CurrencyType | undefined,
    sortBy: (searchParams.get('sortBy') || 'newest') as 'price_asc' | 'price_desc' | 'newest' | 'oldest',
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    cursor: searchParams.get('cursor') || undefined,
  });

  if (!filters.success) {
    return validationError('Invalid filter parameters', filters.error.issues);
  }

  const { category, rarity, minPrice, maxPrice, sellerId, currency, sortBy, limit, cursor } = filters.data;

  // Build where clause
  const where: any = {
    status: ListingStatus.ACTIVE,
    // Filter out expired listings
    OR: [
      { expiresAt: null },
      { expiresAt: { gte: new Date() } },
    ],
  };

  if (category) {
    where.item = {
      ...where.item,
      type: category,
    };
  }

  if (rarity) {
    where.item = {
      ...where.item,
      rarity,
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) {
      where.price.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.price.lte = maxPrice;
    }
  }

  if (sellerId) {
    where.sellerId = sellerId;
  }

  if (currency) {
    where.currencyKey = currency;
  }

  // Build orderBy
  const orderBy: any[] = [];
  if (sortBy === 'price_asc') {
    orderBy.push({ price: 'asc' });
  } else if (sortBy === 'price_desc') {
    orderBy.push({ price: 'desc' });
  } else if (sortBy === 'newest') {
    orderBy.push({ createdAt: 'desc' });
  } else if (sortBy === 'oldest') {
    orderBy.push({ createdAt: 'asc' });
  }
  orderBy.push({ createdAt: 'desc' }); // Secondary sort

  try {
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
            description: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
      orderBy,
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
        itemId: listing.itemId,
        quantity: listing.quantity,
        price: listing.price,
        currency: listing.currencyKey,
        status: listing.status,
        createdAt: listing.createdAt.toISOString(),
        expiresAt: listing.expiresAt?.toISOString() || null,
        item: listing.item,
        seller: listing.seller,
      })),
      nextCursor,
      hasMore,
    });
  } catch (error) {
    return validationError('Failed to fetch listings');
  }
});

/**
 * POST /api/market/listings
 * Create a new marketplace listing
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
  const validation = CreateListingSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid listing data', validation.error.issues);
  }

  const { itemId, quantity, price, currency } = validation.data;

  // Check if item is tradable
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: { isTradable: true },
  });

  if (item && item.isTradable === false) {
    return validationError('This item cannot be traded');
  }

  try {
    const listing = await createListing({
      userId: user.id,
      itemId,
      quantity,
      price,
      currency,
    });

    return successResponse({
      listing: {
        id: listing.id,
        itemId: listing.itemId,
        quantity: listing.quantity,
        price: listing.price,
        currency: listing.currencyKey,
        status: listing.status,
        createdAt: listing.createdAt.toISOString(),
        expiresAt: listing.expiresAt?.toISOString() || null,
      },
    });
  } catch (error) {
    return validationError(
      error instanceof Error ? error.message : 'Failed to create listing'
    );
  }
});

