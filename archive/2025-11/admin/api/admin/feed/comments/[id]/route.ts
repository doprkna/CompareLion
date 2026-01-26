/**
 * Admin Feed Comment Management API
 * DELETE /api/admin/feed/comments/[id] - Delete a feed comment
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

  const { id: commentId } = params;

  const comment = await prisma.feedComment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    return notFoundError('Comment');
  }

  await prisma.feedComment.delete({
    where: { id: commentId },
  });

  return successResponse({ message: 'Comment deleted successfully' });
});

