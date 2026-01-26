/**
 * Admin Seed Pets API
 * POST /api/admin/pets/seed - Seed MVP pet set
 * v0.36.32 - Companions & Pets 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import {
  safeAsync,
  unauthorizedError,
  successResponse,
} from '@/lib/api-handler';
import { seedPets } from '@/lib/services/petService';
import { logger } from '@/lib/logger';

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  try {
    await seedPets();
    logger.info('[Admin] Seeded MVP pets');
    return successResponse({
      success: true,
      message: 'Pets seeded successfully',
    });
  } catch (error) {
    logger.error('[Admin] Failed to seed pets', error);
    throw error;
  }
});
