/**
 * Story Challenges API
 * Get active and upcoming story challenges
 * v0.40.8 - Story Challenges 1.0 (Community Story Prompts)
 */

import { NextRequest } from 'next/server';
import { safeAsync, successResponse } from '@/lib/api-handler';
import { getActiveStoryChallenges } from '@parel/story/storyChallengeService';

/**
 * GET /api/story/challenges
 * Get active and upcoming story challenges
 */
export const GET = safeAsync(async (req: NextRequest) => {
  try {
    const challenges = await getActiveStoryChallenges();

    // Separate active and upcoming
    const now = new Date();
    const active = challenges.filter((c) => now >= c.startAt && now <= c.endAt);
    const upcoming = challenges.filter((c) => now < c.startAt);

    return successResponse({
      success: true,
      challenges: {
        active,
        upcoming,
      },
    });
  } catch (error: any) {
    return successResponse({
      success: false,
      error: error.message || 'Failed to fetch challenges',
      challenges: {
        active: [],
        upcoming: [],
      },
    });
  }
});

