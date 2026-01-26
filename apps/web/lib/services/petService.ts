/**
 * Pet Service
 * Pet/Companion system management
 * v0.36.32 - Companions & Pets 1.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface PetBonus {
  attack?: number;
  defense?: number;
  luck?: number;
  dodge?: number;
  critChance?: number;
  speed?: number;
}

export interface PetData {
  name: string;
  type: 'pet' | 'companion';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'uncommon';
  bonus?: PetBonus;
  icon?: string;
  description?: string;
}

/**
 * MVP Pet Set - Seed data
 */
export const MVP_PETS: PetData[] = [
  // Common
  {
    name: 'Tiny Slime',
    type: 'companion',
    rarity: 'common',
    bonus: { luck: 1 },
    icon: '🐌',
    description: 'A small, squishy companion that brings a bit of luck.',
  },
  {
    name: 'Dust Fox',
    type: 'companion',
    rarity: 'common',
    bonus: { dodge: 1 },
    icon: '🦊',
    description: 'Quick and nimble, helps you dodge attacks.',
  },
  // Uncommon
  {
    name: 'Ember Pup',
    type: 'companion',
    rarity: 'uncommon',
    bonus: { attack: 1 },
    icon: '🔥',
    description: 'A fiery companion that boosts your attack power.',
  },
  {
    name: 'Crystal Beetle',
    type: 'companion',
    rarity: 'uncommon',
    bonus: { defense: 1 },
    icon: '💎',
    description: 'Hard-shelled protector that increases your defense.',
  },
  // Rare
  {
    name: 'Shadow Lynx',
    type: 'companion',
    rarity: 'rare',
    bonus: { critChance: 1 },
    icon: '🐱',
    description: 'A stealthy companion that increases critical hit chance.',
  },
  {
    name: 'Wind Sprite',
    type: 'companion',
    rarity: 'rare',
    bonus: { speed: 2 },
    icon: '💨',
    description: 'Swift and airy, boosts your speed.',
  },
  // Epic
  {
    name: 'Void Cub',
    type: 'companion',
    rarity: 'epic',
    bonus: { attack: 2, defense: 1 },
    icon: '🌑',
    description: 'A mysterious cub from the void, powerful and protective.',
  },
  // Legendary
  {
    name: 'Celestial Wolf',
    type: 'companion',
    rarity: 'legendary',
    bonus: { attack: 3, luck: 2 },
    icon: '⭐',
    description: 'A legendary companion blessed by the stars.',
  },
];

/**
 * Seed pets into database (idempotent)
 */
export async function seedPets(): Promise<void> {
  try {
    for (const petData of MVP_PETS) {
      await prisma.pet.upsert({
        where: { name: petData.name },
        update: {
          type: petData.type,
          rarity: petData.rarity,
          bonus: petData.bonus || null,
          icon: petData.icon || null,
          description: petData.description || null,
        },
        create: {
          name: petData.name,
          type: petData.type,
          rarity: petData.rarity,
          bonus: petData.bonus || null,
          icon: petData.icon || null,
          description: petData.description || null,
        },
      });
    }
    logger.debug(`[PetService] Seeded ${MVP_PETS.length} pets`);
  } catch (error) {
    logger.error('[PetService] Failed to seed pets', error);
    throw error;
  }
}

/**
 * Get user's pets with full pet data
 */
export async function getUserPets(userId: string) {
  return await prisma.userPet.findMany({
    where: { userId },
    include: {
      pet: true,
    },
    orderBy: [
      { equipped: 'desc' },
      { createdAt: 'desc' },
    ],
  });
}

/**
 * Get user's equipped companion
 */
export async function getEquippedCompanion(userId: string) {
  return await prisma.userPet.findFirst({
    where: {
      userId,
      equipped: true,
    },
    include: {
      pet: true,
    },
  });
}

/**
 * Unlock a pet for a user (idempotent - prevents duplicates)
 */
