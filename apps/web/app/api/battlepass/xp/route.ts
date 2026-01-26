/**
 * BattlePass XP API
 * POST /api/battlepass/xp - Add XP to battlepass
 * v0.36.28 - BattlePass 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { addBattlePassXP } from '@/lib/services/battlepassService';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const runtime = 'nodejs';

const AddXPSchema = z.object({
  amount: z.number().int().positive(),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json();
  const validation = AddXPSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request data');
  }

  const { amount } = validation.data;

  const result = await addBattlePassXP(user.id, amount);

  return successResponse(result);
});

