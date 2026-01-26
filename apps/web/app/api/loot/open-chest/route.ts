/**
 * Loot Open Chest API
 * POST /api/loot/open-chest - Open a user chest
 * v0.36.30 - Loot System 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { openChest } from '@/lib/services/chestService';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const OpenChestSchema = z.object({
  userChestId: z.string().min(1),
});

/**
 * POST /api/loot/open-chest
 * Open a chest and receive rewards
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
  const validation = OpenChestSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request data');
  }

  const { userChestId } = validation.data;

  try {
    const result = await openChest(user.id, userChestId);

    return successResponse({
      success: true,
      items: result.items,
      gold: result.gold,
      xp: result.xp,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to open chest');
  }
});

