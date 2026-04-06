/**
 * Marketplace Zod Schemas
 * Validation schemas for Marketplace 2.0 API endpoints
 * v0.36.39 - Marketplace 2.0
 */
import { z } from 'zod';
import { CurrencyType } from './types';
/**
 * Create Listing Schema
 */
export declare const CreateListingSchema: z.ZodObject<{
    itemId: z.ZodString;
    quantity: z.ZodNumber;
    price: z.ZodNumber;
    currency: z.ZodDefault<z.ZodEnum<typeof CurrencyType>>;
}, z.core.$strip>;
/**
 * Purchase Listing Schema
 */
export declare const PurchaseListingSchema: z.ZodObject<{
    listingId: z.ZodString;
    quantity: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
/**
 * Listing Filters Schema
 */
export declare const ListingFiltersSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
    rarity: z.ZodOptional<z.ZodString>;
    minPrice: z.ZodOptional<z.ZodNumber>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
    sellerId: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodEnum<typeof CurrencyType>>;
    sortBy: z.ZodDefault<z.ZodEnum<{
        newest: "newest";
        price_asc: "price_asc";
        price_desc: "price_desc";
        oldest: "oldest";
    }>>;
    limit: z.ZodDefault<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Admin Remove Listing Schema
 */
export declare const AdminRemoveListingSchema: z.ZodObject<{
    listingId: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Type exports for TypeScript
 */
export type CreateListingInput = z.infer<typeof CreateListingSchema>;
export type PurchaseListingInput = z.infer<typeof PurchaseListingSchema>;
export type ListingFiltersInput = z.infer<typeof ListingFiltersSchema>;
export type AdminRemoveListingInput = z.infer<typeof AdminRemoveListingSchema>;