export async function unlockPet(userId: string, petId: string): Promise<string> {
  // Check if user already has this pet
  const existing = await prisma.userPet.findFirst({
    where: {
      userId,
      petId,
    },
  });

  if (existing) {
    return existing.id; // Already unlocked
  }

  // Create new UserPet
  const userPet = await prisma.userPet.create({
    data: {
      userId,
      petId,
      level: 1,
      xp: 0,
      equipped: false,
    },
  });

  logger.debug(`[PetService] Unlocked pet ${petId} for user ${userId}`);
  return userPet.id;
}

/**
 * Equip a companion (unequips others automatically)
 */
export async function equipCompanion(userId: string, userPetId: string): Promise<void> {
  // Verify pet belongs to user
  const userPet = await prisma.userPet.findFirst({
    where: {
      id: userPetId,
      userId,
    },
    include: {
      pet: true,
    },
  });

  if (!userPet) {
    throw new Error('Pet not found or does not belong to user');
  }

  if (userPet.pet.type !== 'companion') {
    throw new Error('Only companions can be equipped');
  }

  // Unequip all other pets
  await prisma.userPet.updateMany({
    where: {
      userId,
      equipped: true,
    },
    data: {
      equipped: false,
    },
  });

  // Equip this pet
  await prisma.userPet.update({
    where: { id: userPetId },
    data: { equipped: true },
  });

  logger.debug(`[PetService] Equipped companion ${userPetId} for user ${userId}`);
}

/**
 * Unequip companion
 */
export async function unequipCompanion(userId: string, userPetId: string): Promise<void> {
  await prisma.userPet.updateMany({
    where: {
      id: userPetId,
      userId,
      equipped: true,
    },
    data: {
      equipped: false,
    },
  });

  logger.debug(`[PetService] Unequipped companion ${userPetId} for user ${userId}`);
}

/**
 * Grant XP to a pet
 */
export async function grantPetXP(userPetId: string, xpAmount: number): Promise<{ leveledUp: boolean; newLevel: number }> {
  const userPet = await prisma.userPet.findUnique({
    where: { id: userPetId },
  });

  if (!userPet) {
    throw new Error('Pet not found');
  }

  const newXP = userPet.xp + xpAmount;
  const xpNeeded = 10 * userPet.level;
  let newLevel = userPet.level;
  let leveledUp = false;

  if (newXP >= xpNeeded) {
    newLevel = userPet.level + 1;
    leveledUp = true;
    // Calculate remaining XP after level up
    const remainingXP = newXP - xpNeeded;
    await prisma.userPet.update({
      where: { id: userPetId },
      data: {
        level: newLevel,
        xp: remainingXP,
      },
    });
  } else {
    await prisma.userPet.update({
      where: { id: userPetId },
      data: {
        xp: newXP,
      },
    });
  }

  return { leveledUp, newLevel };
}

/**
 * Grant XP to all user's pets
 */
export async function grantXPToAllUserPets(userId: string, xpAmount: number): Promise<void> {
  const userPets = await prisma.userPet.findMany({
    where: { userId },
  });

  for (const userPet of userPets) {
    try {
      const result = await grantPetXP(userPet.id, xpAmount);
      if (result.leveledUp) {
        // Send notification for level up
        try {
          const { notifyPetLevelUp } = await import('@/lib/services/notificationService');
          await notifyPetLevelUp(userId, userPet.id, result.newLevel);
        } catch (error) {
          logger.debug('[PetService] Notification failed', error);
        }
      }
    } catch (error) {
      logger.error(`[PetService] Failed to grant XP to pet ${userPet.id}`, error);
    }
  }
}

/**
 * Set pet nickname
 */
export async function renamePet(userId: string, userPetId: string, nickname: string | null): Promise<void> {
  // Validate nickname length
  if (nickname && nickname.length > 50) {
    throw new Error('Nickname must be 50 characters or less');
  }

  // Basic profanity check (placeholder - can be enhanced)
  if (nickname && /(fuck|shit|damn|ass)/i.test(nickname)) {
    throw new Error('Nickname contains inappropriate content');
  }

  await prisma.userPet.updateMany({
    where: {
      id: userPetId,
      userId,
    },
    data: {
      nickname: nickname || null,
    },
  });

  logger.debug(`[PetService] Renamed pet ${userPetId} to ${nickname}`);
}

