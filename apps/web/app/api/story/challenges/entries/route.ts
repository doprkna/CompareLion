/**
 * Story Challenge Entries API
 * Get challenge entries
 * v0.40.8 - Story Challenges 1.0 (Community Story Prompts)
 */

import { NextRequest } from 'next/server';
import { safeAsync, validationError, successResponse } from '@/lib/api-handler';
import { getChallengeEntries } from '@parel/story/storyChallengeService';

/**
 * GET /api/story/challenges/entries
 * Get challenge entries
 * Query params: challengeId (required)
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const challengeId = searchParams.get('challengeId');

  if (!challengeId || typeof challengeId !== 'string') {
    return validationError('challengeId query parameter is required');
  }

  try {
    const entries = await getChallengeEntries(challengeId);

    return successResponse({
      success: true,
      entries,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to fetch challenge entries');
  }
});

