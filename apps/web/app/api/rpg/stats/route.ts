/**
 * GET /api/rpg/stats
 * Returns computed hero stats using canonical stat engine
 * v0.36.11 - Character Sheet Overhaul
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync } from '@/lib/api-handler';
import { successResponse, unauthorizedError } from '@/app/api/_utils';
import { computeHeroStats } from '@/lib/rpg/stats';

export const runtime = 'nodejs';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in to view stats');
  }

  // Get user
  const { prisma } = await import('@/lib/db');
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Compute stats using canonical engine
  const stats = await computeHeroStats(user.id);

  return successResponse(stats);
});

