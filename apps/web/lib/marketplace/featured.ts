/**
 * Featured Items Management
 * v0.34.3 - Manage featured marketplace items
 */

import { prisma } from '@/lib/db';
import { MAX_FEATURED_ITEMS, MarketItem, MarketItemCategory } from './types';

/**
 * Get all featured items (limited to MAX_FEATURED_ITEMS)
 */
export async function getFeaturedItems(): Promise<MarketItem[]> {
  const items = await prisma.marketItem.findMany({
    where: {
      isFeatured: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: MAX_FEATURED_ITEMS,
  });

  return items.map((item) => ({
    ...item,
    price: Number(item.price),
    createdAt: item.createdAt.toISOString(),
  }));
}

/**
 * Set an item as featured
 */
export async function setItemFeatured(itemId: string, featured: boolean): Promise<void> {
  await prisma.marketItem.update({
    where: { id: itemId },
    data: { isFeatured: featured },
  });
}

/**
 * Rotate featured items (clear old, set new)
 * Used by admin or weekly cron
 */
export async function rotateFeaturedItems(itemIds: string[]): Promise<void> {
  // Limit to MAX_FEATURED_ITEMS
  const limitedIds = itemIds.slice(0, MAX_FEATURED_ITEMS);

  // Clear all current featured items
  await prisma.marketItem.updateMany({
    where: { isFeatured: true },
    data: { isFeatured: false },
  });

  // Set new featured items
  if (limitedIds.length > 0) {
    await prisma.marketItem.updateMany({
      where: { id: { in: limitedIds } },
      data: { isFeatured: true },
    });
  }
}

/**
 * Auto-select featured items based on criteria
 * (e.g., highest rarity, newest, most popular)
 */
export async function autoSelectFeatured(): Promise<string[]> {
  // Get epic/rare items, prioritize recent
  const candidates = await prisma.marketItem.findMany({
    where: {
      OR: [
        { rarity: 'epic' },
        { rarity: 'rare' },
        { isEventItem: true },
      ],
    },
    orderBy: [
      { rarity: 'desc' },
      { createdAt: 'desc' },
    ],
    take: MAX_FEATURED_ITEMS,
    select: { id: true },
  });

  return candidates.map((item) => item.id);
}

/**
 * Get items by category with optional filters
 */
export async function getItemsByCategory(
  category: MarketItemCategory,
  options?: {
    tag?: string | null;
    rarity?: string;
    limit?: number;
  }
): Promise<MarketItem[]> {
  const items = await prisma.marketItem.findMany({
    where: {
      category: category as any,
      ...(options?.tag && { tag: options.tag }),
      ...(options?.rarity && { rarity: options.rarity }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: options?.limit || 50,
  });

  return items.map((item) => ({
    ...item,
    price: Number(item.price),
    createdAt: item.createdAt.toISOString(),
  }));
}

/**
 * Get items with filters
 */
export async function getFilteredItems(filters: {
  category?: MarketItemCategory;
  tag?: string | null;
  isFeatured?: boolean;
  rarity?: string;
  currencyKey?: string;
  limit?: number;
}): Promise<MarketItem[]> {
  const items = await prisma.marketItem.findMany({
    where: {
      ...(filters.category && { category: filters.category as any }),
      ...(filters.tag !== undefined && { tag: filters.tag }),
      ...(filters.isFeatured !== undefined && { isFeatured: filters.isFeatured }),
      ...(filters.rarity && { rarity: filters.rarity }),
      ...(filters.currencyKey && { currencyKey: filters.currencyKey }),
    },
    orderBy: [
      { isFeatured: 'desc' },
      { createdAt: 'desc' },
    ],
    take: filters.limit || 100,
  });

  return items.map((item) => ({
    ...item,
    price: Number(item.price),
    createdAt: item.createdAt.toISOString(),
  }));
}

/**
 * Update item metadata (category, tag)
 */
export async function updateItemMetadata(
  itemId: string,
  metadata: {
    category?: MarketItemCategory;
    tag?: string | null;
    isFeatured?: boolean;
  }
): Promise<void> {
  await prisma.marketItem.update({
    where: { id: itemId },
    data: {
      ...(metadata.category && { category: metadata.category as any }),
      ...(metadata.tag !== undefined && { tag: metadata.tag }),
      ...(metadata.isFeatured !== undefined && { isFeatured: metadata.isFeatured }),
    },
  });
}




