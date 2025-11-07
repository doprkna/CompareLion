import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

/**
 * GET /api/user/gold
 * Returns current user's gold balance
 * v0.26.2 - Economy Feedback & Shop Loop
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      funds: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  return successResponse({
    gold: Number(user.funds),
  });
});

