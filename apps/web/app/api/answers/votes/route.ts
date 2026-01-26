/**
 * Answer Votes API
 * GET /api/answers/votes?answerId=XYZ
 * Get vote state for an answer
 * v0.37.11 - Upvote / Downvote Answers
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { getVoteState } from '@/lib/questions/votes/voteService';

export const runtime = 'nodejs';

/**
 * GET /api/answers/votes?answerId=XYZ
 * Get vote state (score + user vote)
 */
export const GET = safeAsync(async (req: NextRequest) => {
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

  const answerId = req.nextUrl.searchParams.get('answerId');

  if (!answerId) {
    return validationError('answerId parameter is required');
  }

  const voteState = await getVoteState(user.id, answerId);

  return successResponse({
    success: true,
    score: voteState.score,
    userVote: voteState.userVote,
  });
});

