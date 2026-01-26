/**
 * Skill Service
 * Skills & Abilities system management
 * v0.36.33 - Skills & Abilities v1
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface SkillData {
  name: string;
  type: 'active' | 'passive';
  description: string;
  power: number;
  cooldown?: number;
  icon?: string;
  scaling?: { perLevel?: number };
}

/**
 * MVP Skill Set - Seed data
 */
export const MVP_SKILLS: SkillData[] = [
  // Passive Skills
  {
    name: 'Tough Skin',
    type: 'passive',
    description: '+5% defense',
    power: 5,
    icon: '🛡️',
  },
  {
    name: 'Sharp Mind',
    type: 'passive',
    description: '+3% crit chance',
    power: 3,
    icon: '🧠',
  },
  {
    name: 'Quick Step',
    type: 'passive',
    description: '+3 speed',
    power: 3,
    icon: '💨',
  },
  {
    name: 'Lucky Bones',
    type: 'passive',
    description: '+5% loot luck',
    power: 5,
    icon: '🍀',
  },
  // Active Skills
  {
    name: 'Power Strike',
    type: 'active',
    description: 'Deal 1.5x attack damage',
    power: 150, // 1.5x multiplier (stored as 150 for easier calculation)
    cooldown: 3,
    icon: '⚔️',
  },
  {
    name: 'Shield Bash',
    type: 'active',
    description: 'Deal 1.2x attack damage, 20% chance to stun',
    power: 120, // 1.2x multiplier
    cooldown: 3,
    icon: '🛡️',
  },
  {
    name: 'Focus Heal',
    type: 'active',
    description: 'Restore 10% max HP',
    power: 10, // 10% heal
    cooldown: 4,
    icon: '💚',
  },
];

/**
 * Seed skills into database (idempotent)
 */
export async function seedSkills(): Promise<void> {
  try {
    for (const skillData of MVP_SKILLS) {
      await prisma.skill.upsert({
        where: { name: skillData.name },
        update: {
          type: skillData.type,
          description: skillData.description,
          power: skillData.power,
          cooldown: skillData.cooldown || null,
          icon: skillData.icon || null,
          scaling: skillData.scaling || null,
        },
        create: {
          name: skillData.name,
          type: skillData.type,
          description: skillData.description,
          power: skillData.power,
          cooldown: skillData.cooldown || null,
          icon: skillData.icon || null,
          scaling: skillData.scaling || null,
        },
      });
    }
    logger.debug(`[SkillService] Seeded ${MVP_SKILLS.length} skills`);
  } catch (error) {
    logger.error('[SkillService] Failed to seed skills', error);
    throw error;
  }
}

/**
 * Get user's skills with full skill data
 */
export async function getUserSkills(userId: string) {
  return await prisma.userSkill.findMany({
    where: { userId },
    include: {
      skill: true,
    },
    orderBy: [
      { skill: { type: 'asc' } },
      { skill: { name: 'asc' } },
    ],
  });
}

/**
 * Get user's equipped active skill
 */
export async function getEquippedActiveSkill(userId: string) {
  return await prisma.userSkill.findFirst({
    where: {
      userId,
      equipped: true,
      skill: {
        type: 'active',
      },
    },
    include: {
      skill: true,
    },
  });
}

/**
 * Get user's passive skills (all unlocked passives are active)
 */
export async function getUserPassiveSkills(userId: string) {
  return await prisma.userSkill.findMany({
    where: {
      userId,
      skill: {
        type: 'passive',
      },
    },
    include: {
      skill: true,
    },
  });
}

/**
 * Unlock a skill for a user (idempotent - prevents duplicates)
 */
export async function unlockSkill(userId: string, skillId: string): Promise<string> {
  // Check if user already has this skill
  const existing = await prisma.userSkill.findFirst({
    where: {
      userId,
      skillId,
    },
  });

  if (existing) {
    return existing.id; // Already unlocked
  }

  // Create new UserSkill
  const userSkill = await prisma.userSkill.create({
    data: {
      userId,
      skillId,
      level: 1,
      equipped: false,
      cooldownRemaining: 0,
    },
  });

  logger.debug(`[SkillService] Unlocked skill ${skillId} for user ${userId}`);
  return userSkill.id;
}

/**
 * Equip an active skill (unequips others automatically)
 */
export async function equipActiveSkill(userId: string, userSkillId: string): Promise<void> {
  // Verify skill belongs to user and is active
  const userSkill = await prisma.userSkill.findFirst({
    where: {
      id: userSkillId,
      userId,
    },
    include: {
      skill: true,
    },
  });

  if (!userSkill) {
    throw new Error('Skill not found or does not belong to user');
  }

  if (userSkill.skill.type !== 'active') {
    throw new Error('Only active skills can be equipped');
  }

  // Unequip all other active skills
  await prisma.userSkill.updateMany({
    where: {
      userId,
      equipped: true,
      skill: {
        type: 'active',
      },
    },
    data: {
      equipped: false,
    },
  });

  // Equip this skill
  await prisma.userSkill.update({
    where: { id: userSkillId },
    data: { equipped: true },
  });

  logger.debug(`[SkillService] Equipped active skill ${userSkillId} for user ${userId}`);
}

/**
 * Unequip active skill
 */
export async function unequipActiveSkill(userId: string, userSkillId: string): Promise<void> {
  await prisma.userSkill.updateMany({
    where: {
      id: userSkillId,
      userId,
      equipped: true,
    },
    data: {
      equipped: false,
    },
  });

  logger.debug(`[SkillService] Unequipped active skill ${userSkillId} for user ${userId}`);
}

/**
 * Level up a skill
 */
export async function levelUpSkill(userSkillId: string): Promise<{ newLevel: number }> {
  const userSkill = await prisma.userSkill.findUnique({
    where: { id: userSkillId },
  });

  if (!userSkill) {
    throw new Error('UserSkill not found');
  }

  const newLevel = userSkill.level + 1;

  await prisma.userSkill.update({
    where: { id: userSkillId },
    data: {
      level: newLevel,
    },
  });

  return { newLevel };
}

/**
 * Update skill cooldown (decrement or set)
 */
export async function updateSkillCooldown(
  userSkillId: string,
  cooldownRemaining: number
): Promise<void> {
  await prisma.userSkill.update({
    where: { id: userSkillId },
    data: {
      cooldownRemaining: Math.max(0, cooldownRemaining), // Clamp to 0
    },
  });
}

/**
 * Use active skill (sets cooldown)
 */
export async function useActiveSkill(userSkillId: string): Promise<void> {
  const userSkill = await prisma.userSkill.findUnique({
    where: { id: userSkillId },
    include: {
      skill: true,
    },
  });

  if (!userSkill || userSkill.skill.type !== 'active') {
    throw new Error('Skill not found or not active');
  }

  if (userSkill.cooldownRemaining > 0) {
    throw new Error('Skill is on cooldown');
  }

  // Set cooldown
  const baseCooldown = userSkill.skill.cooldown || 0;
  await updateSkillCooldown(userSkillId, baseCooldown);

  logger.debug(`[SkillService] Used skill ${userSkill.skill.name}, cooldown set to ${baseCooldown}`);
}

/**
 * Decrement all skill cooldowns for user (called each combat round)
 */
export async function decrementSkillCooldowns(userId: string): Promise<void> {
  await prisma.userSkill.updateMany({
    where: {
      userId,
      cooldownRemaining: { gt: 0 },
    },
    data: {
      cooldownRemaining: { decrement: 1 },
    },
  });
}

