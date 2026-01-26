/**
 * BattlePass Activate Premium API
 * POST /api/battlepass/activate-premium - Activate premium battlepass
 * v0.36.28 - BattlePass 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { activatePremiumBattlePass } from '@/lib/services/battlepassService';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // TODO: Verify Stripe payment before activating
  // For now, allow activation (will be gated by Stripe webhook in production)

  const result = await activatePremiumBattlePass(user.id);

  if (!result.success) {
    return unauthorizedError(result.error || 'Failed to activate premium');
  }

  return successResponse(result);
});

