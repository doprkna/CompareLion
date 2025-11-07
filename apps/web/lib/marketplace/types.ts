/**
 * Marketplace Types - Generated from Prisma
 * Use '@parel/db/generated' for MarketItem schema
 */
import { MarketItemSchema } from '@parel/db/generated';
import { z } from 'zod';

// Generated type from Prisma
export type MarketItem = z.infer<typeof MarketItemSchema>;

// UI-specific types (not in Prisma schema)
export type MarketItemCategory = 'item' | 'cosmetic' | 'booster' | 'utility' | 'social';
export type MarketItemTag = 'featured' | 'limited' | 'weekly' | null;

export interface MarketItemFilter {
  category?: MarketItemCategory;
  tag?: MarketItemTag;
  isFeatured?: boolean;
  rarity?: string;
  currencyKey?: string;
}

export interface FeaturedItem extends MarketItem {
  featuredOrder?: number;
  featuredUntil?: Date | string;
}

// Category display metadata (UI-only)
export const CATEGORY_META: Record<MarketItemCategory, { label: string; icon: string; description: string }> = {
  item: {
    label: 'Items',
    icon: 'ðŸ“¦',
    description: 'General items and consumables',
  },
  cosmetic: {
    label: 'Cosmetics',
    icon: 'âœ¨',
    description: 'Avatar items, badges, and visual upgrades',
  },
  booster: {
    label: 'Boosters',
    icon: 'ðŸš€',
    description: 'XP and gold multipliers',
  },
  utility: {
    label: 'Utilities',
    icon: 'ðŸ› ï¸',
    description: 'Functional items and tools',
  },
  social: {
    label: 'Social',
    icon: 'ðŸ‘¥',
    description: 'Social features and emotes',
  },
};

// Tag display metadata (UI-only)
export const TAG_META: Record<string, { label: string; color: string; description: string }> = {
  featured: {
    label: 'Featured',
    color: 'purple',
    description: 'Highlighted this week',
  },
  limited: {
    label: 'Limited',
    color: 'orange',
    description: 'Available for a limited time',
  },
  weekly: {
    label: 'Weekly Special',
    color: 'blue',
    description: "This week's special offer",
  },
};

export const MAX_FEATURED_ITEMS = 5;
