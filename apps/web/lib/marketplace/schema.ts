/**
 * Marketplace Schema Definition
 * 
 * This file documents the Prisma schema structure for Marketplace 2.0
 * Note: Models may already exist (marketListing, userTrade)
 * 
 * v0.36.39 - Marketplace 2.0
 */

/**
 * Prisma Schema Structure:
 * 
 * Models that should exist:
 * 
 * 1. MarketListing:
 *    - id (String, @id, @default(cuid()))
 *    - sellerId (String, relation to User)
 *    - itemId (String, relation to Item)
 *    - materialId (String?, nullable, for materials - future)
 *    - quantity (Int, default 1)
 *    - price (Int)
 *    - currencyKey (String, 'gold' | 'diamonds')
 *    - status (String, enum: 'active' | 'sold' | 'expired' | 'removed' | 'cancelled')
 *    - createdAt (DateTime, @default(now()))
 *    - expiresAt (DateTime?, nullable)
 *    - buyerId (String?, nullable, relation to User)
 *    - Relations: seller (User), item (Item), buyer (User?)
 *    - Indexes: [sellerId, status], [itemId], [status, createdAt], [expiresAt]
 * 
 * 2. TransactionLog (or MarketTransaction):
 *    - id (String, @id, @default(cuid()))
 *    - buyerId (String, relation to User)
 *    - sellerId (String, relation to User)
 *    - listingId (String, relation to MarketListing)
 *    - itemId (String, relation to Item)
 *    - quantity (Int)
 *    - pricePaid (Int)
 *    - fee (Int)
 *    - currencyKey (String, 'gold' | 'diamonds')
 *    - timestamp (DateTime, @default(now()))
 *    - Relations: buyer (User), seller (User), listing (MarketListing), item (Item)
 *    - Indexes: [buyerId], [sellerId], [listingId], [timestamp]
 * 
 * 3. UserTrade (may already exist):
 *    - id (String, @id, @default(cuid()))
 *    - userId (String, relation to User)
 *    - type (String, 'buy' | 'sell')
 *    - itemId (String, relation to Item)
 *    - quantity (Int)
 *    - price (Int)
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: user (User), item (Item)
 *    - Indexes: [userId], [type], [createdAt]
 * 
 * Enum (if using Prisma enum):
 *    enum ListingStatus {
 *      active
 *      sold
 *      expired
 *      removed
 *      cancelled
 *    }
 * 
 * Note: The system currently uses string status values, but enum is recommended.
 */

export const SCHEMA_VERSION = '0.36.39';
export const SCHEMA_MODULE = 'Marketplace 2.0';

