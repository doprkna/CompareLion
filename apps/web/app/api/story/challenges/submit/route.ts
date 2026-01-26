/**
 * Story Challenge Submit API
 * Submit story to challenge
 * v0.40.8 - Story Challenges 1.0 (Community Story Prompts)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { submitStoryToChallenge } from '@parel/story/storyChallengeService';

/**
 * POST /api/story/challenges/submit
 * Submit story to challenge
 * Body: { storyId: string, challengeId: string }
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

  const body = await req.json();
  const { storyId, challengeId } = body;

  if (!storyId || typeof storyId !== 'string') {
    return validationError('storyId is required');
  }

  if (!challengeId || typeof challengeId !== 'string') {
    return validationError('challengeId is required');
  }

  try {
    await submitStoryToChallenge(user.id, storyId, challengeId);

    return successResponse({
      success: true,
      message: 'Story submitted to challenge successfully',
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to submit story to challenge');
  }
});

