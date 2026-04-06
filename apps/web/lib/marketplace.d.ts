/**
 * Marketplace System
 *
 * Peer-to-peer item trading with tax pool.
 */
/**
 * Add to global tax pool
 */
export declare function addToTaxPool(goldAmount: number, diamondAmount?: number): Promise<void>;
/**
 * Create market listing
 */
export declare function createListing(sellerId: string, itemId: string, price: number, currency?: "gold" | "diamonds"): Promise<any>;
/**
 * Purchase item from marketplace
 */
export declare function purchaseItem(listingId: string, buyerId: string): Promise<{
    success: boolean;
    item: any;
    price: any;
    tax: number;
    sellerProceeds: number;
}>;
/**
 * Cancel listing and return item to seller
 */
export declare function cancelListing(listingId: string, userId: string): Promise<{
    success: boolean;
}>;
