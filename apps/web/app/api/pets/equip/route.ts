/**
 * Equip Pet API
 * POST /api/pets/equip - Equip a companion
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
import { equipCompanion } from '@/lib/services/petService';
import { logger } from '@/lib/logger';

const EquipSchema = z.object({
  userPetId: z.string().min(1),
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
  const parsed = EquipSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid request data', parsed.error.issues);
  }

  const { userPetId } = parsed.data;

  try {
    await equipCompanion(user.id, userPetId);

    // Send notification
    try {
      const { notifyPetEquipped } = await import('@/lib/services/notificationService');
      const userPet = await prisma.userPet.findUnique({
        where: { id: userPetId },
        include: { pet: true },
      });
      if (userPet) {
        await notifyPetEquipped(user.id, userPet.pet.name);
      }
    } catch (error) {
      logger.debug('[PetEquip] Notification failed', error);
    }

    return successResponse({
      success: true,
      message: 'Companion equipped',
    });
  } catch (error: any) {
    if (error.message === 'Pet not found or does not belong to user') {
      return notFoundError('Pet');
    }
    if (error.message === 'Only companions can be equipped') {
      return validationError('Only companions can be equipped');
    }
    throw error;
  }
});

