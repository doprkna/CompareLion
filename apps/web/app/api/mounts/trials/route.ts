/**
 * Mount Trials API
 * v0.34.4 - GET available trials for user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, authError, successResponse } from '@/lib/api-handler';
import { getUserAvailableTrials } from '@/lib/mounts/trials';

/**
 * GET /api/mounts/trials
 * Returns all available mount trials for the authenticated user
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return authError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return authError('User not found');
  }

  const trials = await getUserAvailableTrials(user.id);

  return successResponse({
    trials,
    count: trials.length,
  });
});
