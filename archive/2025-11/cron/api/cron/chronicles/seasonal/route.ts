import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeAsync, unauthorizedError, successResponse, validationError } from "@/lib/api-handler";
import { z } from "zod";

const SeasonalChronicleSchema = z.object({
  seasonId: z.string().min(1).optional(),
});

/**
 * POST /api/cron/chronicles/seasonal
 * Runs at season end (triggered by admin or system event)
 * Generates seasonal chronicles for users
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get("x-cron-token");
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError("Invalid token");
  }

  const body = await req.json().catch(() => ({}));
  const parsed = SeasonalChronicleSchema.safeParse(body);
  if (!parsed.success && Object.keys(body).length > 0) {
    return validationError("Invalid payload");
  }

  const { seasonId } = parsed.data || {};

  let season: { id: string; startDate: Date; endDate: Date | null } | null = null;

  if (seasonId) {
    season = await prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true, startDate: true, endDate: true },
    });
    if (!season) {
      return validationError("Season not found");
    }
  } else {
    // Get current active season
    season = await prisma.season.findFirst({
      where: {
        status: "ACTIVE",
      },
      select: { id: true, startDate: true, endDate: true },
      orderBy: {
        startDate: "desc",
      },
    });
  }

  if (!season) {
    return successResponse({
      success: true,
      message: "No active season found",
      generated: 0,
    });
  }

  const startDate = season.startDate;
  const endDate = season.endDate || new Date();

  // Get users with ≥3 reflections in season
  const usersWithReflections = await prisma.userReflection.groupBy({
    by: ["userId"],
    where: {
      date: {
        gte: startDate,
        lte: endDate,
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

      // Get reflections for this user in season
      const reflections = await prisma.userReflection.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
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
      const summaryText = `This season you reflected ${reflectionCount} times and earned ${xpGained} XP. Mood balance: ${dominantSentiment}. Keep it up.`;

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
        periodStart: startDate.toISOString(),
        periodEnd: endDate.toISOString(),
      };

      // Delete old seasonal chronicle for this season
      await prisma.chronicle.deleteMany({
        where: {
          userId,
          type: "seasonal",
          seasonId: season.id,
        },
      });

      // Create new chronicle
      await prisma.chronicle.create({
        data: {
          userId,
          type: "seasonal",
          summaryText,
          statsJson,
          quote,
          generatedAt: new Date(),
          seasonId: season.id,
        },
      });

      generated++;
    } catch (err) {
      console.error(`Failed to generate seasonal chronicle for user ${group.userId}:`, err);
      errors++;
    }
  }

  return successResponse({
    success: true,
    generated,
    errors,
    usersProcessed: usersWithReflections.length,
    seasonId: season.id,
    message: "Seasonal chronicle generation completed",
  });
});

