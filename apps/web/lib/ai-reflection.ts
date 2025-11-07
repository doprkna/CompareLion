/**
 * AI Reflection Generator
 * v0.19.0 - Generate personalized user reflections
 */

import { prisma } from '@/lib/db';

interface UserStats {
  currentXP: number;
  currentCoins: number;
  currentKarma: number;
  seasonalXP: number;
  level: number;
  streakCount: number;
  questionsAnswered: number;
}

interface ComparisonStats {
  xpChange: number;
  coinsChange: number;
  karmaChange: number;
  xpPercentChange: number;
  coinsPercentChange: number;
  karmaPercentChange: number;
}

/**
 * Generate a reflection based on user activity
 */
export async function generateReflection(
  userId: string,
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'MILESTONE' = 'DAILY'
): Promise<string> {
  // Get user stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      xp: true,
      coins: true,
      karmaScore: true,
      seasonalXP: true,
      level: true,
      streakCount: true,
      questionsAnswered: true,
      name: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const stats: UserStats = {
    currentXP: user.xp,
    currentCoins: user.coins,
    currentKarma: user.karmaScore,
    seasonalXP: user.seasonalXP,
    level: user.level,
    streakCount: user.streakCount,
    questionsAnswered: user.questionsAnswered,
  };

  // Get comparison stats (compare to last period)
  const comparison = await getComparisonStats(userId, type);

  // Generate reflection based on type
  let reflection: string;

  switch (type) {
    case 'DAILY':
      reflection = generateDailyReflection(stats, comparison, user.name || 'friend');
      break;
    case 'WEEKLY':
      reflection = generateWeeklyReflection(stats, comparison, user.name || 'friend');
      break;
    case 'MONTHLY':
      reflection = generateMonthlyReflection(stats, comparison, user.name || 'friend');
      break;
    case 'MILESTONE':
      reflection = generateMilestoneReflection(stats, user.name || 'friend');
      break;
    default:
      reflection = generateDailyReflection(stats, comparison, user.name || 'friend');
  }

  return reflection;
}

/**
 * Generate daily reflection (short and sweet)
 */
function generateDailyReflection(stats: UserStats, comparison: ComparisonStats, name: string): string {
  const templates = [
    // Positive momentum
    ...(comparison.xpChange > 0 ? [
      `Nice work today, ${name}! You gained ${comparison.xpChange} XP. Keep that momentum going! 🚀`,
      `${name}, you're on fire! 🔥 ${comparison.xpChange} XP earned today. The leaderboard is watching.`,
      `Solid day, ${name}! ${comparison.xpChange} XP closer to greatness. Remember: consistency > intensity.`,
    ] : []),
    
    // Neutral/Low activity
    ...(comparison.xpChange === 0 ? [
      `Hey ${name}, taking it easy today? Sometimes rest is progress too. 😌`,
      `${name}, the best comeback starts with a small step. Ready to dive back in?`,
      `Every journey has quiet days, ${name}. Tomorrow's a fresh start! 🌅`,
    ] : []),
    
    // Streak recognition
    ...(stats.streakCount > 0 ? [
      `${name}, that ${stats.streakCount}-day streak is impressive! Don't break the chain. 📅`,
      `Streak power: ${stats.streakCount} days! ${name}, you're building habits that last. 💪`,
    ] : []),
  ];

  // Pick a template or generate custom
  if (templates.length > 0) {
    return templates[Math.floor(Math.random() * templates.length)];
  }

  return `${name}, you're at ${stats.currentXP} XP and level ${stats.level}. Keep growing! 🌱`;
}

/**
 * Generate weekly reflection (more detailed)
 */
function generateWeeklyReflection(stats: UserStats, comparison: ComparisonStats, name: string): string {
  const xpTrend = comparison.xpPercentChange > 0 ? 'up' : comparison.xpPercentChange < 0 ? 'down' : 'flat';
  const karmaTrend = comparison.karmaPercentChange > 0 ? 'up' : comparison.karmaPercentChange < 0 ? 'down' : 'stable';

  let reflection = `**Week in Review, ${name}:**\n\n`;

  // XP Performance
  if (comparison.xpPercentChange > 20) {
    reflection += `🚀 XP is ${xpTrend} ${Math.abs(Math.round(comparison.xpPercentChange))}%! You're leveling up like a boss. `;
  } else if (comparison.xpPercentChange > 0) {
    reflection += `📈 XP gained ${Math.round(comparison.xpPercentChange)}% this week. Steady progress! `;
  } else if (comparison.xpPercentChange < -10) {
    reflection += `📉 XP down ${Math.abs(Math.round(comparison.xpPercentChange))}% this week. Time to bounce back! `;
  } else {
    reflection += `XP holding steady. Sometimes plateaus come before breakthroughs. `;
  }

  // Karma
  if (comparison.karmaPercentChange > 10) {
    reflection += `Your Karma is glowing (${karmaTrend} ${Math.abs(Math.round(comparison.karmaPercentChange))}%). `;
  } else if (comparison.karmaPercentChange < -10) {
    reflection += `Karma dipped ${Math.abs(Math.round(comparison.karmaPercentChange))}%. Balance, young padawan. `;
  }

  // Streak commentary
  if (stats.streakCount >= 7) {
    reflection += `\n\n🔥 That ${stats.streakCount}-day streak is legendary. Don't let up now!`;
  } else if (stats.streakCount >= 3) {
    reflection += `\n\n💪 ${stats.streakCount}-day streak building. Keep it rolling!`;
  } else if (stats.streakCount === 0) {
    reflection += `\n\n🌱 Fresh start! Build that streak back one day at a time.`;
  }

  // Seasonal context
  if (stats.seasonalXP > 0) {
    reflection += `\n\n🎯 Season progress: ${stats.seasonalXP} XP. The leaderboard awaits.`;
  }

  return reflection.trim();
}

