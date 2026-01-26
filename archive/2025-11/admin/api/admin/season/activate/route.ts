/**
 * Admin Season Activate API
 * v0.36.23 - Season Pass System
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { activateSeason } from '@/lib/season/seed';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';

export const runtime = 'nodejs';

/**
 * POST /api/admin/season/activate
 * Activate a season (deactivate others)
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return unauthorizedError('Admin access required');
  }

  const body = await req.json().catch(() => ({}));
  const { seasonId } = body;

  if (!seasonId) {
    return validationError('seasonId is required');
  }

  try {
    await activateSeason(seasonId);
    return successResponse({
      success: true,
      seasonId,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to activate season');
  }
});


