/**
 * Admin Pets API
 * GET /api/admin/pets - List all pets and user pet data
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

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  // Check if user is admin (simple check - can be enhanced)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Get all pets
  const pets = await prisma.pet.findMany({
    orderBy: [
      { rarity: 'asc' },
      { name: 'asc' },
    ],
  });

  // Get user pet counts
  const userPetCounts = await prisma.userPet.groupBy({
    by: ['petId'],
    _count: {
      id: true,
    },
  });

  const countMap = new Map(userPetCounts.map(upc => [upc.petId, upc._count.id]));

  const petsWithStats = pets.map(pet => ({
    id: pet.id,
    name: pet.name,
    type: pet.type,
    rarity: pet.rarity,
    bonus: pet.bonus,
    icon: pet.icon,
    description: pet.description,
    userCount: countMap.get(pet.id) || 0,
  }));

  return successResponse({
    pets: petsWithStats,
  });
});

