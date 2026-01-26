/**
 * Moderation Flagged Entries API
 * Get flagged entries for moderation
 * v0.38.12 - Power User Moderation View
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, forbiddenError, successResponse } from '@/lib/api-handler';
import { getFlaggedEntries } from '@/lib/challenge/photo/moderationService';

/**
 * Require power user (ADMIN or MODERATOR role)
 */
async function requirePowerUser(): Promise<string> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Power user = ADMIN or MODERATOR role
  if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    throw new Error('Power user access required');
  }

  return user.id;
}

/**
 * GET /api/moderation/flagged
 * Get flagged entries (power user only)
 */
export const GET = safeAsync(async (req: NextRequest) => {
  try {
    await requirePowerUser();
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'User not found') {
      return unauthorizedError(error.message);
    }
    if (error.message === 'Power user access required') {
      return forbiddenError('Power user access required');
    }
    throw error;
  }

  try {
    const entries = await getFlaggedEntries();

    return successResponse({
      success: true,
      entries,
      count: entries.length,
    });
  } catch (error: any) {
    return unauthorizedError(error.message || 'Failed to get flagged entries');
  }
});
