/**
 * Loot Fight Drop API
 * POST /api/loot/fight-drop - Process loot drop after fight
 * v0.36.30 - Loot System 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { processFightDrop } from '@/lib/services/lootService';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const FightDropSchema = z.object({
  fightId: z.string().min(1),
  enemyType: z.string().optional(),
});

/**
 * POST /api/loot/fight-drop
 * Process loot drop after fight completion
 */
export const POST = safeAsync(async (req: NextRequest) => {
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

  const body = await req.json();
  const validation = FightDropSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request data');
  }

  const { fightId, enemyType } = validation.data;

  try {
    const lootDrop = await processFightDrop(user.id, fightId, enemyType);

    if (!lootDrop) {
      return successResponse({
        dropped: false,
        message: 'No loot drop this time',
      });
    }

    return successResponse({
      dropped: true,
      item: lootDrop.item,
      rarity: lootDrop.rarity,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to process loot drop');
  }
});

