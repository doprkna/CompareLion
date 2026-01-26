/**
 * Pets API
 * GET /api/pets - Get user's pets
 * v0.36.32 - Companions & Pets 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import {
  safeAsync,
  unauthorizedError,
  successResponse,
} from '@/lib/api-handler';
import { getUserPets } from '@/lib/services/petService';

export const GET = safeAsync(async (req: NextRequest) => {
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

  const userPets = await getUserPets(user.id);

  // Format response
  const formattedPets = userPets.map((up) => ({
    id: up.id,
    petId: up.petId,
    level: up.level,
    xp: up.xp,
    equipped: up.equipped,
    nickname: up.nickname,
    createdAt: up.createdAt,
    pet: {
      id: up.pet.id,
      name: up.pet.name,
      type: up.pet.type,
      rarity: up.pet.rarity,
      bonus: up.pet.bonus,
      icon: up.pet.icon,
      description: up.pet.description,
    },
    xpNeeded: 10 * up.level, // XP needed for next level
  }));

  return successResponse({
    pets: formattedPets,
  });
});

