/**
 * Photo Challenge Integrity API
 * Get AI integrity analysis and scam flag count for an entry
 * v0.38.6 - Image Integrity Check + Scam Alert
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getIntegrityData } from '@/lib/challenge/photo/scamFlagService';

/**
 * GET /api/challenge/photo/integrity?entryId=XYZ
 * Get integrity analysis and scam flag count for an entry
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
    const data = await getIntegrityData(entryId);

    return successResponse({
      success: true,
      entryId,
      analysis: data.analysis,
      flagCount: data.flagCount,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to get integrity data');
  }
});

