/**
 * Photo Challenge Pairing API
 * Get AI-generated snack pairing suggestions
 * v0.37.13 - AI Snack Pairing
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getSnackPairing } from '@/lib/challenge/photo/pairingService';

/**
 * GET /api/challenge/photo/pairing?entryId=XYZ
 * Get AI-generated snack pairing suggestions for a photo entry
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
    const pairing = await getSnackPairing(entryId);

    return successResponse({
      success: true,
      entryId,
      pairing: pairing.pairing,
      healthierAlternative: pairing.healthierAlternative,
      cached: pairing.cached,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to generate pairing suggestions');
  }
});

