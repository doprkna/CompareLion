/**
 * Seed Companions
 * v0.36.20 - Unified Companion/Pet/Mount System
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { calculateItemPrice } from './economy';

const DEFAULT_COMPANIONS = [
  // Pets
  {
    name: 'Baby Slime',
    key: 'baby_slime',
    type: 'pet',
    rarity: 'common',
    description: 'A small, friendly slime companion that provides a small health boost.',
    atkBonus: 0,
    defBonus: 0,
    hpBonus: 5,
    critBonus: 0,
    speedBonus: 0,
    xpBonus: 0,
    goldBonus: 0,
    travelBonus: 0,
    icon: '🟢',
    price: 100,
  },
  {
    name: 'Copper Pup',
    key: 'copper_pup',
    type: 'pet',
    rarity: 'common',
    description: 'A loyal copper-colored pup that increases your speed.',
    atkBonus: 0,
    defBonus: 0,
    hpBonus: 0,
    critBonus: 0,
    speedBonus: 2,
    xpBonus: 0,
    goldBonus: 0,
    travelBonus: 0,
    icon: '🐕',
    price: 100,
  },
  // Companions
  {
    name: 'Forest Sprite',
    key: 'forest_sprite',
    type: 'companion',
    rarity: 'rare',
    description: 'A nature spirit that enhances your defensive capabilities.',
    atkBonus: 0,
    defBonus: 3,
    hpBonus: 0,
    critBonus: 0,
    speedBonus: 0,
    xpBonus: 0,
    goldBonus: 0,
    travelBonus: 0,
    icon: '🌿',
    price: 250,
  },
  {
    name: 'Goblin Scout',
    key: 'goblin_scout',
    type: 'companion',
    rarity: 'rare',
    description: 'A cunning goblin that boosts your attack power.',
    atkBonus: 3,
    defBonus: 0,
    hpBonus: 0,
    critBonus: 0,
    speedBonus: 0,
    xpBonus: 0,
    goldBonus: 0,
    travelBonus: 0,
    icon: '👺',
    price: 250,
  },
  {
    name: 'Spirit Wisp',
    key: 'spirit_wisp',
    type: 'companion',
    rarity: 'epic',
    description: 'An ethereal spirit that increases critical chance and XP gains.',
    atkBonus: 0,
    defBonus: 0,
    hpBonus: 0,
    critBonus: 2,
    speedBonus: 0,
    xpBonus: 5,
    goldBonus: 0,
    travelBonus: 0,
    icon: '✨',
    price: 400,
  },
  {
    name: 'Shadow Cat',
    key: 'shadow_cat',
    type: 'pet',
    rarity: 'epic',
    description: 'A mysterious shadow cat that enhances speed and critical strikes.',
    atkBonus: 0,
    defBonus: 0,
    hpBonus: 0,
    critBonus: 3,
    speedBonus: 3,
    xpBonus: 0,
    goldBonus: 0,
    travelBonus: 0,
    icon: '🐱',
    price: 500,
  },
  // Mounts
  {
    name: 'Sandrunner',
    key: 'sandrunner',
    type: 'mount',
    rarity: 'rare',
    description: 'A swift desert mount that speeds up your travels.',
    atkBonus: 0,
    defBonus: 0,
    hpBonus: 0,
    critBonus: 0,
    speedBonus: 0,
    xpBonus: 0,
    goldBonus: 0,
    travelBonus: 10,
    icon: '🐪',
    price: 300,
  },
  {
    name: 'Celestial Stag',
    key: 'celestial_stag',
    type: 'mount',
    rarity: 'epic',
    description: 'A divine stag that accelerates travel and enhances XP gains.',
    atkBonus: 0,
    defBonus: 0,
    hpBonus: 0,
    critBonus: 0,
    speedBonus: 0,
    xpBonus: 5,
    goldBonus: 0,
    travelBonus: 15,
    icon: '🦌',
    price: 600,
  },
];

/**
 * Seed default companions
 */
export async function seedCompanions(): Promise<number> {
  let count = 0;

  for (const companionData of DEFAULT_COMPANIONS) {
    try {
      // Create or update Companion
      let companion = await prisma.companion.findFirst({
        where: {
          name: companionData.name,
          type: companionData.type,
        },
      });

      if (!companion) {
        companion = await prisma.companion.create({
          data: {
            name: companionData.name,
            type: companionData.type,
            rarity: companionData.rarity,
            description: companionData.description || null,
            atkBonus: companionData.atkBonus,
            defBonus: companionData.defBonus,
            hpBonus: companionData.hpBonus,
            critBonus: companionData.critBonus,
            speedBonus: companionData.speedBonus,
            xpBonus: companionData.xpBonus,
            goldBonus: companionData.goldBonus,
            travelBonus: companionData.travelBonus || 0,
            icon: companionData.icon || null,
          },
        });
      } else {
        companion = await prisma.companion.update({
          where: { id: companion.id },
          data: {
            description: companionData.description || null,
            atkBonus: companionData.atkBonus,
            defBonus: companionData.defBonus,
            hpBonus: companionData.hpBonus,
            critBonus: companionData.critBonus,
            speedBonus: companionData.speedBonus,
            xpBonus: companionData.xpBonus,
            goldBonus: companionData.goldBonus,
            travelBonus: companionData.travelBonus || 0,
            icon: companionData.icon || null,
          },
        });
      }

      // Create or update shop Item for companion (v0.36.17)
      const itemKey = companionData.key;
      const existingItem = await prisma.item.findUnique({
        where: { key: itemKey },
      });

      if (!existingItem) {
        await prisma.item.create({
          data: {
            key: itemKey,
            name: companionData.name,
            emoji: companionData.icon,
            icon: companionData.icon,
            description: `Companion: ${companionData.name}`,
            rarity: companionData.rarity,
            type: 'companion',
            goldPrice: companionData.price,
            isShopItem: true,
            power: 0,
            defense: 0,
          },
        });
        count++;
        logger.info(`[SeedCompanions] Created companion and shop item: ${companionData.name}`);
      } else {
        // Update existing item
        await prisma.item.update({
          where: { key: itemKey },
          data: {
            goldPrice: companionData.price,
            type: 'companion',
            isShopItem: true,
          },
        });
      }
    } catch (error) {
      logger.error(`[SeedCompanions] Error seeding companion ${companionData.name}`, error);
    }
  }

  return count;
}

