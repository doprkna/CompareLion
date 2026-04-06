/**
 * Featured Items Management
 * v0.34.3 - Manage featured marketplace items
 */
import { MarketItem, MarketItemCategory } from './types';
/**
 * Get all featured items (limited to MAX_FEATURED_ITEMS)
 */
export declare function getFeaturedItems(): Promise<MarketItem[]>;
/**
 * Set an item as featured
 */
export declare function setItemFeatured(itemId: string, featured: boolean): Promise<void>;
/**
 * Rotate featured items (clear old, set new)
 * Used by admin or weekly cron
 */
export declare function rotateFeaturedItems(itemIds: string[]): Promise<void>;
/**
 * Auto-select featured items based on criteria
 * (e.g., highest rarity, newest, most popular)
 */
export declare function autoSelectFeatured(): Promise<string[]>;
/**
 * Get items by category with optional filters
 */
export declare function getItemsByCategory(category: MarketItemCategory, options?: {
    tag?: string | null;
    rarity?: string;
    limit?: number;
}): Promise<MarketItem[]>;
/**
 * Get items with filters
 */
export declare function getFilteredItems(filters: {
    category?: MarketItemCategory;
    tag?: string | null;
    isFeatured?: boolean;
    rarity?: string;
    currencyKey?: string;
    limit?: number;
}): Promise<MarketItem[]>;
/**
 * Update item metadata (category, tag)
 */
export declare function updateItemMetadata(itemId: string, metadata: {
    category?: MarketItemCategory;
    tag?: string | null;
    isFeatured?: boolean;
}): Promise<void>;
