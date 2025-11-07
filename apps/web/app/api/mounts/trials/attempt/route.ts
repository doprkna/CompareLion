/**
 * Mount Trials Attempt API
 * v0.34.4 - POST progress or completion
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import {
  safeAsync,
  authError,
  validationError,
  successResponse,
  notFoundError,
} from '@/lib/api-handler';
import {
  updateTrialProgress,
  completeTrial,
} from '@/lib/mounts/trials';

/**
 * POST /api/mounts/trials/attempt
 * Update trial progress or complete trial
 * Body: { trialId: string, action: 'progress' | 'complete', incrementBy?: number }
 */
export const POST = safeAsync(async (req: NextRequest) => {
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

  const body = await req.json();
  const { trialId, action, incrementBy = 1 } = body;

  if (!trialId || !action) {
    return validationError('Missing trialId or action', [
      { message: 'Provide trialId and action (progress or complete)' },
    ]);
  }

  if (action !== 'progress' && action !== 'complete') {
    return validationError('Invalid action', [
      { message: 'Action must be "progress" or "complete"' },
    ]);
  }

  // Check if trial exists
  const trial = await prisma.$queryRaw<any[]>`
    SELECT * FROM mount_trials WHERE id = ${trialId} LIMIT 1
  `;

  if (!trial || trial.length === 0) {
    return notFoundError('Trial not found');
  }

  if (action === 'progress') {
    // Update progress
    const userTrial = await updateTrialProgress(user.id, trialId, incrementBy);

    return successResponse({
      userTrial,
      message: `Progress updated: ${userTrial.progress}`,
    });
  }

  if (action === 'complete') {
    // Complete trial and apply rewards
    try {
      const reward = await completeTrial(user.id, trialId);

      return successResponse({
        reward,
        message: `Trial completed! Reward: ${reward.description}`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete trial';
      return validationError(message);
    }
  }

  return validationError('Invalid request');
});
