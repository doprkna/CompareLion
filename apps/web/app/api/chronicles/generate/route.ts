import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError, validationError } from "@/lib/api-handler";
import { z } from "zod";

const GenerateChronicleSchema = z.object({
  type: z.enum(["weekly", "seasonal"]),
  seasonId: z.string().optional(),
});

/**
 * POST /api/chronicles/generate
 * Generate a new chronicle for the user (auth required)
 * Collects reflections + stats → creates one Chronicle record
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return notFoundError("User");
  }

  const body = await req.json().catch(() => ({}));
  const parsed = GenerateChronicleSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid payload");
  }

  const { type, seasonId } = parsed.data;

  // Calculate date range
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  if (type === "weekly") {
    // Get start of current week (Monday)
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
    startDate = new Date(now.setDate(diff));
    startDate.setHours(0, 0, 0, 0);
  } else {
    // Seasonal - use season dates if seasonId provided
    if (seasonId) {
      const season = await prisma.season.findUnique({
        where: { id: seasonId },
        select: { startDate: true, endDate: true },
      });
      if (season) {
        startDate = season.startDate;
        endDate = season.endDate || now;
      } else {
        return validationError("Season not found");
      }
    } else {
      // Default to last 30 days
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  // Collect reflections
  const reflections = await prisma.userReflection.findMany({
    where: {
      userId: user.id,
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
    orderBy: {
      date: "desc",
    },
  });

  // Check minimum reflection count
  if (reflections.length < 3) {
    return validationError("Need at least 3 reflections to generate chronicle");
  }

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

  // Get XP stats from user stats or wallet
  const userStats = await prisma.user.findUnique({
    where: { id: user.id },
    select: { xp: true },
  });

  // Get XP gained in period (simplified - would need tracking)
  const xpGained = 0; // Placeholder - would track XP changes

  // Calculate average sentiment
  const sentimentKeys = ["calm", "joy", "sad", "anger", "chaos", "hope"];
  const dominantSentiment = sentimentKeys.reduce((a, b) => {
    const aCount = sentimentCounts[a] || 0;
    const bCount = sentimentCounts[b] || 0;
    return aCount > bCount ? a : b;
  }, "calm");

  // Generate summary text
  const summaryText = generateSummaryText({
    reflectionCount,
    xpGained: userStats?.xp || 0,
    dominantSentiment,
    mostActiveDay,
  });

  // Generate quote
  const quote = generateQuote(dominantSentiment);

  // Stats JSON
  const statsJson = {
    reflectionCount,
    xpGained: userStats?.xp || 0,
    dominantSentiment,
    sentimentCounts,
    mostActiveDay,
    periodStart: startDate.toISOString(),
    periodEnd: endDate.toISOString(),
  };

  // Delete old chronicle of same type (keep only latest)
  await prisma.chronicle.deleteMany({
    where: {
      userId: user.id,
      type: type as "weekly" | "seasonal",
    },
  });

  // Create new chronicle  
  const chronicleType = type as "weekly" | "seasonal";
  const chronicle = await prisma.chronicle.create({
    data: {
      userId: user.id,
      type: chronicleType,
      summaryText,
      statsJson,
      quote,
      generatedAt: now,
      seasonId: seasonId || null,
    },
  });

      // Optional: Award small XP bonus (+1%) for active week
      if (chronicleType === "weekly" && reflectionCount >= 3) {
    const bonusXP = Math.floor((userStats?.xp || 0) * 0.01);
    if (bonusXP > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          xp: { increment: bonusXP },
        },
      });
    }
  }

  return successResponse({
    success: true,
    chronicle: {
      id: chronicle.id,
      type: chronicle.type,
      summaryText: chronicle.summaryText,
      stats: chronicle.statsJson,
      quote: chronicle.quote,
      generatedAt: chronicle.generatedAt,
    },
  });
});

// Helper function to generate summary text
function generateSummaryText(params: {
  reflectionCount: number;
  xpGained: number;
  dominantSentiment: string;
  mostActiveDay: string;
}): string {
  const { reflectionCount, xpGained, dominantSentiment, mostActiveDay } = params;
  
  const templates = [
    `You reflected ${reflectionCount} times and earned ${xpGained} XP. Mood balance: ${dominantSentiment}. Keep it up.`,
    `This week: ${reflectionCount} reflections, ${xpGained} XP gained. Most active day: ${mostActiveDay}. Mood: ${dominantSentiment}.`,
    `${reflectionCount} reflections recorded. ${xpGained} XP earned. Dominant mood: ${dominantSentiment}. Your most active day was ${mostActiveDay}.`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

// Helper function to generate motivational quotes
function generateQuote(sentiment: string): string {
  const quotes: Record<string, string[]> = {
    calm: [
      "Peace is not the absence of storms, but the ability to navigate them.",
      "In the calm, we find clarity.",
    ],
    joy: [
      "Happiness is not a destination, it's a way of life.",
      "Joy multiplies when shared.",
    ],
    sad: [
      "It's okay to feel sad. Emotions are part of the human experience.",
      "From sadness comes growth and understanding.",
    ],
    anger: [
      "Anger is energy. Use it wisely.",
      "Transforming anger into action is a superpower.",
    ],
    chaos: [
      "In chaos, we find opportunity.",
      "Sometimes the mess is exactly where we need to be.",
    ],
    hope: [
      "Hope is the anchor of the soul.",
      "Even in darkness, hope lights the way.",
    ],
  };

  const sentimentQuotes = quotes[sentiment] || quotes.calm;
  return sentimentQuotes[Math.floor(Math.random() * sentimentQuotes.length)];
}

