/**
 * Market DTOs
 * Data transfer objects for marketplace listings
 * v0.41.10 - C3 Step 11: DTO Consolidation Batch #3
 */
/**
 * Market item DTO
 * Item information in marketplace listing
 */
export interface MarketItemDTO {
    /** Item ID */
    id: string;
    /** Item name */
    name: string;
    /** Item emoji */
    emoji?: string | null;
    /** Item icon */
    icon?: string | null;
    /** Item rarity */
    rarity: string;
    /** Item type */
    type: string;
    /** Item description */
    description?: string | null;
}
/**
 * Market seller DTO
 * Seller information (anonymized)
 */
export interface MarketSellerDTO {
    /** Seller user ID */
    id: string;
    /** Anonymized name */
    name: string;
    /** Anonymized username (optional) */
    username?: string;
}
/**
 * Market listing DTO
 * Marketplace listing structure
 */
export interface MarketListingDTO {
    /** Listing ID */
    id: string;
    /** Listing price */
    price: number;
    /** Quantity available */
    quantity: number;
    /** Creation timestamp */
    createdAt: Date | string;
    /** Item information */
    item: MarketItemDTO;
    /** Seller information (anonymized) */
    seller: MarketSellerDTO;
}
/**
 * Market response DTO
 * Market endpoint response
 */
export interface MarketResponseDTO {
    /** Listings list */
    listings: MarketListingDTO[];
    /** Next cursor for pagination */
    nextCursor: string | null;
}
