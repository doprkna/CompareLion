import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeAsync, unauthorizedError, successResponse } from "@/lib/api-handler";

/**
 * POST /api/cron/chronicles/weekly
 * Runs every Sunday 02:00 CET
 * Generates weekly chronicles for active users (≥3 reflections/week)
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get("x-cron-token");
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError("Invalid token");
  }

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
    by: ["userId"],
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

  let generated = 0;
  let errors = 0;

  for (const group of usersWithReflections) {
    try {
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
        const day = new Date(r.date).toLocaleDateString("en-US", { weekday: "short" });
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
      const sentimentKeys = ["calm", "joy", "sad", "anger", "chaos", "hope"];
      const dominantSentiment = sentimentKeys.reduce((a, b) => {
        const aCount = sentimentCounts[a] || 0;
        const bCount = sentimentCounts[b] || 0;
        return aCount > bCount ? a : b;
      }, "calm");

      // Generate summary
      const summaryText = `You reflected ${reflectionCount} times this week and earned ${xpGained} XP. Mood balance: ${dominantSentiment}. Keep it up.`;

      // Generate quote
      const quotes: Record<string, string[]> = {
        calm: ["Peace is not the absence of storms, but the ability to navigate them."],
        joy: ["Happiness is not a destination, it's a way of life."],
        sad: ["From sadness comes growth and understanding."],
        anger: ["Transforming anger into action is a superpower."],
        chaos: ["In chaos, we find opportunity."],
        hope: ["Hope is the anchor of the soul."],
      };
      const sentimentQuotes = quotes[dominantSentiment] || quotes.calm;
      const quote = sentimentQuotes[Math.floor(Math.random() * sentimentQuotes.length)];

      const statsJson = {
        reflectionCount,
        xpGained,
        dominantSentiment,
        sentimentCounts,
        mostActiveDay,
        periodStart: weekStart.toISOString(),
        periodEnd: weekEnd.toISOString(),
      };

      // Delete old weekly chronicle
      await prisma.chronicle.deleteMany({
        where: {
          userId,
          type: "weekly",
        },
      });

      // Create new chronicle
      await prisma.chronicle.create({
        data: {
          userId,
          type: "weekly",
          summaryText,
          statsJson,
          quote,
          generatedAt: now,
        },
      });

      // Award XP bonus (+1%)
      if (xpGained > 0) {
        const bonusXP = Math.floor(xpGained * 0.01);
        if (bonusXP > 0) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              xp: { increment: bonusXP },
            },
          });
        }
      }

      generated++;
    } catch (err) {
      console.error(`Failed to generate chronicle for user ${group.userId}:`, err);
      errors++;
    }
  }

  return successResponse({
    success: true,
    generated,
    errors,
    usersProcessed: usersWithReflections.length,
    message: "Weekly chronicle generation completed",
  });
});

