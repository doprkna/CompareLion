/**
 * Season Management Script
 * v0.18.0 - Create, end, and archive seasons
 * 
 * Usage:
 *   npm run season:create "Season Name" 90
 *   npm run season:end <seasonId>
 *   npm run season:archive <seasonId>
 */

import { PrismaClient } from '@prisma/client';
import { ECONOMY_CONFIG } from '../apps/web/config/economy';

const prisma = new PrismaClient();

async function createSeason(displayName: string, durationDays: number = 90) {
  console.log(`\n🎯 Creating new season: ${displayName}`);
  console.log(`Duration: ${durationDays} days`);

  // Get the latest season number
  const latestSeason = await prisma.season.findFirst({
    orderBy: { number: 'desc' },
    select: { number: true },
  });

  const seasonNumber = (latestSeason?.number || 0) + 1;
  const seasonName = `season-${seasonNumber}`;

  // Calculate dates
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + durationDays);

  // Create season
  const season = await prisma.season.create({
    data: {
      name: seasonName,
      displayName,
      number: seasonNumber,
      startDate,
      endDate,
      status: 'ACTIVE',
      metadata: {
        durationDays,
        createdBy: 'script',
      },
    },
  });

  console.log(`✅ Season created successfully!`);
  console.log(`   ID: ${season.id}`);
  console.log(`   Name: ${season.name}`);
  console.log(`   Display: ${season.displayName}`);
  console.log(`   Number: ${season.number}`);
  console.log(`   Start: ${season.startDate.toISOString()}`);
  console.log(`   End: ${season.endDate.toISOString()}`);

  // Set all other seasons to ENDED or ARCHIVED
  await prisma.season.updateMany({
    where: {
      id: { not: season.id },
      status: 'ACTIVE',
    },
    data: {
      status: 'ENDED',
    },
  });

  console.log(`✅ Previous seasons marked as ENDED`);

  return season;
}

async function endSeason(seasonId: string) {
  console.log(`\n🏁 Ending season: ${seasonId}`);

  // Get season
  const season = await prisma.season.findUnique({
    where: { id: seasonId },
  });

  if (!season) {
    console.error(`❌ Season not found: ${seasonId}`);
    return;
  }

  if (season.status === 'ENDED') {
    console.log(`⚠️  Season already ended`);
    return;
  }

  // Archive all users' season data
  console.log(`📦 Archiving user data...`);
  await archiveSeasonData(seasonId);

  // Update season status
  await prisma.season.update({
    where: { id: seasonId },
    data: {
      status: 'ENDED',
      endDate: new Date(),
    },
  });

  console.log(`✅ Season ended successfully`);
}

async function archiveSeasonData(seasonId: string) {
  console.log(`\n📦 Archiving season data for: ${seasonId}`);

  // Get all users with seasonal XP
  const users = await prisma.user.findMany({
    where: {
      seasonalXP: { gt: 0 },
    },
    select: {
      id: true,
      seasonalXP: true,
      coins: true,
      karmaScore: true,
    },
    orderBy: {
      seasonalXP: 'desc',
    },
  });

  console.log(`Found ${users.length} users to archive`);

  // Create archives with ranks
  const archives = users.map((user, index) => ({
    userId: user.id,
    seasonId,
    finalXP: user.seasonalXP,
    finalCoins: user.coins,
    finalRank: index + 1,
    finalKarma: user.karmaScore,
    achievements: {},
  }));

  // Batch create archives
  await prisma.seasonArchive.createMany({
    data: archives,
    skipDuplicates: true,
  });

  console.log(`✅ Archived ${archives.length} user records`);

  // Reset seasonal stats if configured
  if (ECONOMY_CONFIG.season.resetOnNewSeason.seasonalXP) {
    await prisma.user.updateMany({
      where: {
        seasonalXP: { gt: 0 },
      },
      data: {
        seasonalXP: 0,
      },
    });
    console.log(`✅ Reset seasonal XP for all users`);
  }

  if (ECONOMY_CONFIG.season.resetOnNewSeason.coins) {
    await prisma.user.updateMany({
      where: {
        coins: { gt: 0 },
      },
      data: {
        coins: 0,
      },
    });
    console.log(`✅ Reset coins for all users`);
  }

  // Mark season as archived
  await prisma.season.update({
    where: { id: seasonId },
    data: {
      status: 'ARCHIVED',
    },
  });

  console.log(`✅ Season archived successfully`);
}

async function listSeasons() {
  console.log(`\n📋 Listing all seasons:\n`);

  const seasons = await prisma.season.findMany({
    orderBy: { number: 'desc' },
  });

  if (seasons.length === 0) {
    console.log(`No seasons found`);
    return;
  }

  seasons.forEach(season => {
    console.log(`Season ${season.number}: ${season.displayName}`);
    console.log(`  Status: ${season.status}`);
    console.log(`  Dates: ${season.startDate.toISOString().split('T')[0]} → ${season.endDate.toISOString().split('T')[0]}`);
    console.log(`  ID: ${season.id}\n`);
  });
}

// CLI handler
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'create':
        const displayName = args[1] || `Season ${Date.now()}`;
        const duration = parseInt(args[2] || '90');
        await createSeason(displayName, duration);
        break;

      case 'end':
        const endSeasonId = args[1];
        if (!endSeasonId) {
          console.error(`❌ Usage: npm run season:end <seasonId>`);
          process.exit(1);
        }
        await endSeason(endSeasonId);
        break;

      case 'archive':
        const archiveSeasonId = args[1];
        if (!archiveSeasonId) {
          console.error(`❌ Usage: npm run season:archive <seasonId>`);
          process.exit(1);
        }
        await archiveSeasonData(archiveSeasonId);
        break;

      case 'list':
        await listSeasons();
        break;

      default:
        console.log(`
📖 Season Management Script v0.18.0

Usage:
  npm run season:create "Display Name" [durationDays]
  npm run season:end <seasonId>
  npm run season:archive <seasonId>
  npm run season:list

Examples:
  npm run season:create "Winter Season 2025" 90
  npm run season:end cm1abc123def
  npm run season:archive cm1abc123def
  npm run season:list
        `);
    }
  } catch (error) {
    console.error(`❌ Error:`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

