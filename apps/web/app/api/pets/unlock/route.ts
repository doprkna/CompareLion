/**
 * Unlock Pet API
 * POST /api/pets/unlock - Unlock a new pet (used by loot system)
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

const UnlockSchema = z.object({
  petId: z.string().min(1),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json();
  const parsed = UnlockSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid request data', parsed.error.issues);
  }

  const { petId } = parsed.data;

  // Verify pet exists
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
  });

  if (!pet) {
    return notFoundError('Pet');
  }

  // Check if already unlocked (idempotent)
  const existing = await prisma.userPet.findFirst({
    where: {
      userId: user.id,
      petId,
    },
  });

  if (existing) {
    return successResponse({
      success: true,
      alreadyUnlocked: true,
      userPetId: existing.id,
      message: 'Pet already unlocked',
    });
  }

  // Unlock pet
  const userPetId = await unlockPet(user.id, petId);

  // Send notification
  try {
    const { notifyPetUnlocked } = await import('@/lib/services/notificationService');
    await notifyPetUnlocked(user.id, pet.name);
  } catch (error) {
    logger.debug('[PetUnlock] Notification failed', error);
  }

  return successResponse({
    success: true,
    userPetId,
    message: `You unlocked ${pet.name}!`,
  });
});

