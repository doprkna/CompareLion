/**
 * Marketplace Types & Enums
 * Shared types, enums, and interfaces for Marketplace 2.0
 * v0.36.39 - Marketplace 2.0
 */
/** Max number of featured items shown (e.g. carousel) */
export declare const MAX_FEATURED_ITEMS = 5;
/** Market item category (matches Prisma ItemCategory) */
export type MarketItemCategory = 'item' | 'cosmetic' | 'booster';
/** Market item shape (from prisma.marketItem, with price/createdAt normalized) */
export interface MarketItem {
    id: string;
    name: string;
    description: string;
    price: number;
    currencyKey: string;
    rarity?: string | null;
    category: MarketItemCategory;
    stock?: number | null;
    isEventItem?: boolean;
    isFeatured?: boolean;
    createdAt: string;
}
/**
 * Listing Status
 */
export declare enum ListingStatus {
    ACTIVE = "active",
    SOLD = "sold",
    EXPIRED = "expired",
    REMOVED = "removed",
    CANCELLED = "cancelled"
}
/**
 * Currency Type
 */
export declare enum CurrencyType {
    GOLD = "gold",
    DIAMONDS = "diamonds"
}
/**
 * Market Listing
 */
export interface MarketListing {
    id: string;
    sellerId: string;
    itemId: string;
    materialId?: string | null;
    quantity: number;
    price: number;
    currency: CurrencyType;
    status: ListingStatus;
    createdAt: Date;
    expiresAt: Date | null;
    buyerId?: string | null;
    item?: {
        id: string;
        name: string;
        emoji?: string | null;
        icon?: string | null;
        rarity: string;
        type: string;
        description?: string | null;
    };
    seller?: {
        id: string;
        username?: string | null;
        name?: string | null;
    };
}
/**
 * Transaction Log Entry
 */
export interface TransactionLog {
    id: string;
    buyerId: string;
    sellerId: string;
    listingId: string;
    itemId: string;
    quantity: number;
    pricePaid: number;
    fee: number;
    currency: CurrencyType;
    timestamp: Date;
}
/**
 * Create Listing Parameters
 */
export interface CreateListingParams {
    userId: string;
    itemId: string;
    quantity: number;
    price: number;
    currency: CurrencyType;
}
/**
 * Purchase Listing Parameters
 */
export interface PurchaseListingParams {
    userId: string;
    listingId: string;
    quantity?: number;
}
/**
 * Marketplace Listing Filters
 */
export interface ListingFilters {
    category?: string;
    rarity?: string;
    minPrice?: number;
    maxPrice?: number;
    sellerId?: string;
    currency?: CurrencyType;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
    limit?: number;
    cursor?: string;
}
/**
 * Validate listing status
 */
export declare function isValidListingStatus(value: string): value is ListingStatus;
/**
 * Get listing status display name
 */
export declare function getListingStatusDisplayName(status: ListingStatus): string;
/**
 * Check if listing is active
 */
export declare function isListingActive(listing: MarketListing): boolean;
/**
 * Calculate marketplace fee
 * @param price - Total price
 * @param feeRate - Fee rate (default: 0.05 = 5%)
 */
export declare function calculateMarketplaceFee(price: number, feeRate?: number): number;
/**
 * Calculate seller proceeds (price - fee)
 */
export declare function calculateSellerProceeds(price: number, feeRate?: number): number;
