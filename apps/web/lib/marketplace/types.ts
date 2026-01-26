/**
 * Marketplace Types & Enums
 * Shared types, enums, and interfaces for Marketplace 2.0
 * v0.36.39 - Marketplace 2.0
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Listing Status
 */
export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  EXPIRED = 'expired',
  REMOVED = 'removed',
  CANCELLED = 'cancelled',
}

/**
 * Currency Type
 */
export enum CurrencyType {
  GOLD = 'gold',
  DIAMONDS = 'diamonds',
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Market Listing
 */
export interface MarketListing {
  id: string;
  sellerId: string;
  itemId: string;
  materialId?: string | null; // For materials (future)
  quantity: number;
  price: number;
  currency: CurrencyType;
  status: ListingStatus;
  createdAt: Date;
  expiresAt: Date | null;
  buyerId?: string | null;
  // Relations (populated)
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
  quantity?: number; // Optional: buy partial quantity
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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate listing status
 */
export function isValidListingStatus(value: string): value is ListingStatus {
  return Object.values(ListingStatus).includes(value as ListingStatus);
}

/**
 * Get listing status display name
 */
export function getListingStatusDisplayName(status: ListingStatus): string {
  const displayNames: Record<ListingStatus, string> = {
    [ListingStatus.ACTIVE]: 'Active',
    [ListingStatus.SOLD]: 'Sold',
    [ListingStatus.EXPIRED]: 'Expired',
    [ListingStatus.REMOVED]: 'Removed',
    [ListingStatus.CANCELLED]: 'Cancelled',
  };
  return displayNames[status] || status;
}

/**
 * Check if listing is active
 */
export function isListingActive(listing: MarketListing): boolean {
  if (listing.status !== ListingStatus.ACTIVE) {
    return false;
  }
  
  if (listing.expiresAt && new Date() > listing.expiresAt) {
    return false;
  }
  
  return true;
}

/**
 * Calculate marketplace fee
 * @param price - Total price
 * @param feeRate - Fee rate (default: 0.05 = 5%)
 */
export function calculateMarketplaceFee(price: number, feeRate: number = 0.05): number {
  return Math.floor(price * feeRate);
}

/**
 * Calculate seller proceeds (price - fee)
 */
export function calculateSellerProceeds(price: number, feeRate: number = 0.05): number {
  return price - calculateMarketplaceFee(price, feeRate);
}
