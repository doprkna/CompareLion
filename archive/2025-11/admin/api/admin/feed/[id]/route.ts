/**
 * Admin Feed Post Management API
 * DELETE /api/admin/feed/[id] - Delete a feed post
 * v0.36.25 - Community Feed 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import {
  safeAsync,
  unauthorizedError,
  forbiddenError,
  notFoundError,
  successResponse,
} from '@/lib/api-handler';
import { UserRole } from '@parel/db/client';

export const DELETE = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== UserRole.ADMIN) {
    return forbiddenError('Admin access required');
  }

  const { id: postId } = params;

  const post = await prisma.feedPost.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return notFoundError('Post');
  }

  // Delete post (cascade will delete comments and reactions)
  await prisma.feedPost.delete({
    where: { id: postId },
  });

  return successResponse({ message: 'Post deleted successfully' });
});

