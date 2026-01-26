/**
 * Marketplace Service 2.0
 * Full buy/sell marketplace with listings, trades, inventory sync
 * v0.36.29 - Marketplace 2.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { notify } from '@/lib/notify';
import { ListingStatus, CurrencyType, calculateMarketplaceFee, calculateSellerProceeds } from '@/lib/marketplace/types';

const MARKETPLACE_FEE = 0.05; // 5% fee
const MAX_ACTIVE_LISTINGS = 20; // MVP limit
const LISTING_EXPIRY_DAYS = 30;
const MIN_PRICE = 1;
const MAX_PRICE = 999999;
const RELISTING_COOLDOWN_MS = 1000; // 1 second
const INSTANT_FLIP_COOLDOWN_MS = 60000; // 1 minute - prevent buying and immediately relisting

export interface CreateListingParams {
  userId: string;
  itemId: string; // Item.id (not InventoryItem.id)
  quantity: number;
  price: number;
  currency?: CurrencyType; // Optional, defaults to GOLD
}

export interface BuyListingParams {
  userId: string;
  listingId: string;
  quantity?: number; // Optional: buy partial quantity
}

/**
 * Create a marketplace listing
 * Validates ownership, checks limits, reserves items
 */
export async function createListing(params: CreateListingParams) {
  const { userId, itemId, quantity, price, currency = CurrencyType.GOLD } = params;

  // Validation: Quantity
  if (quantity <= 0 || quantity > 1000) {
    throw new Error('Quantity must be between 1 and 1000');
  }

  // Validation: Price (min/max)
  if (price < MIN_PRICE || price > MAX_PRICE) {
    throw new Error(`Price must be between ${MIN_PRICE} and ${MAX_PRICE}`);
  }

  // Anti-exploit: Check user has enough active listings
  const activeCount = await prisma.marketListing.count({
    where: {
      sellerId: userId,
      status: ListingStatus.ACTIVE,
    },
  });

  if (activeCount >= MAX_ACTIVE_LISTINGS) {
    throw new Error(`Maximum ${MAX_ACTIVE_LISTINGS} active listings allowed`);
  }

  // Verify user owns the item
  const inventoryItem = await prisma.inventoryItem.findFirst({
    where: {
      userId,
      itemId,
      quantity: { gte: quantity },
    },
    include: {
      item: true,
    },
  });

  if (!inventoryItem) {
    throw new Error('Insufficient quantity in inventory');
  }

  if (inventoryItem.equipped) {
    throw new Error('Cannot list equipped items');
  }

  // Anti-exploit: Check for rapid relisting (cooldown)
  const recentListing = await prisma.marketListing.findFirst({
    where: {
      sellerId: userId,
      itemId,
      createdAt: {
        gte: new Date(Date.now() - RELISTING_COOLDOWN_MS),
      },
    },
  });

  if (recentListing) {
    throw new Error('Please wait before relisting this item');
  }

  // Anti-exploit: Prevent instant flip loops (buy then immediately relist)
  // Check if user recently bought this item and is trying to relist it
  const recentPurchase = await prisma.userTrade.findFirst({
    where: {
      userId,
      type: 'buy',
      itemId,
      createdAt: {
        gte: new Date(Date.now() - INSTANT_FLIP_COOLDOWN_MS),
      },
    },
  });

  if (recentPurchase) {
    throw new Error('Cannot relist recently purchased items (anti-flip protection)');
  }

  // Create listing and reserve items (reduce quantity)
  const listing = await prisma.$transaction(async (tx) => {
    // Reduce inventory quantity
    await tx.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: { quantity: { decrement: quantity } },
    });

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + LISTING_EXPIRY_DAYS);

    // Create listing
    const newListing = await tx.marketListing.create({
      data: {
        sellerId: userId,
        itemId,
        price,
        quantity,
        status: ListingStatus.ACTIVE,
        currencyKey: currency,
        expiresAt,
      },
      include: {
        item: true,
      },
    });

    return newListing;
  });

  logger.info(`[Marketplace] Listing created: ${listing.id} by ${userId} (${quantity}x ${itemId} @ ${price} gold)`);

  return listing;
}

/**
 * Buy from a marketplace listing
 * Handles stock reduction, gold transfer, inventory updates, trade logging
 */
