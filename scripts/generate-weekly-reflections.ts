/**
 * Weekly Reflections Generator
 * v0.19.5 - Automated weekly reflection generation
 * 
 * Usage:
 *   npm run reflections:weekly
 *   
 * Cron Schedule:
 *   0 0 * * 0  # Every Sunday at midnight UTC
 */

import { PrismaClient } from '@prisma/client';
import { generateReflection, storeReflection } from '../apps/web/lib/ai-reflection';

const prisma = new PrismaClient();

async function generateWeeklyReflections() {
  console.log('\n🧠 Weekly Reflections Generator v0.19.5');
  console.log('==========================================\n');

  try {
    // Check if feature is enabled
    const enabled = process.env.ENABLE_WEEKLY_REFLECTIONS !== 'false';
    
    if (!enabled) {
      console.log('⚠️  Weekly reflections are disabled via ENABLE_WEEKLY_REFLECTIONS env var');
      return;
    }

    // Get all active users (users who logged in within the last 30 days)
    const activeUsers = await prisma.user.findMany({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log(`Found ${activeUsers.length} active users\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of activeUsers) {
      try {
        console.log(`Generating weekly reflection for ${user.name || user.email}...`);

        // Generate weekly reflection
        const content = await generateReflection(user.id, 'WEEKLY');

        // Store reflection
        await storeReflection(user.id, 'WEEKLY', content);

        successCount++;
        console.log(`✅ Success for ${user.name || user.email}`);
      } catch (error: any) {
        errorCount++;
        console.error(`❌ Failed for ${user.name || user.email}:`, error.message);
      }
    }

    console.log('\n==========================================');
    console.log(`📊 Summary:`);
    console.log(`   Total users: ${activeUsers.length}`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('==========================================\n');

    // Update weekly stats (track this week's gains)
    console.log('📈 Tracking weekly stats...');
    await trackWeeklyStats();
    console.log('✅ Weekly stats tracked\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function trackWeeklyStats() {
  // Get all users with activity
  const users = await prisma.user.findMany({
    select: {
      id: true,
      xp: true,
      coins: true,
      karmaScore: true,
      questionsAnswered: true,
      streakCount: true,
    },
  });

  const weekStart = getWeekStart();
  const weekEnd = new Date();

  for (const user of users) {
    // Get previous week's stats if they exist
    const previousWeek = await prisma.userWeeklyStats.findFirst({
      where: {
        userId: user.id,
        weekStart: {
          lt: weekStart,
        },
      },
      orderBy: {
        weekStart: 'desc',
      },
    });

    // Calculate this week's gains
    const xpGain = previousWeek
      ? user.xp - (previousWeek.xpGain || 0)
      : user.xp;

    const coinsGain = previousWeek
      ? user.coins - (previousWeek.coinsGain || 0)
      : user.coins;

    const karmaGain = previousWeek
      ? user.karmaScore - (previousWeek.karmaGain || 0)
      : user.karmaScore;

    // Create or update this week's stats
    await prisma.userWeeklyStats.upsert({
      where: {
        userId_weekStart: {
          userId: user.id,
          weekStart,
        },
      },
      create: {
        userId: user.id,
        weekStart,
        weekEnd,
        xpGain,
        coinsGain,
        karmaGain,
        questionsCount: 0, // Would need to track separately
        streakDays: user.streakCount,
      },
      update: {
        weekEnd,
        xpGain,
        coinsGain,
        karmaGain,
        streakDays: user.streakCount,
      },
    });
  }

  console.log(`Tracked stats for ${users.length} users`);
}

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day; // Sunday is 0
  return new Date(now.setDate(diff));
}

// Run the script
generateWeeklyReflections()
  .then(() => {
    console.log('🎉 Weekly reflections generation complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });

