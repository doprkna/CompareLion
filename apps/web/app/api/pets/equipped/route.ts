/**
 * GET /api/pets/equipped
 * Get user's equipped pet
 * v0.36.35 - Combat Engine 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

export const runtime = 'nodejs';

export const GET = safeAsync(async (req: NextRequest) => {
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

  // Get equipped pet
  const userPet = await prisma.userPet.findFirst({
    where: {
      userId: user.id,
      equipped: true,
    },
    include: {
      pet: true,
    },
  });

  if (!userPet) {
    return successResponse(null);
  }

  return successResponse({
    id: userPet.id,
    petId: userPet.petId,
    name: userPet.pet.name,
    icon: userPet.pet.icon,
    level: userPet.level,
  });
});

