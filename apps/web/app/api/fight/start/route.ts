/**
 * POST /api/fight/start
 * Start a fight between hero and enemy
 * v0.36.0 - Full Fighting System MVP
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, authError, validationError } from '@/lib/api-handler';
import { prisma } from '@/lib/db';
import { simulateFight, Combatant } from '@/lib/fightEngine';
import { addXP } from '@/lib/services/progressionService';
import { z } from 'zod';

export const runtime = 'nodejs';

const StartFightSchema = z.object({
  enemyId: z.string(),
});

/**
 * Calculate hero stats from User model
 */
async function getHeroCombatant(userId: string): Promise<Combatant> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      level: true,
      stats: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const stats = (user.stats || {}) as { str?: number; vit?: number; dex?: number };
  
  // Calculate stats with defaults
  const str = stats.str || 10 + user.level;
  const def = Math.floor((stats.vit || 5) * 0.5) + Math.floor(user.level * 0.3);
  const speed = stats.dex || 5 + Math.floor(user.level * 0.2);
  const maxHp = 50 + (stats.vit || 10) * 2 + user.level * 5;
  const hp = maxHp; // Start at full HP

  return {
    id: user.id,
    name: user.name || 'Hero',
    hp,
    maxHp,
    str,
    def,
    speed,
  };
}

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return authError();
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return authError();
  }

  const body = await req.json();
  const validation = StartFightSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request', validation.error.format());
  }

  const { enemyId } = validation.data;

  // Fetch enemy
  const enemy = await prisma.enemy.findUnique({
    where: { id: enemyId },
  });

  if (!enemy) {
    return validationError('Enemy not found');
  }

  // Get hero combatant
  const hero = await getHeroCombatant(user.id);

  // Create enemy combatant
  const enemyCombatant: Combatant = {
    id: enemy.id,
    name: enemy.name,
    hp: enemy.hp,
    maxHp: enemy.hp,
    str: enemy.str,
    def: enemy.def,
    speed: enemy.speed,
  };

  // Simulate fight
  const fightResult = simulateFight(hero, enemyCombatant);

  // Determine winner string
  const winner = fightResult.winner === hero.id ? 'hero' : 'enemy';

  // Save fight log
  const fight = await prisma.fight.create({
    data: {
      heroId: user.id,
      enemyId: enemy.id,
      rounds: fightResult.rounds,
      winner,
    },
  });

  // If hero won, award XP and Gold
  if (winner === 'hero') {
    await addXP(user.id, enemy.xpReward, 'fight');
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        funds: {
          increment: enemy.goldReward,
        },
      },
    });
  }

  return NextResponse.json({
    success: true,
    fight: {
      id: fight.id,
      winner,
      rounds: fightResult.rounds,
      totalRounds: fightResult.totalRounds,
      xpReward: winner === 'hero' ? enemy.xpReward : 0,
      goldReward: winner === 'hero' ? enemy.goldReward : 0,
    },
  });
});

