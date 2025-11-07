/**
 * Market Cancel API - Cancel a listing
 * v0.26.4 - Marketplace Foundations
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { cancelListing } from '@/lib/services/marketService';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';

/**
 * POST /api/market/cancel
 * Cancel a marketplace listing
 * Body: { listingId: string }
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const { prisma } = await import('@/lib/db');
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await parseBody<{ listingId: string }>(req);

  if (!body.listingId) {
    return validationError('Missing required field: listingId');
  }

  try {
    await cancelListing({
      userId: user.id,
      listingId: body.listingId,
    });

    return successResponse({
      success: true,
      message: 'Listing cancelled successfully',
    });
  } catch (error) {
    return validationError(
      error instanceof Error ? error.message : 'Failed to cancel listing'
    );
  }
});

