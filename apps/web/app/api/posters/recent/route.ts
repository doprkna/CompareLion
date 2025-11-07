/**
 * Poster Recent API (v0.29.28)
 * 
 * GET /api/posters/recent
 * Returns user's last 5 posters
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';

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

  const limit = parseInt(new URL(req.url).searchParams.get('limit') || '5', 10);

  // Get user's recent posters
  const posters = await (prisma as any).posterCard.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      title: true,
      statsJson: true,
      imageUrl: true,
      isShared: true,
      createdAt: true,
    },
  });

  return successResponse({
    posters,
    count: posters.length,
    limit,
  });
});

