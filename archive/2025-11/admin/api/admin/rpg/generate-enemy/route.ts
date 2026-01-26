/**
 * POST /api/admin/rpg/generate-enemy
 * Admin endpoint for testing enemy generation
 * v0.36.12 - Hybrid Enemy System
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync } from '@/lib/api-handler';
import { successResponse, unauthorizedError, validationError } from '@/app/api/_utils';
import { generateEnemy } from '@/lib/rpg/enemyGenerator';
import { computeHeroStats } from '@/lib/rpg/stats';
import { z } from 'zod';

export const runtime = 'nodejs';

const GenerateEnemySchema = z.object({
  playerLevel: z.number().min(1).max(100).optional(),
  tier: z.enum(['EASY', 'NORMAL', 'HARD', 'ELITE']).optional(),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in');
  }

  // Check if user is admin (simplified check - in production, use proper admin check)
  const { prisma } = await import('@/lib/db');
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // For now, allow any logged-in user (add proper admin check in production)
  // if (user.email !== 'admin@example.com') {
  //   return unauthorizedError('Admin access required');
  // }

  const body = await req.json();
  const validation = GenerateEnemySchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request', validation.error.format());
  }

  const { playerLevel, tier } = validation.data;

  // Create mock player stats for generation
  // In real usage, this would come from actual player stats
  const mockPlayerStats = {
    level: playerLevel || 5,
    xp: 0,
    maxHp: 100,
    attackPower: 20,
    defense: 10,
    critChance: 5,
    speed: 5,
    equipment: [],
  };

  // Generate enemy
  const generatedEnemy = await generateEnemy(mockPlayerStats, { tier });

  return successResponse(generatedEnemy);
});

