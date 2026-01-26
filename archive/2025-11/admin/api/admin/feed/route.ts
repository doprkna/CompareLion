/**
 * Admin Feed Management API
 * GET /api/admin/feed - List feed posts with filters
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
  successResponse,
} from '@/lib/api-handler';
import { UserRole } from '@parel/db/client';

export const GET = safeAsync(async (req: NextRequest) => {
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

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const userId = searchParams.get('userId');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const where: any = {};
  if (type) {
    where.type = type;
  }
  if (userId) {
    where.userId = userId;
  }

  const posts = await prisma.feedPost.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          comments: true,
          reactions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return successResponse({ posts });
});

