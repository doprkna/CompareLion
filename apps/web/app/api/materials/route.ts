/**
 * Materials API
 * GET /api/materials - List user's materials inventory
 * v0.36.40 - Materials & Crafting 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

export const runtime = 'nodejs';

/**
 * GET /api/materials
 * Get user's materials inventory
 */
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

  // Get user materials with material details
  const userMaterials = await prisma.userMaterial.findMany({
    where: { userId: user.id },
    include: {
      material: {
        select: {
          id: true,
          name: true,
          description: true,
          rarity: true,
          category: true,
          icon: true,
          emoji: true,
        },
      },
    },
    orderBy: [
      { material: { rarity: 'asc' } },
      { material: { name: 'asc' } },
    ],
  });

  // Filter out materials with zero quantity and format response
  const materials = userMaterials
    .filter(um => um.quantity > 0)
    .map(um => ({
      id: um.id,
      materialId: um.materialId,
      quantity: um.quantity,
      material: um.material ? {
        id: um.material.id,
        name: um.material.name,
        description: um.material.description,
        rarity: um.material.rarity,
        category: um.material.category,
        icon: um.material.icon,
        emoji: um.material.emoji,
      } : null,
    }));

  return successResponse({
    materials,
    totalMaterials: materials.length,
  });
});

