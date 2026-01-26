/**
 * Poll Results API
 * GET /api/questions/poll/results - Get poll results with vote counts
 * v0.37.4 - Poll Option Feature
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, validationError, successResponse } from '@/lib/api-handler';
import { getPollResults } from '@/lib/questions/poll/pollService';

export const runtime = 'nodejs';

/**
 * GET /api/questions/poll/results
 * Get poll results for a question
 * Query param: questionId
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const questionId = searchParams.get('questionId');

  if (!questionId) {
    return validationError('questionId query parameter is required');
  }

  // Get user ID if authenticated (to show user's vote)
  let userId: string | undefined;
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (user) {
      userId = user.id;
    }
  }

  const results = await getPollResults(questionId, userId);

  if (!results) {
    return validationError('Poll not found or question is not a poll');
  }

  return successResponse({
    results: {
      questionId: results.questionId,
      options: results.options,
      totalVotes: results.totalVotes,
      userVote: results.userVote,
    },
  });
});

