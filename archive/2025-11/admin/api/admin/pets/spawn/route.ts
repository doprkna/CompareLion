/**
 * Admin Spawn Pet API
 * POST /api/admin/pets/spawn - Spawn a pet for a user
 * v0.36.32 - Companions & Pets 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import {
  safeAsync,
  unauthorizedError,
  validationError,
  notFoundError,
  successResponse,
} from '@/lib/api-handler';
import { z } from 'zod';
import { unlockPet } from '@/lib/services/petService';
import { logger } from '@/lib/logger';

const SpawnPetSchema = z.object({
  userId: z.string().min(1),
  petId: z.string().min(1),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const body = await req.json();
  const parsed = SpawnPetSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid request data', parsed.error.issues);
  }

  const { userId, petId } = parsed.data;

  // Verify pet exists
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
  });

  if (!pet) {
    return notFoundError('Pet');
  }

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return notFoundError('User');
  }

  // Unlock pet (idempotent)
  const userPetId = await unlockPet(userId, petId);

  logger.info(`[Admin] Spawned pet ${petId} for user ${userId}`);

  return successResponse({
    success: true,
    userPetId,
    message: `Pet ${pet.name} spawned for user`,
  });
});

