/**
 * Marketplace Zod Schemas
 * Validation schemas for Marketplace 2.0 API endpoints
 * v0.36.39 - Marketplace 2.0
 */

import { z } from 'zod';
import { ListingStatus, CurrencyType } from './types';

/**
 * Create Listing Schema
 */
export const CreateListingSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(1000, 'Quantity cannot exceed 1000'),
  price: z.number().int().min(1, 'Price must be at least 1').max(999999, 'Price cannot exceed 999999'),
  currency: z.nativeEnum(CurrencyType).default(CurrencyType.GOLD),
});

/**
 * Purchase Listing Schema
 */
export const PurchaseListingSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').optional(),
});

/**
 * Listing Filters Schema
 */
export const ListingFiltersSchema = z.object({
  category: z.string().optional(),
  rarity: z.string().optional(),
  minPrice: z.number().int().min(0).optional(),
  maxPrice: z.number().int().min(0).optional(),
  sellerId: z.string().optional(),
  currency: z.nativeEnum(CurrencyType).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'oldest']).default('newest'),
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

/**
 * Admin Remove Listing Schema
 */
export const AdminRemoveListingSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  reason: z.string().optional(),
});

/**
 * Type exports for TypeScript
 */
export type CreateListingInput = z.infer<typeof CreateListingSchema>;
export type PurchaseListingInput = z.infer<typeof PurchaseListingSchema>;
export type ListingFiltersInput = z.infer<typeof ListingFiltersSchema>;
export type AdminRemoveListingInput = z.infer<typeof AdminRemoveListingSchema>;

