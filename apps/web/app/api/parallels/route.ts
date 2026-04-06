/**
 * Parallels API (C16 - Similarity Engine)
 * GET /api/parallels - Returns users most similar to current user
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { getParallels } from '@/lib/services/parallelsService';
import { safeAsync, successResponse, unauthorizedError, notFoundError } from '@/lib/api-handler';

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
    return notFoundError('User');
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '5', 10) || 5, 10);

  const parallels = await getParallels(user.id, limit);

  return successResponse({ parallels });
});
