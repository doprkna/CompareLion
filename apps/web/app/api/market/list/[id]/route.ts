/**
 * Market List Delete API - Cancel a listing
 * v0.36.29 - Marketplace 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { cancelListing } from '@/lib/services/marketplaceService';
import { safeAsync, unauthorizedError, validationError, successResponse, notFoundError } from '@/lib/api-handler';
import { prisma } from '@/lib/db';

/**
 * DELETE /api/market/list/[id]
 * Cancel a marketplace listing
 */
export const DELETE = safeAsync(
  async (
    req: NextRequest,
    { params }: { params: { id: string } }
  ) => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return unauthorizedError('Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return unauthorizedError('User not found');
    }

    const { id: listingId } = params;

    if (!listingId) {
      return notFoundError('Listing ID required');
    }

    try {
      await cancelListing(listingId, user.id);

      return successResponse({
        success: true,
        message: 'Listing cancelled',
      });
    } catch (error) {
      return validationError(
        error instanceof Error ? error.message : 'Failed to cancel listing'
      );
    }
  }
);

