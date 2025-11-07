/**
 * Archetype Seeding Script
 * Creates base archetypes in the database
 * v0.26.6 - Archetypes & Leveling
 * 
 * Run: npx tsx apps/web/lib/seed-archetypes.ts
 */

import { prisma } from './db';
import { ARCHETYPES } from './config/archetypeConfig';

export async function seedArchetypes() {
  console.log('🧠 Seeding archetypes...');

  for (const [key, archetype] of Object.entries(ARCHETYPES)) {
    try {
      // Check if exists
      const existing = await prisma.archetype.findUnique({
        where: { key },
      });

      if (existing) {
        console.log(`⏭️  Skipping ${key} (already exists)`);
        continue;
      }

      await prisma.archetype.create({
        data: {
          key,
          name: archetype.name,
          description: archetype.description,
          emoji: archetype.emoji,
          baseStats: archetype.baseStats as any,
          growthRates: archetype.growthRates as any,
        },
      });

      console.log(`✅ Created: ${archetype.emoji} ${archetype.name}`);
    } catch (error) {
      console.error(`❌ Error creating ${key}:`, error);
    }
  }

  console.log('✨ Archetype seeding complete!');
}

// Run if called directly
if (require.main === module) {
  seedArchetypes()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default seedArchetypes;

