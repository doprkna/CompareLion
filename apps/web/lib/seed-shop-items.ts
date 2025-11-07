/**
 * Shop Items Seeding Script
 * Creates base shop items for testing
 * v0.26.2 - Economy Feedback & Shop Loop
 * 
 * Run: npx tsx apps/web/lib/seed-shop-items.ts
 */

import { prisma } from './db';

const SHOP_ITEMS = [
  {
    key: 'alpha-item',
    name: 'Alpha Relic',
    emoji: '💎',
    price: 500,
    rarity: 'alpha',
    type: 'relic',
    description: 'A powerful artifact of unknown origin. Grants mysterious powers.',
    goldPrice: 500,
    isShopItem: true,
  },
];

export async function seedShopItems() {
  console.log('🛒 Seeding shop items...');

  for (const item of SHOP_ITEMS) {
    try {
      // Check if exists by key
      const existing = await prisma.item.findFirst({
        where: {
          OR: [
            { key: item.key },
            { name: item.name, isShopItem: true },
          ],
        },
      });

      if (existing) {
        console.log(`⏭️  Skipping ${item.key} (already exists)`);
        continue;
      }

      await prisma.item.create({
        data: {
          key: item.key,
          name: item.name,
          emoji: item.emoji || null,
          type: item.type,
          rarity: item.rarity,
          description: item.description || null,
          goldPrice: item.price,
          isShopItem: true,
        },
      });

      console.log(`✅ Created: ${item.name} (${item.price} gold)`);
    } catch (error) {
      console.error(`❌ Error creating ${item.key}:`, error);
    }
  }

  console.log('✨ Shop items seeding complete!');
}

// Run if called directly
if (require.main === module) {
  seedShopItems()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default seedShopItems;

