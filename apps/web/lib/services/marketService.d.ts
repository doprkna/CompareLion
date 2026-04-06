/**
 * Market Service
 * Handles marketplace listing, buying, and cancellation logic
 * v0.26.4 - Marketplace Foundations
 */
export interface ListItemParams {
    userId: string;
    inventoryItemId: string;
    price: number;
    currencyKey: string;
}
export interface BuyItemParams {
    userId: string;
    listingId: string;
}
export interface CancelListingParams {
    userId: string;
    listingId: string;
}
/**
 * List an item on the marketplace
 * Validates ownership, locks item from usage
 */
export declare function listItem(params: ListItemParams): Promise<any>;
/**
 * Buy an item from marketplace
 * Deducts currency, transfers ownership, applies marketplace fee
 */
export declare function buyItem(params: BuyItemParams): Promise<any>;
/**
 * Cancel a listing and return item to seller
 */
export declare function cancelListing(params: CancelListingParams): Promise<{
    success: boolean;
}>;
