/**
 * Parel Story Generator - Image Upload API
 * Upload image for story panels
 * v0.40.1 - Parel Story Generator 1.0 (Creative AI Layer)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { uploadPhoto } from '@/lib/challenge/photo/photoService';

/**
 * POST /api/story/upload-image
 * Upload image file for story panel
 * multipart/form-data: { file }
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

  if (!file || !(file instanceof File)) {
    return validationError('File is required');
  }

  try {
    // Upload photo (using existing photo upload service)
    const imageUrl = await uploadPhoto(file, user.id);

    return successResponse({
      success: true,
      imageUrl,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to upload image');
  }
});

