/**
 * VS Result API
 * Get VS comparison result
 * v0.38.16 - VS Mode
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getVsComparison } from '@/lib/rating/vsService';

/**
 * GET /api/vs/result?vsId=XYZ
 * Get VS comparison result
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const vsId = searchParams.get('vsId');

  if (!vsId) {
    return validationError('vsId is required');
  }

  // Get user ID if authenticated (for vote state)
  let userId: string | undefined;
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    userId = user?.id;
  }

  try {
    const comparison = await getVsComparison(vsId, userId);

    if (!comparison) {
      return validationError('VS comparison not found');
    }

    return successResponse({
      success: true,
      comparison,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to get VS comparison');
  }
});

