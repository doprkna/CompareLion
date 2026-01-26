/**
 * Question Insights API
 * GET /api/questions/insights?questionId=XYZ
 * Returns basic analytics for a question
 * v0.37.6 - Question Insights (Basic)
 */

import { NextRequest } from 'next/server';
import { safeAsync, validationError, successResponse } from '@/lib/api-handler';
import { getQuestionInsights } from '@/lib/questions/insights/insightsService';

export const runtime = 'nodejs';

/**
 * GET /api/questions/insights?questionId=XYZ
 * Get insights for a question
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const questionId = req.nextUrl.searchParams.get('questionId');

  if (!questionId) {
    return validationError('questionId parameter is required');
  }

  const insights = await getQuestionInsights(questionId);

  return successResponse({
    success: true,
    insights,
    questionId,
  });
});

