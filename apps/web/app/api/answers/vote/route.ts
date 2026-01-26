/**
 * Answer Vote API
 * POST /api/answers/vote
 * Vote on an answer (upvote or downvote)
 * v0.37.11 - Upvote / Downvote Answers
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { voteOnAnswer } from '@/lib/questions/votes/voteService';
import { z } from 'zod';

export const runtime = 'nodejs';

const VoteSchema = z.object({
  answerId: z.string().min(1),
  value: z.union([z.literal(1), z.literal(-1)]),
});

/**
 * POST /api/answers/vote
 * Vote on an answer
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

  const body = await req.json().catch(() => ({}));
  const validation = VoteSchema.safeParse(body);

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message || 'Invalid request');
  }

  const { answerId, value } = validation.data;

  // Service handles toggle logic: if same vote clicked, removes it
  const result = await voteOnAnswer(user.id, answerId, value);

  if (!result.success) {
    return validationError(result.error || 'Failed to vote');
  }

  return successResponse({
    success: true,
    score: result.score,
    userVote: result.userVote,
  });
});

