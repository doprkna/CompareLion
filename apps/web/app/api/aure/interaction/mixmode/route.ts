/**
 * AURE Interaction Engine - Mix Mode API
 * Generate mix stories from multiple rating requests
 * v0.39.2 - AURE Interaction Engine
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { generateMixStory } from '@/lib/aure/interaction/mixmodeService';

/**
 * POST /api/aure/interaction/mix
 * Generate mix story from request IDs
 * Body: { requestIds: string[] }
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

  if (!Array.isArray(requestIds) || requestIds.length < 2) {
    return validationError('requestIds must be an array with at least 2 items');
  }

  try {
    const mixStory = await generateMixStory(user.id, requestIds);

    return successResponse({
      success: true,
      story: {
        id: mixStory.id,
        requestIds: mixStory.requestIds,
        story: mixStory.story,
        createdAt: mixStory.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to generate mix story');
  }
});

