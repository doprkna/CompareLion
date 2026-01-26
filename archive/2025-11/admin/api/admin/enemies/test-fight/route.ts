/**
 * POST /api/admin/enemies/test-fight
 * Test fight as user (admin only)
 * v0.36.35 - Combat Engine 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, forbiddenError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { simulateFight } from '@/lib/services/combatEngine';

export const runtime = 'nodejs';

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, id: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return forbiddenError('Admin access required');
  }

  const body = await parseBody<{
    enemyId: string;
    userId?: string; // Optional: test as specific user, defaults to admin
  }>(req);

  if (!body.enemyId) {
    return validationError('Missing required field: enemyId');
  }

  const testUserId = body.userId || user.id;

  // Simulate fight (without granting rewards)
  const fightResult = await simulateFight(testUserId, body.enemyId);

  return successResponse({
    fightResult,
    message: `Fight simulated: ${fightResult.result} in ${fightResult.rounds} rounds`,
  });
});

