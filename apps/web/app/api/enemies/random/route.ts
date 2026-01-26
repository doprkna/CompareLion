/**
 * Random Enemy API
 * GET /api/enemies/random?region=X&tier=Y
 * Returns a random enemy matching the specified region and tier
 * v0.36.36 - Enemy Bestiary 1.0
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, validationError, successResponse } from '@/lib/api-handler';
import { EnemyTier, EnemyRegion } from '@/lib/rpg/enemy/types';
import { normalizeEnemyTier, normalizeEnemyRegion, getRandomEnemyByTierAndRegion } from '@/lib/rpg/enemy/registry';

export const runtime = 'nodejs';

/**
 * GET /api/enemies/random
 * Query params:
 *   - region?: EnemyRegion (defaults to random)
 *   - tier?: EnemyTier (defaults to random/common)
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  
  const regionParam = searchParams.get('region');
  const tierParam = searchParams.get('tier');

  // Normalize inputs
  const region = regionParam ? normalizeEnemyRegion(regionParam) : null;
  const tier = tierParam ? normalizeEnemyTier(tierParam) : EnemyTier.COMMON;

  // Build query
  const where: any = {
    rarity: tier, // Note: rarity field maps to tier in current schema
  };

  // Add region filter if provided (will work once schema is updated)
  if (region) {
    // TODO: Uncomment once region field exists in schema
    // where.region = region;
  }

  // Get matching enemies
  let enemy;
  if (region) {
    // Use registry helper (will work once schema is updated)
    enemy = await getRandomEnemyByTierAndRegion(tier, region);
    if (!enemy) {
      // Fallback to tier-only lookup
      const enemies = await prisma.enemy.findMany({
        where: { rarity: tier },
        take: 10,
      });
      if (enemies.length === 0) {
        return validationError('No enemies found matching criteria');
      }
      const randomIndex = Math.floor(Math.random() * enemies.length);
      enemy = enemies[randomIndex];
    }
  } else {
    // No region specified, get all enemies of this tier
    const enemies = await prisma.enemy.findMany({
      where,
      take: 50, // Limit for performance
    });
    
    if (enemies.length === 0) {
      return validationError('No enemies found matching criteria');
    }
    
    const randomIndex = Math.floor(Math.random() * enemies.length);
    enemy = enemies[randomIndex];
  }

  return successResponse({ enemy });
});

