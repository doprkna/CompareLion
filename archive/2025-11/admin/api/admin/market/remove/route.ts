/**
 * Admin Marketplace Remove API
 * POST /api/admin/market/remove - Remove a listing (admin moderation)
 * v0.36.39 - Marketplace 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { AdminRemoveListingSchema } from '@/lib/marketplace/schemas';
import { ListingStatus } from '@/lib/marketplace/types';

export const runtime = 'nodejs';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
}

/**
 * POST /api/admin/market/remove
 * Remove a marketplace listing (admin moderation)
 * Body: { listingId: string, reason?: string }
 */
export const POST = safeAsync(async (req: NextRequest) => {
  await requireAdmin();

  const body = await parseBody(req);
  const validation = AdminRemoveListingSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request data', validation.error.issues);
  }

  const { listingId, reason } = validation.data;

  // Get listing
  const listing = await prisma.marketListing.findUnique({
    where: { id: listingId },
    include: {
      item: true,
    },
  });

  if (!listing) {
    return validationError('Listing not found');
  }

  // Only remove active listings
  if (listing.status !== ListingStatus.ACTIVE) {
    return validationError('Can only remove active listings');
  }

  // Remove listing and restore items to seller
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

    // Mark listing as removed
    await tx.marketListing.update({
      where: { id: listingId },
      data: {
        status: ListingStatus.REMOVED,
      },
    });
  });

  return successResponse({
    success: true,
    message: 'Listing removed successfully',
    reason: reason || 'Admin removal',
  });
});