/**
 * Generate monthly reflection (comprehensive)
 */
function generateMonthlyReflection(stats: UserStats, comparison: ComparisonStats, name: string): string {
  let reflection = `**Monthly Reflection: ${name}**\n\n`;

  reflection += `This month, you've grown in ways that matter:\n\n`;
  
  if (comparison.xpChange > 0) {
    reflection += `• **XP Growth:** +${comparison.xpChange} (${Math.round(comparison.xpPercentChange)}% increase)\n`;
  }
  
  if (comparison.coinsChange !== 0) {
    reflection += `• **Coins:** ${comparison.coinsChange > 0 ? '+' : ''}${comparison.coinsChange}\n`;
  }
  
  if (comparison.karmaChange !== 0) {
    reflection += `• **Karma:** ${comparison.karmaChange > 0 ? '+' : ''}${comparison.karmaChange}\n`;
  }

  reflection += `\n**Current Standing:**\n`;
  reflection += `• Level ${stats.level} • ${stats.currentXP} XP • ${stats.streakCount}-day streak\n`;
  reflection += `• ${stats.questionsAnswered} questions answered this journey\n`;

  reflection += `\n*"Comparison is the thief of joy — unless it gives you XP."* Keep moving forward! 🦁`;

  return reflection;
}

/**
 * Generate milestone reflection
 */
function generateMilestoneReflection(stats: UserStats, name: string): string {
  const milestones = [];

  if (stats.level % 10 === 0) {
    milestones.push(`🎉 **Level ${stats.level} Milestone!** You've reached a major tier, ${name}.`);
  }

  if (stats.streakCount === 30) {
    milestones.push(`🔥 **30-Day Streak!** You're officially unstoppable, ${name}.`);
  }

  if (stats.questionsAnswered % 100 === 0) {
    milestones.push(`🎯 **${stats.questionsAnswered} Questions!** That's dedication, ${name}.`);
  }

  if (milestones.length > 0) {
    return milestones.join('\n\n');
  }

  return `Keep going, ${name}! The next milestone is just around the corner. 🚀`;
}

/**
 * Get comparison stats from previous period
 */
async function getComparisonStats(
  userId: string,
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'MILESTONE'
): Promise<ComparisonStats> {
  const now = new Date();
  let compareDate: Date;

  switch (type) {
    case 'DAILY':
      compareDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'WEEKLY':
      compareDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'MONTHLY':
      compareDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      compareDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  // Try to find weekly stats for comparison
  const weeklyStats = await prisma.userWeeklyStats.findFirst({
    where: {
      userId,
      weekStart: { lte: compareDate },
    },
    orderBy: {
      weekStart: 'desc',
    },
  });

  // Get current user stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      xp: true,
      coins: true,
      karmaScore: true,
    },
  });

  if (!user) {
    return {
      xpChange: 0,
      coinsChange: 0,
      karmaChange: 0,
      xpPercentChange: 0,
      coinsPercentChange: 0,
      karmaPercentChange: 0,
    };
  }

  if (weeklyStats) {
    const xpChange = weeklyStats.xpGain;
    const coinsChange = weeklyStats.coinsGain;
    const karmaChange = weeklyStats.karmaGain;

    return {
      xpChange,
      coinsChange,
      karmaChange,
      xpPercentChange: calculatePercentChange(user.xp - xpChange, user.xp),
      coinsPercentChange: calculatePercentChange(user.coins - coinsChange, user.coins),
      karmaPercentChange: calculatePercentChange(user.karmaScore - karmaChange, user.karmaScore),
    };
  }

  // Fallback: return zeros if no comparison data
  return {
    xpChange: 0,
    coinsChange: 0,
    karmaChange: 0,
    xpPercentChange: 0,
    coinsPercentChange: 0,
    karmaPercentChange: 0,
  };
}

/**
 * Calculate percent change
 */
function calculatePercentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Store reflection in database
 */
export async function storeReflection(
  userId: string,
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'MILESTONE',
  content: string,
  stats?: any
): Promise<void> {
  await prisma.userReflection.create({
    data: {
      userId,
      type,
      content,
      summary: content.slice(0, 200), // First 200 chars as summary
      sentiment: determineSentiment(content),
      stats: stats || {},
    },
  });
}

/**
 * Simple sentiment detection
 */
function determineSentiment(content: string): string {
  const positive = ['up', 'great', 'amazing', 'fire', 'boss', 'legendary', 'impressive'];
  const negative = ['down', 'dipped', 'low', 'plateau'];

  const lowerContent = content.toLowerCase();
  
  const positiveCount = positive.filter(word => lowerContent.includes(word)).length;
  const negativeCount = negative.filter(word => lowerContent.includes(word)).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

