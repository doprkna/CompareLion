/**
 * Market API - List active listings
 * v0.26.4 - Marketplace Foundations
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, parseQuery } from '@/lib/api-handler';

/**
 * GET /api/market
 * List all active listings with pagination and currency filter
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const currencyKey = searchParams.get('currencyKey');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const where: any = {
    status: 'active',
  };

  if (currencyKey) {
    where.currencyKey = currencyKey;
  }

  const [listings, total] = await Promise.all([
    prisma.marketListing.findMany({
      where,
      include: {
        item: {
          include: {
            item: true, // Item details
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.marketListing.count({ where }),
  ]);

  // Format listings for frontend
  const formatted = listings.map(listing => ({
    id: listing.id,
    price: listing.price,
    currencyKey: listing.currencyKey,
    createdAt: listing.createdAt,
    item: {
      id: listing.item.item.id,
      name: listing.item.item.name,
      emoji: listing.item.item.emoji || listing.item.item.icon || '📦',
      rarity: listing.item.item.rarity,
      type: listing.item.item.type,
      power: listing.item.item.power,
      defense: listing.item.item.defense,
    },
    seller: {
      id: listing.seller.id,
      name: listing.seller.name,
      username: listing.seller.username,
    },
  }));

  return successResponse({
    listings: formatted,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
