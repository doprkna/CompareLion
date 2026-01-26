/**
 * Social Follow API
 * POST /api/social/follow - Follow a user
 * DELETE /api/social/follow - Unfollow a user
 * v0.36.42 - Social Systems 1.0
 * v0.37.3 - Added DELETE method
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { followUser, unfollowUser } from '@/lib/social/followService';
import { FollowUserSchema, UnfollowUserSchema } from '@/lib/social/schemas';

export const runtime = 'nodejs';

/**
 * POST /api/social/follow
 * Follow a user
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
  const validation = FollowUserSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request data', validation.error.issues);
  }

  const { targetId } = validation.data;

  const result = await followUser(user.id, targetId);

  if (!result.success) {
    return validationError(result.error || 'Failed to follow user');
  }

  return successResponse({
    success: true,
    message: 'User followed successfully',
  });
});

/**
 * DELETE /api/social/follow
 * Unfollow a user
 */
export const DELETE = safeAsync(async (req: NextRequest) => {
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

