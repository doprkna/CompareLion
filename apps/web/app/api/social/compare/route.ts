/**
 * Social Compare API
 * GET /api/social/compare - Compare two users' stats
 * v0.36.42 - Social Systems 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getCompareData } from '@/lib/social/compareService';
import { CompareUsersSchema } from '@/lib/social/schemas';

export const runtime = 'nodejs';

/**
 * GET /api/social/compare
 * Compare two users' stats, missions, and economy
 * Query params: userA, userB
 */
export const GET = safeAsync(async (req: NextRequest) => {
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

  const { searchParams } = new URL(req.url);
  const validation = CompareUsersSchema.safeParse({
    userA: searchParams.get('userA') || undefined,
    userB: searchParams.get('userB') || undefined,
  });

  if (!validation.success) {
    return validationError('Invalid query parameters', validation.error.issues);
  }

  const { userA, userB } = validation.data;

  // At least one user must be the current user (for privacy)
  if (userA !== user.id && userB !== user.id) {
    return unauthorizedError('Cannot compare other users');
  }

  const compareData = await getCompareData(userA, userB);

  if (!compareData) {
    return validationError('Cannot compare these users (blocked or invalid)');
  }

  return successResponse({
    compare: compareData,
  });
});

