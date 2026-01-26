/**
 * Unequip Companion API
 * v0.36.17 - Companions + Pets System v0.1
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { unequipCompanion } from '@/lib/rpg/companion';
import { computeHeroStats } from '@/lib/rpg/stats';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * POST /api/companion/unequip
 * Unequip current companion
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

  await unequipCompanion(user.id);
  
  // Return updated hero stats
  const heroStats = await computeHeroStats(user.id);
  
  return successResponse({
    success: true,
    heroStats,
  });
});


