/**
 * Photo Challenge AI Comment API
 * Get AI-generated comment for a photo entry
 * v0.37.12 - Photo Challenge
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getAIComment } from '@/lib/challenge/photo/aiCommentService';

/**
 * GET /api/challenge/photo/ai-comment?entryId=XYZ
 * Get AI-generated comment for a photo entry
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const { searchParams } = new URL(req.url);
  const entryId = searchParams.get('entryId');

  if (!entryId) {
    return validationError('entryId is required');
  }

  try {
    const comment = await getAIComment(entryId);

    return successResponse({
      success: true,
      entryId,
      comment,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to generate comment');
  }
});

