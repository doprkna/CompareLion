/**
 * Social Unfollow API
 * POST /api/social/unfollow - Unfollow a user
 * v0.36.42 - Social Systems 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { unfollowUser } from '@/lib/social/followService';
import { UnfollowUserSchema } from '@/lib/social/schemas';

export const runtime = 'nodejs';

/**
 * POST /api/social/unfollow
 * Unfollow a user
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

  const body = await parseBody(req);
  const validation = UnfollowUserSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request data', validation.error.issues);
  }

  const { targetId } = validation.data;

  const result = await unfollowUser(user.id, targetId);

  if (!result.success) {
    return validationError(result.error || 'Failed to unfollow user');
  }

  return successResponse({
    success: true,
    message: 'User unfollowed successfully',
  });
});

