/**
 * Admin Market Cleanup API
 * POST /api/admin/market/cleanup - Remove expired listings
 * v0.36.29 - Marketplace 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { cleanupExpiredListings } from '@/lib/services/marketplaceService';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { prisma } from '@/lib/db';

/**
 * POST /api/admin/market/cleanup
 * Cleanup expired listings (30+ days old)
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (user?.role !== 'ADMIN') {
    return unauthorizedError('Admin only');
  }

  const result = await cleanupExpiredListings();

  return successResponse({
    success: true,
    restoredCount: result.restoredCount,
    message: `Restored ${result.restoredCount} expired listings`,
  });
});

