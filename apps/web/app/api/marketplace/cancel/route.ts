/**
 * Marketplace Cancel API - Cancel a listing
 * v0.36.4 - Marketplace listing + buying flow
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { cancelListing } from '@/lib/services/marketService';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';

export const runtime = 'nodejs';

/**
 * POST /api/marketplace/cancel
 * Cancel a marketplace listing
 * Body: { listingId: string }
 */
export const POST = safeAsync(async (req: NextRequest) => {
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

  const body = await parseBody<{
    listingId: string;
  }>(req);

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
    });
  } catch (error) {
    return validationError(
      error instanceof Error ? error.message : 'Failed to cancel listing'
    );
  }
});

