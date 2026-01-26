/**
 * Battlepass Progress API
 * GET /api/battlepass/progress
 * Returns user's battlepass progress for current season
 * v0.36.38 - Seasons & Battlepass 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getBattlepassProgress } from '@/lib/seasons/battlepassEngine';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/battlepass/progress
 * Returns user's battlepass progress
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

  const progress = await getBattlepassProgress(user.id);
  
  return successResponse({
    progress,
  });
});

