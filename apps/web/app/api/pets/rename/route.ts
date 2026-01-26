/**
 * Rename Pet API
 * POST /api/pets/rename - Set pet nickname
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
import { renamePet } from '@/lib/services/petService';

const RenameSchema = z.object({
  userPetId: z.string().min(1),
  nickname: z.string().max(50).nullable().optional(),
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
  const parsed = RenameSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid request data', parsed.error.issues);
  }

  const { userPetId, nickname } = parsed.data;

  // Verify pet belongs to user
  const userPet = await prisma.userPet.findFirst({
    where: {
      id: userPetId,
      userId: user.id,
    },
  });

  if (!userPet) {
    return notFoundError('Pet');
  }

  try {
    await renamePet(user.id, userPetId, nickname || null);

    return successResponse({
      success: true,
      message: nickname ? 'Pet renamed' : 'Nickname removed',
    });
  } catch (error: any) {
    if (error.message.includes('inappropriate')) {
      return validationError(error.message);
    }
    throw error;
  }
});

