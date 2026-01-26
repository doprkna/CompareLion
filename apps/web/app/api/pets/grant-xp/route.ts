/**
 * Grant Pet XP API (Internal)
 * POST /api/pets/grant-xp - Grant XP to a pet
 * v0.36.32 - Companions & Pets 1.0
 * Note: This is primarily for internal use by fight/question endpoints
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
import { grantPetXP, grantXPToAllUserPets } from '@/lib/services/petService';

const GrantXPSchema = z.object({
  userPetId: z.string().optional(),
  userId: z.string().optional(),
  xpAmount: z.number().int().positive().max(1000), // Max 1000 XP per grant to prevent exploits
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
  const parsed = GrantXPSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid request data', parsed.error.issues);
  }

  const { userPetId, userId, xpAmount } = parsed.data;

  // Validate: must provide either userPetId or userId
  if (!userPetId && !userId) {
    return validationError('Either userPetId or userId must be provided');
  }

  // If userId is provided, grant to all user's pets
  if (userId) {
    // Verify userId matches session user (or admin check could go here)
    if (userId !== user.id) {
      return unauthorizedError('Cannot grant XP to other users');
    }

    await grantXPToAllUserPets(userId, xpAmount);

    return successResponse({
      success: true,
      message: 'XP granted to all pets',
    });
  }

  // Grant to specific pet
  if (!userPetId) {
    return validationError('userPetId is required');
  }

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

  const result = await grantPetXP(userPetId, xpAmount);

  return successResponse({
    success: true,
    leveledUp: result.leveledUp,
    newLevel: result.newLevel,
    message: result.leveledUp ? 'Pet leveled up!' : 'XP granted',
  });
});

