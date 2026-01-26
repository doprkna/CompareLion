/**
 * Market API - List active listings
 * v0.36.29 - Marketplace 2.0
 * v0.41.10 - C3 Step 11: DTO Consolidation Batch #3
 * v0.41.4 - C3 Step 5: Unified API envelope
 */

import { NextRequest } from 'next/server';
import { safeAsync } from '@/lib/api-handler';
import { buildSuccess, buildError, ApiErrorCode } from '@parel/api';
import type { MarketListingDTO, MarketResponseDTO } from '@parel/types/dto';
import { getMarketplaceListings } from '@/lib/services/marketplaceService';

/**
 * GET /api/market
 * List all active listings with cursor pagination, sorting, and filters
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor') || undefined;
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
  const sort = (searchParams.get('sort') || 'price_asc') as 'price_asc' | 'price_desc' | 'newest';
  const category = searchParams.get('category') || undefined;
  const itemId = searchParams.get('itemId') || undefined;

  if (!['price_asc', 'price_desc', 'newest'].includes(sort)) {
    return buildError(req, ApiErrorCode.VALIDATION_ERROR, 'Invalid sort parameter');
  }

  const result = await getMarketplaceListings({
    cursor,
    limit,
    sort,
    category,
    itemId,
  });

  // Anonymize seller names
  const formatted: MarketListingDTO[] = result.listings.map(listing => ({
    id: listing.id,
    price: listing.price,
    quantity: listing.quantity,
    createdAt: listing.createdAt,
    item: {
      id: listing.item.id,
      name: listing.item.name,
      emoji: listing.item.emoji || listing.item.icon || 'dY"�',
      icon: listing.item.icon || listing.item.emoji || 'dY"�',
      rarity: listing.item.rarity,
      type: listing.item.type,
      description: listing.item.description,
    },
    seller: {
      id: listing.seller.id,
      name: Player, // Anonymized
      username: listing.seller.username ? Player : undefined,
    },
  }));

  const response: MarketResponseDTO = {
    listings: formatted,
    nextCursor: result.nextCursor,
  };

  return buildSuccess(req, response);
});

