/**
 * AURE Interaction Engine - Mix Create API 2.0
 * Generate mix story + collage from multiple rating requests
 * v0.39.8 - Mix Mode 2.0 (Multi-Image Vibe Story)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { generateMixStory } from '@/lib/aure/interaction/mixmodeService';

/**
 * POST /api/aure/interaction/mix/create
 * Generate mix story from request IDs
 * Body: { requestIds: string[] } (2-6 items)
 * Returns: { story, labels, moodScore, collageId }
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
  const { requestIds } = body;

  if (!Array.isArray(requestIds) || requestIds.length < 2 || requestIds.length > 6) {
    return validationError('requestIds must be an array with 2-6 items');
  }

  try {
    const mixStory = await generateMixStory(user.id, requestIds);

    // Collage ID is just the mix session ID (we'll generate on-demand)
    const collageId = mixStory.id;

    return successResponse({
      success: true,
      story: mixStory.story,
      labels: mixStory.labels,
      moodScore: mixStory.moodScore,
      collageId,
      requestIds: mixStory.requestIds,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to generate mix story');
  }
});

