/**
 * Market Items API
 * v0.34.3 - Public endpoint with category/tag/featured filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { safeAsync, successResponse, validationError } from '@/lib/api-handler';
import { getFilteredItems } from '@/lib/marketplace/featured';
import { MarketItemCategory } from '@/lib/marketplace/types';

/**
 * GET /api/market/items
 * Returns market items with optional filters
 * Query params: category, tag, isFeatured, rarity, currencyKey, limit
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const category = searchParams.get('category') as MarketItemCategory | null;
  const tag = searchParams.get('tag');
  const isFeaturedParam = searchParams.get('isFeatured');
  const rarity = searchParams.get('rarity');
  const currencyKey = searchParams.get('currencyKey');
  const limitParam = searchParams.get('limit');

  // Validate category
  const validCategories = ['item', 'cosmetic', 'booster', 'utility', 'social'];
  if (category && !validCategories.includes(category)) {
    return validationError('Invalid category', [
      { message: `Category must be one of: ${validCategories.join(', ')}` },
    ]);
  }

  // Parse isFeatured
  const isFeatured = isFeaturedParam === 'true' ? true : isFeaturedParam === 'false' ? false : undefined;

  // Parse limit
  const limit = limitParam ? parseInt(limitParam, 10) : 100;
  if (isNaN(limit) || limit < 1 || limit > 500) {
    return validationError('Invalid limit', [
      { message: 'Limit must be between 1 and 500' },
    ]);
  }

  // Get filtered items
  const items = await getFilteredItems({
    category: category || undefined,
    tag: tag || undefined,
    isFeatured,
    rarity: rarity || undefined,
    currencyKey: currencyKey || undefined,
    limit,
  });

  return successResponse({
    items,
    count: items.length,
    filters: {
      category: category || null,
      tag: tag || null,
      isFeatured: isFeatured ?? null,
      rarity: rarity || null,
      currencyKey: currencyKey || null,
    },
  });
});
