/**
 * Database Seed Script
 * v0.36.0 - Full Fighting System MVP
 * Idempotent: uses findFirst + update/create (Enemy has no unique on name); safe for re-runs.
 */

import { PrismaClient } from '@parel/db/client';

const prisma = new PrismaClient();

/** Enemy seed rows: map to Prisma Enemy (name, level, power, defense, maxHp, rarity, lootTable, icon). */
const ENEMY_ROWS = [
  { name: 'Tiny Mosquito', level: 1, power: 3, defense: 0, maxHp: 15, rarity: 'common', lootTable: {}, icon: null },
  { name: 'Angry Hedgehog', level: 1, power: 5, defense: 2, maxHp: 25, rarity: 'common', lootTable: {}, icon: null },
  { name: 'Local Gym Bro', level: 2, power: 12, defense: 5, maxHp: 45, rarity: 'uncommon', lootTable: {}, icon: null },
  { name: 'Passive Aggressive Cat', level: 1, power: 8, defense: 3, maxHp: 30, rarity: 'common', lootTable: {}, icon: null },
  { name: 'Caffeine Goblin', level: 2, power: 10, defense: 2, maxHp: 35, rarity: 'uncommon', lootTable: {}, icon: null },
  { name: 'Baby Dragon', level: 3, power: 18, defense: 8, maxHp: 60, rarity: 'rare', lootTable: {}, icon: null },
  { name: 'Overconfident Squirrel', level: 1, power: 6, defense: 1, maxHp: 20, rarity: 'common', lootTable: {}, icon: null },
  { name: 'Tax Inspector', level: 3, power: 15, defense: 10, maxHp: 50, rarity: 'rare', lootTable: {}, icon: null },
  { name: 'AI Overlord Placeholder', level: 4, power: 22, defense: 12, maxHp: 80, rarity: 'epic', lootTable: {}, icon: null },
  { name: 'The Algorithm', level: 5, power: 25, defense: 18, maxHp: 120, rarity: 'legendary', lootTable: {}, icon: null },
];

async function seedEnemies(): Promise<number> {
  console.log('🌱 Seeding enemies...');
  let count = 0;
  for (const data of ENEMY_ROWS) {
    const existing = await prisma.enemy.findFirst({ where: { name: data.name } });
    if (existing) {
      await prisma.enemy.update({ where: { id: existing.id }, data });
    } else {
      await prisma.enemy.create({ data });
    }
    count++;
  }
  console.log(`✅ Seeded ${count} enemies`);
  return count;
}

async function main() {
  try {
    console.log('🚀 Starting seed...');
    const enemyCount = await seedEnemies();
    console.log(`\n✅ Seed complete!`);
    console.log(`   - Enemies: ${enemyCount}`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
