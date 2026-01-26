/**
 * Vote Poll API
 * POST /api/questions/poll/vote - Vote on a poll
 * v0.37.4 - Poll Option Feature
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { votePoll } from '@/lib/questions/poll/pollService';
import { VotePollSchema } from '@/lib/questions/poll/schemas';

export const runtime = 'nodejs';

/**
 * POST /api/questions/poll/vote
 * Vote on a poll question
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

  const body = await parseBody(req);
  const validation = VotePollSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request data', validation.error.issues);
  }

  const { questionId, optionId } = validation.data;

  const result = await votePoll(user.id, questionId, optionId);

  if (!result.success) {
    return validationError(result.error || 'Failed to vote on poll');
  }

  return successResponse({
    success: true,
    message: 'Vote recorded successfully',
  });
});

