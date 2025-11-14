/**
 * Database Seed Script
 * v0.36.0 - Full Fighting System MVP
 */

import { PrismaClient } from '@parel/db/client';

const prisma = new PrismaClient();

async function seedEnemies() {
  const enemies = [
    { name: 'Tiny Mosquito', hp: 15, str: 3, def: 0, speed: 8, rarity: 'common', xpReward: 5, goldReward: 2, sprite: null },
    { name: 'Angry Hedgehog', hp: 25, str: 5, def: 2, speed: 4, rarity: 'common', xpReward: 10, goldReward: 5, sprite: null },
    { name: 'Local Gym Bro', hp: 45, str: 12, def: 5, speed: 3, rarity: 'uncommon', xpReward: 25, goldReward: 15, sprite: null },
    { name: 'Passive Aggressive Cat', hp: 30, str: 8, def: 3, speed: 7, rarity: 'common', xpReward: 15, goldReward: 8, sprite: null },
    { name: 'Caffeine Goblin', hp: 35, str: 10, def: 2, speed: 9, rarity: 'uncommon', xpReward: 20, goldReward: 12, sprite: null },
    { name: 'Baby Dragon', hp: 60, str: 18, def: 8, speed: 5, rarity: 'rare', xpReward: 50, goldReward: 30, sprite: null },
    { name: 'Overconfident Squirrel', hp: 20, str: 6, def: 1, speed: 10, rarity: 'common', xpReward: 12, goldReward: 6, sprite: null },
    { name: 'Tax Inspector', hp: 50, str: 15, def: 10, speed: 2, rarity: 'rare', xpReward: 40, goldReward: 25, sprite: null },
    { name: 'AI Overlord Placeholder', hp: 80, str: 22, def: 12, speed: 6, rarity: 'epic', xpReward: 75, goldReward: 50, sprite: null },
    { name: 'The Algorithm', hp: 120, str: 25, def: 18, speed: 4, rarity: 'legendary', xpReward: 100, goldReward: 75, sprite: null },
  ];

  console.log('🌱 Seeding enemies...');

  for (const enemyData of enemies) {
    await prisma.enemy.upsert({
      where: { name: enemyData.name },
      update: enemyData,
      create: enemyData,
    });
  }

  console.log(`✅ Seeded ${enemies.length} enemies`);
  return enemies.length;
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

main().catch((e) => { console.error(e); process.exit(1); });
