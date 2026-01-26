/**
 * Weekly Reflections Job Handler (v0.29.21)
 * 
 * Generate weekly reflections for active users (≥3 reflections/week)
 */

import { prisma } from '@/lib/db';

export async function runWeeklyReflections(): Promise<void> {
  const now = new Date();
  // Get start of current week (Monday)
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Get users with ≥3 reflections this week
  const usersWithReflections = await prisma.userReflection.groupBy({
    by: ['userId'],
    where: {
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    having: {
      userId: {
        _count: {
          gte: 3,
        },
      },
    },
  });

  for (const group of usersWithReflections) {
    const userId = group.userId;

    // Get reflections for this user
    const reflections = await prisma.userReflection.findMany({
      where: {
        userId,
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      select: {
        id: true,
        date: true,
        sentiment: true,
        content: true,
      },
    });

    if (reflections.length < 3) continue;

    // Calculate stats
    const reflectionCount = reflections.length;
    const sentiments = reflections
      .map((r) => r.sentiment)
      .filter((s): s is string => !!s);
    const sentimentCounts: Record<string, number> = {};
    sentiments.forEach((s) => {
      sentimentCounts[s] = (sentimentCounts[s] || 0) + 1;
    });

    // Find most active day
    const dayCounts: Record<string, number> = {};
    reflections.forEach((r) => {
      const day = new Date(r.date).toLocaleDateString('en-US', { weekday: 'short' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const mostActiveDay = Object.entries(dayCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];

    // Get user XP
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true },
    });

    const xpGained = user?.xp || 0;

    // Calculate dominant sentiment
    const sentimentKeys = ['calm', 'joy', 'sad', 'anger', 'chaos', 'hope'];
    const dominantSentiment = sentimentKeys.reduce((a, b) => {
      const aCount = sentimentCounts[a] || 0;
      const bCount = sentimentCounts[b] || 0;
      return aCount > bCount ? a : b;
    }, 'calm');

    // Generate summary
    const summaryText = `You reflected ${reflectionCount} times this week and earned ${xpGained} XP. Mood balance: ${dominantSentiment}. Keep it up.`;

    // Generate quote
    const quotes: Record<string, string[]> = {
      calm: [
        'The quieter you become, the more you can hear.',
        'Peace comes from within.',
      ],
      joy: [
        'Happiness is a journey, not a destination.',
        'The best way to cheer yourself up is to try to cheer somebody else up.',
      ],
      sad: [
        'The way to get started is to quit talking and begin doing.',
        'Every cloud has a silver lining.',
      ],
      anger: [
        'Anger is an acid that can do more harm to the vessel in which it is stored than to anything on which it is poured.',
        'For every minute you remain angry, you give up sixty seconds of peace of mind.',
      ],
      chaos: [
        'In the middle of chaos, there is also opportunity.',
        'Chaos is a name for any order that produces confusion in our minds.',
      ],
      hope: [
        'Hope is the thing with feathers that perches in the soul.',
        'Where there is no hope, we must invent it.',
      ],
    };

    const quoteArray = quotes[dominantSentiment] || quotes.calm;
    const randomQuote = quoteArray[Math.floor(Math.random() * quoteArray.length)];

    // Check if chronicle already exists for this week
    const existingChronicle = await prisma.userChronicle.findFirst({
      where: {
        userId,
        periodStart: weekStart,
        periodEnd: weekEnd,
        type: 'WEEKLY',
      },
    });

    if (!existingChronicle) {
      await prisma.userChronicle.create({
        data: {
          userId,
          title: `Week of ${weekStart.toLocaleDateString()}`,
          summary: summaryText,
          content: randomQuote,
          periodStart: weekStart,
          periodEnd: weekEnd,
          type: 'WEEKLY',
          metadata: {
            reflectionCount,
            sentimentCounts,
            mostActiveDay,
            xpGained,
          },
        },
      });
    }
  }
}

