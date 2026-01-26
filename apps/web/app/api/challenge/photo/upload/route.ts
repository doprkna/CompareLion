/**
 * Photo Challenge Upload API
 * Upload photo and submit to challenge
 * v0.37.12 - Photo Challenge
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { uploadPhoto, submitToChallenge } from '@/lib/challenge/photo/photoService';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

/**
 * POST /api/challenge/photo/upload
 * Upload photo and submit to challenge
 * multipart/form-data: { file, category }
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

  // Parse multipart form data
  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return validationError('Invalid form data');
  }

  const file = formData.get('file') as File | null;
  const category = formData.get('category')?.toString();

  if (!file || !(file instanceof File)) {
    return validationError('File is required');
  }

  if (!category) {
    return validationError('Category is required');
  }

  // Validate category
  const validCategories = ['healthy', 'weird', 'creative', 'speedrun'];
  if (!validCategories.includes(category)) {
    return validationError(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }

  try {
    // Upload photo
    const imageUrl = await uploadPhoto(file, user.id);

    // Submit to challenge
    const entry = await submitToChallenge(user.id, imageUrl, category);

    return successResponse({
      success: true,
      entry: {
        id: entry.id,
        imageUrl: entry.imageUrl,
        category: entry.category,
        createdAt: entry.createdAt,
      },
    });
  } catch (error: any) {
    logger.error('[PhotoUpload] Failed to upload photo', {
      userId: user.id,
      category,
      error,
    });

    return validationError(error.message || 'Failed to upload photo');
  }
});

