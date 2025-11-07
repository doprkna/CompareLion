/**
 * Market Service
 * Handles marketplace listing, buying, and cancellation logic
 * v0.26.4 - Marketplace Foundations
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { updateWalletWithLock } from '@/lib/utils/walletTransactions';

const MARKETPLACE_FEE = 0.05; // 5% fee

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
export async function listItem(params: ListItemParams) {
  const { userId, inventoryItemId, price, currencyKey } = params;

  if (price <= 0) {
    throw new Error('Price must be greater than 0');
  }

  // Validate currency
  if (!['gold', 'diamonds'].includes(currencyKey)) {
    throw new Error('Invalid currency key');
  }

  // Verify user owns the inventory item
  const inventoryItem = await prisma.inventoryItem.findUnique({
    where: { id: inventoryItemId },
    include: {
      item: true,
      user: true,
    },
  });

  if (!inventoryItem) {
    throw new Error('Inventory item not found');
  }

  if (inventoryItem.userId !== userId) {
    throw new Error('Not authorized to list this item');
  }

  if (inventoryItem.equipped) {
    throw new Error('Cannot list equipped items');
  }

  // Check if item is already listed (in active listing)
  const existingListing = await prisma.marketListing.findFirst({
    where: {
      itemId: inventoryItemId,
      status: 'active',
    },
  });

  if (existingListing) {
    throw new Error('Item is already listed');
  }

  // Create listing (item remains in inventory but locked)
  const listing = await prisma.marketListing.create({
    data: {
      sellerId: userId,
      itemId: inventoryItemId,
      price,
      currencyKey,
      status: 'active',
    },
    include: {
      item: {
        include: {
          item: true, // Get Item details
        },
      },
      seller: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  logger.info(`[MarketService] Item listed: ${inventoryItemId} by user ${userId} for ${price} ${currencyKey}`);

  return listing;
}

/**
 * Buy an item from marketplace
 * Deducts currency, transfers ownership, applies marketplace fee
 */
export async function buyItem(params: BuyItemParams) {
  const { userId, listingId } = params;

  // Use transaction for atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Lock listing for update
    const listing = await tx.marketListing.findUnique({
      where: { id: listingId },
      include: {
        item: {
          include: {
            item: true,
            user: true, // Current owner (seller)
          },
        },
        seller: {
          select: {
            id: true,
            funds: true,
            diamonds: true,
          },
        },
      },
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    if (listing.status !== 'active') {
      throw new Error('Listing is no longer available');
    }

    if (listing.sellerId === userId) {
      throw new Error('Cannot buy your own listing');
    }

    // Check buyer's currency balance
    const buyer = await tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        funds: true,
        diamonds: true,
      },
    });

    if (!buyer) {
      throw new Error('Buyer not found');
    }

    const buyerBalance = listing.currencyKey === 'gold' 
      ? Number(buyer.funds || 0)
      : buyer.diamonds || 0;

    if (buyerBalance < listing.price) {
      throw new Error(`Insufficient ${listing.currencyKey}`);
    }

    // Calculate marketplace fee (5%)
    const fee = Math.floor(listing.price * MARKETPLACE_FEE);
    const sellerProceeds = listing.price - fee;

    // Transfer currency (using wallet service if available, otherwise direct)
    if (listing.currencyKey === 'gold') {
      // Deduct from buyer
      await tx.user.update({
        where: { id: userId },
        data: {
          funds: { decrement: listing.price },
        },
      });

      // Credit seller (minus fee)
      await tx.user.update({
        where: { id: listing.sellerId },
        data: {
          funds: { increment: sellerProceeds },
        },
      });
    } else {
      // Diamonds
      await tx.user.update({
        where: { id: userId },
        data: {
          diamonds: { decrement: listing.price },
        },
      });

      await tx.user.update({
        where: { id: listing.sellerId },
        data: {
          diamonds: { increment: sellerProceeds },
        },
      });
    }

    // Transfer inventory item ownership
    await tx.inventoryItem.update({
      where: { id: listing.itemId },
      data: {
        userId: userId, // Transfer to buyer
      },
    });

    // Mark listing as sold
    await tx.marketListing.update({
      where: { id: listingId },
      data: {
        status: 'sold',
        buyerId: userId,
      },
    });

    logger.info(`[MarketService] Item purchased: ${listingId} by user ${userId} for ${listing.price} ${listing.currencyKey} (fee: ${fee})`);

    return {
      listing,
      item: listing.item.item,
      sellerProceeds,
      fee,
    };
  });

  return result;
}

/**
 * Cancel a listing and return item to seller
 */
export async function cancelListing(params: CancelListingParams) {
  const { userId, listingId } = params;

  const listing = await prisma.marketListing.findUnique({
    where: { id: listingId },
    include: {
      item: true,
    },
  });

  if (!listing) {
    throw new Error('Listing not found');
  }

  if (listing.sellerId !== userId) {
    throw new Error('Not authorized to cancel this listing');
  }

  if (listing.status !== 'active') {
    throw new Error('Listing cannot be cancelled');
  }

  // Cancel listing (item remains in seller's inventory, just unlocked)
  await prisma.marketListing.update({
    where: { id: listingId },
    data: {
      status: 'cancelled',
    },
  });

  logger.info(`[MarketService] Listing cancelled: ${listingId} by user ${userId}`);

  return { success: true };
}

