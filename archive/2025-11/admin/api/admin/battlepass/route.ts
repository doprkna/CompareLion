/**
 * Admin Battlepass API
 * CRUD operations for battlepass tiers
 * v0.36.38 - Seasons & Battlepass 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, forbiddenError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { z } from 'zod';
import { BattlepassTrack, RewardType } from '@/lib/seasons/types';

export const runtime = 'nodejs';

const BattlepassTierSchema = z.object({
  level: z.number().int().min(1),
  xpRequired: z.number().int().min(0),
  freeReward: z.object({
    type: z.nativeEnum(RewardType),
    amount: z.number().int().min(0).optional(),
    itemId: z.string().optional(),
    quantity: z.number().int().min(1).optional(),
  }).optional().nullable(),
  premiumReward: z.object({
    type: z.nativeEnum(RewardType),
    amount: z.number().int().min(0).optional(),
    itemId: z.string().optional(),
    quantity: z.number().int().min(1).optional(),
  }).optional().nullable(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
}

/**
 * GET /api/admin/battlepass?seasonId=X
 * List battlepass tiers for a season
 */
export const GET = safeAsync(async (req: NextRequest) => {
  await requireAdmin();

  const { searchParams } = new URL(req.url);
  const seasonId = searchParams.get('seasonId');

  if (!seasonId) {
    return validationError('seasonId required');
  }

  // TODO: Implement once battlepass tier structure is clear
  // This will fetch tiers for the season and return them

  return successResponse({ 
    tiers: [],
    message: 'Battlepass tier listing will work once models are confirmed',
  });
});

/**
 * POST /api/admin/battlepass
 * Add a tier to a season's battlepass
 */
export const POST = safeAsync(async (req: NextRequest) => {
  await requireAdmin();

  const body = await parseBody(req);
  const parsed = BattlepassTierSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid tier data', parsed.error.issues);
  }

  // TODO: Implement once battlepass tier structure is clear
  // This will create a new tier for the season

  return successResponse({ 
    tier: parsed.data,
    message: 'Tier creation will work once models are confirmed',
  });
});

