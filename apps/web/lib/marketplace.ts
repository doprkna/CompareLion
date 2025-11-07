/**
 * Marketplace System
 * 
 * Peer-to-peer item trading with tax pool.
 */

import { prisma } from "@/lib/db";
import { publishEvent } from "@/lib/realtime";
import { createFeedItem } from "@/lib/feed";
import { logActivity } from "@/lib/activity";
import { notify } from "@/lib/notify";

const TAX_RATE = 0.05; // 5% tax on all sales

/**
 * Add to global tax pool
 */
export async function addToTaxPool(goldAmount: number, diamondAmount: number = 0) {
  await prisma.globalPool.upsert({
    where: { poolType: "market_tax" },
    update: {
      goldAmount: { increment: goldAmount },
      diamondAmount: { increment: diamondAmount },
    },
    create: {
      poolType: "market_tax",
      goldAmount,
      diamondAmount,
    },
  });
}

/**
 * Create market listing
 */
export async function createListing(
  sellerId: string,
  itemId: string,
  price: number,
  currency: "gold" | "diamonds" = "gold"
) {
  // Check if user owns item
  const inventoryItem = await prisma.inventoryItem.findFirst({
    where: {
      userId: sellerId,
      itemId,
      quantity: { gt: 0 },
    },
  });

  if (!inventoryItem) {
    throw new Error("Item not found in inventory");
  }

  // Remove item from inventory (locked in listing)
  if (inventoryItem.quantity === 1) {
    await prisma.inventoryItem.delete({
      where: { id: inventoryItem.id },
    });
  } else {
    await prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: { quantity: { decrement: 1 } },
    });
  }

  // Create listing
  const listing = await prisma.marketListing.create({
    data: {
      sellerId,
      itemId,
      price,
      currency,
      status: "active",
    },
  });

  // Log activity
  await logActivity(sellerId, "market_list", "Listed item for sale", `Price: ${price} ${currency}`);

  // Publish event
  await publishEvent("market:listed", {
    listingId: listing.id,
    sellerId,
    itemId,
    price,
    currency,
  });

  return listing;
}

/**
 * Purchase item from marketplace
 */
export async function purchaseItem(listingId: string, buyerId: string) {
  const listing = await prisma.marketListing.findUnique({
    where: { id: listingId },
    include: {
      seller: true,
    },
  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.status !== "active") {
    throw new Error("Listing is no longer available");
  }

  if (listing.sellerId === buyerId) {
    throw new Error("Cannot buy your own listing");
  }

  const buyer = await prisma.user.findUnique({
    where: { id: buyerId },
  });

  if (!buyer) {
    throw new Error("Buyer not found");
  }

  // Check buyer has enough currency
  const buyerBalance = listing.currency === "gold" ? buyer.funds || 0 : buyer.diamonds || 0;
  if (buyerBalance < listing.price) {
    throw new Error(`Insufficient ${listing.currency}`);
  }

  // Calculate tax
  const tax = Math.floor(listing.price * TAX_RATE);
  const sellerProceeds = listing.price - tax;

  // Transfer currency from buyer to seller
  if (listing.currency === "gold") {
    await prisma.user.update({
      where: { id: buyerId },
      data: { funds: { decrement: listing.price } },
    });
    await prisma.user.update({
      where: { id: listing.sellerId },
      data: { funds: { increment: sellerProceeds } },
    });
    await addToTaxPool(tax, 0);
  } else {
    await prisma.user.update({
      where: { id: buyerId },
      data: { diamonds: { decrement: listing.price } },
    });
    await prisma.user.update({
      where: { id: listing.sellerId },
      data: { diamonds: { increment: sellerProceeds } },
    });
    await addToTaxPool(0, tax);
  }

  // Transfer item to buyer
  const existingItem = await prisma.inventoryItem.findFirst({
    where: {
      userId: buyerId,
      itemId: listing.itemId,
    },
  });

  if (existingItem) {
    await prisma.inventoryItem.update({
      where: { id: existingItem.id },
      data: { quantity: { increment: 1 } },
    });
  } else {
    await prisma.inventoryItem.create({
      data: {
        userId: buyerId,
        itemId: listing.itemId,
        quantity: 1,
      },
    });
  }

  // Update listing
  await prisma.marketListing.update({
    where: { id: listingId },
    data: {
      status: "sold",
      soldAt: new Date(),
      buyerId,
    },
  });

  // Get item details for notifications
  const item = await prisma.item.findUnique({
    where: { id: listing.itemId },
  });

  // Notify seller
  await notify(
    listing.sellerId,
    "market_sale",
    `Item Sold! +${sellerProceeds} ${listing.currency}`,
    `${item?.name} was purchased`
  );

  // Notify buyer
  await notify(
    buyerId,
    "market_purchase",
    "Purchase Successful!",
    `You bought ${item?.name}`
  );

  // Log activities
  await logActivity(listing.sellerId, "market_sold", "Item sold", `Earned ${sellerProceeds} ${listing.currency}`);
  await logActivity(buyerId, "market_bought", "Item purchased", `Spent ${listing.price} ${listing.currency}`);

  // Log to feed
  await createFeedItem({
    type: "market_sale",
    title: `${item?.name} sold for ${listing.price} ${listing.currency}!`,
    userId: listing.sellerId,
    metadata: {
      itemName: item?.name,
      price: listing.price,
      currency: listing.currency,
      rarity: item?.rarity,
    },
  });

  // Publish event
  await publishEvent("market:sold", {
    listingId,
    sellerId: listing.sellerId,
    buyerId,
    itemName: item?.name,
    price: listing.price,
    currency: listing.currency,
  });

  return {
    success: true,
    item,
    price: listing.price,
    tax,
    sellerProceeds,
  };
}

/**
 * Cancel listing and return item to seller
 */
export async function cancelListing(listingId: string, userId: string) {
  const listing = await prisma.marketListing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.sellerId !== userId) {
    throw new Error("Not authorized to cancel this listing");
  }

  if (listing.status !== "active") {
    throw new Error("Listing cannot be cancelled");
  }

  // Return item to seller
  const existingItem = await prisma.inventoryItem.findFirst({
    where: {
      userId,
      itemId: listing.itemId,
    },
  });

  if (existingItem) {
    await prisma.inventoryItem.update({
      where: { id: existingItem.id },
      data: { quantity: { increment: 1 } },
    });
  } else {
    await prisma.inventoryItem.create({
      data: {
        userId,
        itemId: listing.itemId,
        quantity: 1,
      },
    });
  }

  // Update listing
  await prisma.marketListing.update({
    where: { id: listingId },
    data: { status: "cancelled" },
  });

  return { success: true };
}













