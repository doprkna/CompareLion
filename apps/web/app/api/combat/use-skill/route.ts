/**
 * Use Skill in Combat API
 * POST /api/combat/use-skill - Use active skill in combat
 * v0.36.33 - Skills & Abilities v1
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import {
  safeAsync,
  unauthorizedError,
  validationError,
  notFoundError,
  successResponse,
} from '@/lib/api-handler';
import { z } from 'zod';
import {
  getEquippedActiveSkill,
  useActiveSkill,
  decrementSkillCooldowns,
} from '@/lib/services/skillService';
import { runActiveSkillTurn } from '@/lib/services/combatRunner';
import { getActiveSession, formatSession } from '@/lib/services/combatService';
import { logger } from '@/lib/logger';

const UseSkillSchema = z.object({
  userSkillId: z.string().optional(), // Optional - uses equipped if not provided
});

export const POST = safeAsync(async (req: NextRequest) => {
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

  const body = await req.json();
  const parsed = UseSkillSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid request data', parsed.error.issues);
  }

  // Get equipped active skill
  const equippedSkill = await getEquippedActiveSkill(user.id);
  if (!equippedSkill) {
    return validationError('No active skill equipped');
  }

  const userSkillId = parsed.data.userSkillId || equippedSkill.id;

  // Verify skill belongs to user
  if (equippedSkill.id !== userSkillId) {
    return validationError('Skill does not belong to user');
  }

  // Check cooldown
  if (equippedSkill.cooldownRemaining > 0) {
    return validationError(`Skill is on cooldown (${equippedSkill.cooldownRemaining} rounds remaining)`);
  }

  // Get active combat session
  const combatSession = await getActiveSession(user.id);
  if (!combatSession) {
    return validationError('No active combat session');
  }

  // Get user stats for skill calculation
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      level: true,
      stats: true,
    },
  });

  // Get hero stats (simplified - can be enhanced)
  const heroStats = {
    id: user.id,
    attack: 10 + (userData?.level || 1) * 2, // Simplified attack calculation
    defense: 5 + (userData?.level || 1) * 2,
    maxHp: 50 + (userData?.level || 1) * 10,
    currentHp: combatSession.heroHp,
  };

  const enemyStats = {
    id: combatSession.enemyId || 'enemy',
    attack: 8,
    defense: 5,
    maxHp: combatSession.enemyMaxHp || 30,
    currentHp: combatSession.enemyHp,
  };

  // Execute skill
  const skillResult = runActiveSkillTurn(
    equippedSkill.skill.name,
    equippedSkill.skill.power,
    {
      round: 1,
      attacker: heroStats,
      defender: enemyStats,
      isPlayerTurn: true,
    }
  );

  if (!skillResult.success) {
    return validationError(skillResult.message);
  }

  // Apply skill effects
  let newEnemyHp = combatSession.enemyHp;
  let newHeroHp = combatSession.heroHp;
  const combatLog: any[] = [];

  if (skillResult.damage) {
    newEnemyHp = Math.max(0, combatSession.enemyHp - skillResult.damage);
    combatLog.push({
      type: 'skill',
      message: skillResult.message,
      damage: skillResult.damage,
      icon: equippedSkill.skill.icon || '⚔️',
      timestamp: new Date(),
    });
  }

  if (skillResult.heal) {
    newHeroHp = Math.min(combatSession.heroMaxHp, combatSession.heroHp + skillResult.heal);
    combatLog.push({
      type: 'heal',
      message: skillResult.message,
      heal: skillResult.heal,
      icon: equippedSkill.skill.icon || '💚',
      timestamp: new Date(),
    });
  }

  // Add stun effect message if applicable
  if (skillResult.effects?.stun) {
    combatLog.push({
      type: 'skill',
      message: `💫 ${combatSession.enemyName} is stunned!`,
      icon: '💫',
      timestamp: new Date(),
    });
  }

  // Update session
  const updatedSession = await prisma.combatSession.update({
    where: { id: combatSession.id },
    data: {
      enemyHp: newEnemyHp,
      heroHp: newHeroHp,
      lastActionAt: new Date(),
    },
  });

  // Use skill (sets cooldown)
  await useActiveSkill(userSkillId);

  // Decrement all cooldowns (for next round)
  await decrementSkillCooldowns(user.id);

  // Check if enemy is killed
  if (newEnemyHp === 0) {
    const { handleKill } = await import('@/lib/services/combatService');
    return handleKill(user.id, updatedSession, 0);
  }

  return successResponse({
    success: true,
    session: formatSession(updatedSession),
    combatLog,
    skillUsed: {
      name: equippedSkill.skill.name,
      cooldown: equippedSkill.skill.cooldown || 0,
    },
  });
});

