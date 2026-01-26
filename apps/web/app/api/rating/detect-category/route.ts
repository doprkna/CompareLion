/**
 * Category Detection API
 * Detect image category using AI
 * v0.38.8 - AI Category Detection
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { detectImageCategory } from '@/lib/rating/categoryDetection';

/**
 * POST /api/rating/detect-category
 * Detect category for an image
 * Body: { imageUrl }
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  // Parse and validate request
  const body = await req.json();
  const { imageUrl } = body;

  if (!imageUrl || typeof imageUrl !== 'string') {
    return validationError('imageUrl is required');
  }

  try {
    const detection = await detectImageCategory(imageUrl);

    return successResponse({
      success: true,
      categories: detection.categories,
      final: detection.final,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to detect category');
  }
});

