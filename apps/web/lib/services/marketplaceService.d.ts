/**
 * Marketplace Service 2.0
 * Full buy/sell marketplace with listings, trades, inventory sync
 * v0.36.29 - Marketplace 2.0
 */
import { CurrencyType } from '@/lib/marketplace/types';
export interface CreateListingParams {
    userId: string;
    itemId: string;
    quantity: number;
    price: number;
    currency?: CurrencyType;
}
export interface BuyListingParams {
    userId: string;
    listingId: string;
    quantity?: number;
}
/**
 * Create a marketplace listing
 * Validates ownership, checks limits, reserves items
 */
export declare function createListing(params: CreateListingParams): Promise<any>;
/**
 * Buy from a marketplace listing
 * Handles stock reduction, gold transfer, inventory updates, trade logging
 */
export declare function buyListing(params: BuyListingParams): Promise<any>;
/**
 * Cancel a listing and restore items to seller inventory
 */
export declare function cancelListing(listingId: string, userId: string): Promise<{
    success: boolean;
}>;
/**
 * Get paginated marketplace listings
 */
export declare function getMarketplaceListings(params: {
    cursor?: string;
    limit: number;
    sort?: 'price_asc' | 'price_desc' | 'newest';
    category?: string;
    itemId?: string;
}): Promise<{
    listings: any;
    nextCursor: any;
}>;
/**
 * Get user's listings and trade history
 */
export declare function getUserMarketplaceData(userId: string): Promise<{
    listings: any;
    trades: any;
}>;
/**
 * Check if listing is expired
 */
export declare function isListingExpired(listing: {
    expiresAt: Date | null;
    status: string;
}): boolean;
/**
 * Cleanup expired listings
 * This is a stub for cron job - call this periodically to expire old listings
 *
 * TODO: Set up cron job to call this function daily
 * Example: cron.schedule('0 0 * * *', cleanupExpiredListings)
 */
export declare function cleanupExpiredListings(): Promise<{
    restoredCount: number;
}>;
