/**
 * Season Pass Seed Script
 * v0.36.23 - Season Pass System
 * 
 * Seeds initial season with 20 tiers and rewards
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const SEASON_LENGTH_DAYS = 30;

/**
 * Seed initial season with 20 tiers
 */
export async function seedSeason(seasonNumber: number = 1): Promise<string> {
  const startsAt = new Date();
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + SEASON_LENGTH_DAYS);

  // Create season
  const season = await prisma.season.create({
    data: {
      name: `Season ${seasonNumber}`,
      seasonNumber,
      startsAt,
      endsAt,
      isActive: true,
    },
  });

  logger.info(`[SeasonSeed] Created season ${season.id}`);

  // Create tiers with rewards
  const tiers = [
    // Tier 1-5: Early game rewards
    { tier: 1, xp: 100, free: { type: 'gold', amount: 100 }, premium: { type: 'diamonds', amount: 10 } },
    { tier: 2, xp: 200, free: { type: 'gold', amount: 150 }, premium: { type: 'gold', amount: 300 } },
    { tier: 3, xp: 300, free: { type: 'gold', amount: 200 }, premium: { type: 'diamonds', amount: 20 } },
    { tier: 4, xp: 400, free: { type: 'xp-boost', amount: 1 }, premium: { type: 'gold', amount: 500 } },
    { tier: 5, xp: 500, free: { type: 'gold', amount: 300 }, premium: { type: 'diamonds', amount: 30 } },

    // Tier 6-10: Mid game rewards
    { tier: 6, xp: 650, free: { type: 'gold', amount: 400 }, premium: { type: 'gold', amount: 800 } },
    { tier: 7, xp: 800, free: { type: 'xp-boost', amount: 1 }, premium: { type: 'diamonds', amount: 50 } },
    { tier: 8, xp: 1000, free: { type: 'gold', amount: 500 }, premium: { type: 'gold', amount: 1000 } },
    { tier: 9, xp: 1200, free: { type: 'gold', amount: 600 }, premium: { type: 'companion', companionId: null } }, // Will need actual companion ID
    { tier: 10, xp: 1500, free: { type: 'xp-boost', amount: 2 }, premium: { type: 'diamonds', amount: 75 } },

    // Tier 11-15: Late game rewards
    { tier: 11, xp: 1800, free: { type: 'gold', amount: 700 }, premium: { type: 'gold', amount: 1500 } },
    { tier: 12, xp: 2200, free: { type: 'gold', amount: 800 }, premium: { type: 'diamonds', amount: 100 } },
    { tier: 13, xp: 2600, free: { type: 'xp-boost', amount: 2 }, premium: { type: 'gold', amount: 2000 } },
    { tier: 14, xp: 3000, free: { type: 'gold', amount: 1000 }, premium: { type: 'diamonds', amount: 125 } },
    { tier: 15, xp: 3500, free: { type: 'gold', amount: 1200 }, premium: { type: 'theme', themeId: null } }, // Will need actual theme ID

    // Tier 16-20: End game rewards
    { tier: 16, xp: 4000, free: { type: 'gold', amount: 1500 }, premium: { type: 'diamonds', amount: 150 } },
    { tier: 17, xp: 4500, free: { type: 'xp-boost', amount: 3 }, premium: { type: 'gold', amount: 3000 } },
    { tier: 18, xp: 5000, free: { type: 'gold', amount: 2000 }, premium: { type: 'diamonds', amount: 200 } },
    { tier: 19, xp: 5500, free: { type: 'gold', amount: 2500 }, premium: { type: 'companion', companionId: null } }, // Will need actual companion ID
    { tier: 20, xp: 6000, free: { type: 'theme', themeId: null }, premium: { type: 'diamonds', amount: 300 } }, // Will need actual theme ID
  ];

  for (const tierData of tiers) {
    // Create free reward
    let freeRewardId: string | null = null;
    if (tierData.free) {
      const freeReward = await prisma.seasonReward.create({
        data: tierData.free,
      });
      freeRewardId = freeReward.id;
    }

    // Create premium reward
    let premiumRewardId: string | null = null;
    if (tierData.premium) {
      const premiumReward = await prisma.seasonReward.create({
        data: tierData.premium,
      });
      premiumRewardId = premiumReward.id;
    }

    // Create tier
    await prisma.seasonTier.create({
      data: {
        seasonId: season.id,
        tier: tierData.tier,
        xpRequired: tierData.xp,
        freeRewardId,
        premiumRewardId,
      },
    });
  }

  logger.info(`[SeasonSeed] Created ${tiers.length} tiers for season ${season.id}`);

  return season.id;
}

/**
 * Activate a season (deactivate others)
 */
export async function activateSeason(seasonId: string): Promise<void> {
  // Deactivate all seasons
  await prisma.season.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  // Activate target season
  await prisma.season.update({
    where: { id: seasonId },
    data: { isActive: true },
  });

  logger.info(`[SeasonSeed] Activated season ${seasonId}`);
}


