/**
 * Question Summary API
 * GET /api/questions/summary?questionId=XYZ
 * Returns AI-generated summary of question answers
 * v0.37.8 - AI Summary Snippet
 */

import { NextRequest } from 'next/server';
import { safeAsync, validationError, successResponse } from '@/lib/api-handler';
import { generateSummarySnippet } from '@/lib/questions/summary/summaryService';

export const runtime = 'nodejs';

/**
 * GET /api/questions/summary?questionId=XYZ
 * Get AI-generated summary for a question
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const questionId = req.nextUrl.searchParams.get('questionId');

  if (!questionId) {
    return validationError('questionId parameter is required');
  }

  try {
    const summary = await generateSummarySnippet(questionId);
    
    // Note: Caching is handled internally by generateSummarySnippet
    // The cached flag would require tracking cache hits, which adds complexity
    // For simplicity, we return cached: false (service still caches for performance)
    
    return successResponse({
      success: true,
      summary,
      cached: false, // Service handles caching internally
      questionId,
    });
  } catch (error) {
    return successResponse({
      success: false,
      summary: 'Unable to generate summary at this time.',
      cached: false,
      questionId,
    });
  }
});

