/**
 * Seed Potions (Consumables)
 * v0.36.14 - Economy Sanity Pass
 */

import { prisma } from '@/lib/db';
import { calculateItemPrice } from '@/lib/rpg/economy';

export interface PotionSeed {
  key: string;
  name: string;
  emoji: string;
  description: string;
  rarity: string;
  type: string;
  goldPrice: number;
  // Potion-specific stats
  hpRestore?: number;
  atkBonus?: number;
}

const POTIONS: PotionSeed[] = [
  {
    key: 'health_potion_small',
    name: 'Small Health Potion',
    emoji: '🧪',
    description: 'Restores 20 HP',
    rarity: 'common',
    type: 'consumable',
    goldPrice: 30,
    hpRestore: 20,
  },
  {
    key: 'health_potion_medium',
    name: 'Medium Health Potion',
    emoji: '🧪',
    description: 'Restores 50 HP',
    rarity: 'rare',
    type: 'consumable',
    goldPrice: 75,
    hpRestore: 50,
  },
  {
    key: 'power_potion',
    name: 'Power Potion',
    emoji: '⚡',
    description: '+10% ATK for next fight',
    rarity: 'epic',
    type: 'consumable',
    goldPrice: 120,
    atkBonus: 10, // Percentage
  },
];

/**
 * Seed potions into the database
 * Uses upsert to avoid duplicates
 */
export async function seedPotions(): Promise<number> {
  let count = 0;

  for (const potion of POTIONS) {
    // Calculate price using economy formula (for validation)
    const calculatedPrice = calculateItemPrice({
      rarity: potion.rarity,
      // Potions have minimal stats, price comes from rarity base
      power: 0,
      defense: 0,
    });

    // Use the specified price (may differ from calculated for balance)
    const finalPrice = potion.goldPrice;

    const existing = await prisma.item.findUnique({
      where: { key: potion.key },
    });

    if (!existing) {
      await prisma.item.create({
        data: {
          key: potion.key,
          name: potion.name,
          emoji: potion.emoji,
          icon: potion.emoji,
          description: potion.description,
          rarity: potion.rarity,
          type: potion.type,
          goldPrice: finalPrice,
          isShopItem: true,
          power: 0,
          defense: 0,
          // Store potion effects in metadata if needed (future enhancement)
        },
      });
      count++;
    } else {
      // Update existing potion to ensure correct price
      await prisma.item.update({
        where: { key: potion.key },
        data: {
          goldPrice: finalPrice,
          description: potion.description,
        },
      });
    }
  }

  return count;
}