export async function buyListing(params: BuyListingParams) {
  const { userId, listingId, quantity = 1 } = params;

  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  const result = await prisma.$transaction(async (tx) => {
    // Lock listing for update
    const listing = await tx.marketListing.findUnique({
      where: { id: listingId },
      include: {
        item: true,
        seller: {
          select: {
            id: true,
            funds: true,
          },
        },
      },
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    // Check listing status
    if (listing.status !== 'active') {
      throw new Error('Listing is no longer available');
    }

    // Check if listing has expired
    if (listing.expiresAt && new Date() > listing.expiresAt) {
      throw new Error('Listing has expired');
    }

    // Prevent self-purchase
    if (listing.sellerId === userId) {
      throw new Error('Cannot buy your own listing');
    }

    // Validate quantity
    if (quantity > listing.quantity) {
      throw new Error(`Only ${listing.quantity} available`);
    }

    // Get buyer and check balance
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

    const totalPrice = listing.price * quantity;
    const currency = (listing.currencyKey as CurrencyType) || CurrencyType.GOLD;
    
    // Check buyer balance based on currency
    const buyerBalance = currency === CurrencyType.GOLD 
      ? Number(buyer.funds || 0)
      : (buyer.diamonds || 0);

    if (buyerBalance < totalPrice) {
      const currencyName = currency === CurrencyType.GOLD ? 'gold' : 'diamonds';
      throw new Error(`Insufficient ${currencyName}. Need ${totalPrice}, have ${buyerBalance}`);
    }

    // Calculate fee and proceeds using utility functions
    const fee = calculateMarketplaceFee(totalPrice, MARKETPLACE_FEE);
    const sellerProceeds = calculateSellerProceeds(totalPrice, MARKETPLACE_FEE);

    // Transfer currency (atomic)
    if (currency === CurrencyType.GOLD) {
      await tx.user.update({
        where: { id: userId },
        data: { funds: { decrement: totalPrice } },
      });

      await tx.user.update({
        where: { id: listing.sellerId },
        data: { funds: { increment: sellerProceeds } },
      });
    } else {
      // Diamonds
      await tx.user.update({
        where: { id: userId },
        data: { diamonds: { decrement: totalPrice } },
      });

      await tx.user.update({
        where: { id: listing.sellerId },
        data: { diamonds: { increment: sellerProceeds } },
      });
    }

    // Update listing quantity or mark as sold
    const remainingQuantity = listing.quantity - quantity;
    if (remainingQuantity === 0) {
      await tx.marketListing.update({
        where: { id: listingId },
        data: {
          status: ListingStatus.SOLD,
          buyerId: userId,
        },
      });
    } else {
      await tx.marketListing.update({
        where: { id: listingId },
        data: {
          quantity: remainingQuantity,
        },
      });
    }

    // Add items to buyer inventory
    const buyerInventoryItem = await tx.inventoryItem.findFirst({
      where: {
        userId,
        itemId: listing.itemId,
      },
    });

    if (buyerInventoryItem) {
      await tx.inventoryItem.update({
        where: { id: buyerInventoryItem.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      await tx.inventoryItem.create({
        data: {
          userId,
          itemId: listing.itemId,
          quantity,
        },
      });
    }

    // Log trades (for user history)
    await tx.userTrade.create({
      data: {
        userId: listing.sellerId,
        type: 'sell',
        itemId: listing.itemId,
        quantity,
        price: listing.price,
      },
    });

    await tx.userTrade.create({
      data: {
        userId,
        type: 'buy',
        itemId: listing.itemId,
        quantity,
        price: listing.price,
      },
    });

    // Create transaction log (if TransactionLog model exists)
    // Note: This will fail gracefully if model doesn't exist yet
    try {
      await tx.marketTransaction.create({
        data: {
          buyerId: userId,
          sellerId: listing.sellerId,
          listingId: listingId,
          itemId: listing.itemId,
          quantity,
          pricePaid: totalPrice,
          fee,
          currencyKey: currency,
        },
      });
    } catch (error) {
      // TransactionLog model may not exist yet - log but don't fail
      logger.debug('[Marketplace] TransactionLog creation skipped (model may not exist)', error);
    }

    return {
      listing,
      item: listing.item,
      quantity,
      totalPrice,
      fee,
      sellerProceeds,
      currency,
    };
  });

  // Send notifications (outside transaction)
  try {
    await notify(
      listing.sellerId,
      'market_sale',
      'Item Sold!',
      `Your ${result.item.name} sold for ${result.totalPrice} gold.`
    );

    await notify(
      userId,
      'market_purchase',
      'Purchase Successful',
      `You bought ${result.quantity}x ${result.item.name}.`
    );
  } catch (error) {
    logger.debug('[Marketplace] Notification failed', error);
  }

  logger.info(`[Marketplace] Purchase: ${userId} bought ${quantity}x ${result.item.id} from ${listing.sellerId} for ${result.totalPrice} gold`);

  return result;
}

/**
 * Cancel a listing and restore items to seller inventory
 */
export async function cancelListing(listingId: string, userId: string) {
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

  // Restore items to seller inventory
  await prisma.$transaction(async (tx) => {
    const sellerInventoryItem = await tx.inventoryItem.findFirst({
      where: {
        userId,
        itemId: listing.itemId,
      },
    });

    if (sellerInventoryItem) {
      await tx.inventoryItem.update({
        where: { id: sellerInventoryItem.id },
        data: { quantity: { increment: listing.quantity } },
      });
    } else {
      await tx.inventoryItem.create({
        data: {
          userId,
          itemId: listing.itemId,
          quantity: listing.quantity,
        },
      });
    }

    // Deactivate listing
    await tx.marketListing.update({
      where: { id: listingId },
      data: {
        status: 'cancelled',
      },
    });
  });

  logger.info(`[Marketplace] Listing cancelled: ${listingId} by ${userId}`);

  return { success: true };
}

/**
 * Get paginated marketplace listings
 */
export async function getMarketplaceListings(params: {
  cursor?: string;
  limit: number;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  category?: string;
  itemId?: string;
}) {
  const { cursor, limit, sort = 'price_asc', category, itemId } = params;

  const where: any = {
    status: 'active',
  };

  if (itemId) {
    where.itemId = itemId;
  }

  // Category filter (if item has category field)
  if (category) {
    where.item = {
      type: category,
    };
  }

  const orderBy: any[] = [];
  if (sort === 'price_asc') {
    orderBy.push({ price: 'asc' });
  } else if (sort === 'price_desc') {
    orderBy.push({ price: 'desc' });
  } else if (sort === 'newest') {
    orderBy.push({ createdAt: 'desc' });
  }
  orderBy.push({ createdAt: 'desc' }); // Secondary sort

  const listings = await prisma.marketListing.findMany({
    where,
    include: {
      item: {
        select: {
          id: true,
          name: true,
          emoji: true,
          icon: true,
          rarity: true,
          type: true,
          description: true,
        },
      },
      seller: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
    },
    orderBy,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
  });

  const hasMore = listings.length > limit;
  const items = hasMore ? listings.slice(0, limit) : listings;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return {
    listings: items,
    nextCursor,
  };
}

/**
 * Get user's listings and trade history
 */
export async function getUserMarketplaceData(userId: string) {
  const [listings, trades] = await Promise.all([
    prisma.marketListing.findMany({
      where: { sellerId: userId },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            emoji: true,
            icon: true,
            rarity: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.userTrade.findMany({
      where: { userId },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            emoji: true,
            icon: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  return {
    listings,
    trades,
  };
}

/**
 * Check if listing is expired
 */
export function isListingExpired(listing: { expiresAt: Date | null; status: string }): boolean {
  if (listing.status !== ListingStatus.ACTIVE) {
    return false; // Already not active
  }
  
  if (!listing.expiresAt) {
    return false; // No expiration date set
  }
  
  return new Date() > listing.expiresAt;
}

/**
 * Cleanup expired listings
 * This is a stub for cron job - call this periodically to expire old listings
 * 
 * TODO: Set up cron job to call this function daily
 * Example: cron.schedule('0 0 * * *', cleanupExpiredListings)
 */
export async function cleanupExpiredListings() {
  const now = new Date();

  const expiredListings = await prisma.marketListing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      OR: [
        // Expired by expiresAt date
        {
          expiresAt: {
            lt: now,
          },
        },
        // Or expired by age (30 days old, if expiresAt not set)
        {
          expiresAt: null,
          createdAt: {
            lt: new Date(now.getTime() - LISTING_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
          },
        },
      ],
    },
    include: {
      item: true,
    },
  });

  let restoredCount = 0;

  for (const listing of expiredListings) {
    await prisma.$transaction(async (tx) => {
      // Restore items to seller inventory
      const sellerInventoryItem = await tx.inventoryItem.findFirst({
        where: {
          userId: listing.sellerId,
          itemId: listing.itemId,
        },
      });

      if (sellerInventoryItem) {
        await tx.inventoryItem.update({
          where: { id: sellerInventoryItem.id },
          data: { quantity: { increment: listing.quantity } },
        });
      } else {
        await tx.inventoryItem.create({
          data: {
            userId: listing.sellerId,
            itemId: listing.itemId,
            quantity: listing.quantity,
          },
        });
      }

      // Mark listing as expired
      await tx.marketListing.update({
        where: { id: listing.id },
        data: {
          status: ListingStatus.EXPIRED,
        },
      });

      restoredCount++;
    });
  }

  logger.info(`[Marketplace] Cleanup: ${restoredCount} expired listings restored`);

  return { restoredCount };
}

