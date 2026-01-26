/**
 * Question of the Day API
 * GET /api/questions/qotd
 * Returns today's question of the day
 * v0.37.10 - Question of the Day Widget
 */

import { NextRequest } from 'next/server';
import { safeAsync, successResponse } from '@/lib/api-handler';
import { getQuestionOfTheDay } from '@/lib/questions/qotd/qotdService';

export const runtime = 'nodejs';

/**
 * GET /api/questions/qotd
 * Get question of the day
 */
export const GET = safeAsync(async (_req: NextRequest) => {
  const qotd = await getQuestionOfTheDay();

  if (!qotd) {
    return successResponse({
      success: false,
      message: 'No question available',
    });
  }

  return successResponse({
    success: true,
    questionId: qotd.questionId,
    text: qotd.text,
    tags: qotd.tags || [],
    stats: qotd.stats,
  });
});

