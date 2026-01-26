/**
 * AURE Life Engine - Yearly Wrap Service
 * Generates yearly personal recap based on AURE activity
 * v0.39.4 - AURE Yearly Wrap
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { GEN_CONFIG } from '@parel/core/config/generator';

export interface YearlyWrapData {
  timelineStats: {
    totalEvents: number;
    eventsByType: Record<string, number>;
  };
  categoryBreakdown: Record<string, number>;
  archetypeHistory: {
    firstArchetype: string | null;
    lastArchetype: string | null;
    evolution: string;
  };
  topItems: Array<{
    requestId: string;
    category: string;
    totalScore: number;
    imageUrl: string | null;
  }>;
  worstItems: Array<{
    requestId: string;
    category: string;
    totalScore: number;
    imageUrl: string | null;
  }>;
  vibeStory: string;
  recommendation: string;
  shareableId: string;
}

/**
 * Generate yearly wrap for user
 * Aggregates data from last 12 months
 */
export async function generateYearlyWrap(userId: string, year: number = new Date().getFullYear()): Promise<YearlyWrapData> {
  try {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);

    // Fetch timeline events
    const timelineEvents = await prisma.timelineEvent.findMany({
      where: {
        userId,
        createdAt: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
    });

    // Fetch rating results
    const ratingResults = await prisma.ratingResult.findMany({
      where: {
        request: {
          userId,
          createdAt: {
            gte: yearStart,
            lte: yearEnd,
          },
        },
      },
      include: {
        request: {
          select: {
            id: true,
            category: true,
            imageUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch archetype history
    const archetypes = await prisma.userArchetype.findUnique({
      where: { userId },
    });

    // Compute timeline stats
    const eventsByType: Record<string, number> = {};
    timelineEvents.forEach((event) => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });

    // Compute category breakdown
    const categoryBreakdown: Record<string, number> = {};
    ratingResults.forEach((result) => {
      const category = result.request.category;
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
    });

    // Get top and worst items
    const itemsWithScores = ratingResults.map((result) => {
      const metrics = result.metrics as Record<string, number>;
      const totalScore = Object.values(metrics).reduce((a, b) => a + b, 0) / Object.keys(metrics).length;
      return {
        requestId: result.requestId,
        category: result.request.category,
        totalScore,
        imageUrl: result.request.imageUrl,
      };
    });

    const topItems = itemsWithScores
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10)
      .map((item) => ({
        requestId: item.requestId,
        category: item.category,
        totalScore: Math.round(item.totalScore),
        imageUrl: item.imageUrl,
      }));

    const worstItems = itemsWithScores
      .sort((a, b) => a.totalScore - b.totalScore)
      .slice(0, 10)
      .map((item) => ({
        requestId: item.requestId,
        category: item.category,
        totalScore: Math.round(item.totalScore),
        imageUrl: item.imageUrl,
      }));

    // Get archetype evolution
    const firstArchetype = archetypes?.archetypeId || null;
    const lastArchetype = archetypes?.archetypeId || null;
    const evolution = firstArchetype && lastArchetype && firstArchetype !== lastArchetype
      ? `from ${firstArchetype.replace(/-/g, ' ')} to ${lastArchetype.replace(/-/g, ' ')}`
      : firstArchetype
      ? `stayed as ${firstArchetype.replace(/-/g, ' ')}`
      : 'no archetype detected yet';

    // Generate AI vibe story
    const vibeStory = await generateWrapVibeStory({
      totalRatings: ratingResults.length,
      categoryBreakdown,
      topCategory: Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none',
      topItems: topItems.slice(0, 3),
      archetypeEvolution: evolution,
      year,
    });

    // Generate recommendation
    const recommendation = await generateWrapRecommendation({
      archetype: lastArchetype,
      topCategory: Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none',
      year,
    });

    // Generate shareable ID
    const shareableId = `${userId}-${year}-${Date.now()}`;

    return {
      timelineStats: {
        totalEvents: timelineEvents.length,
        eventsByType,
      },
      categoryBreakdown,
      archetypeHistory: {
        firstArchetype,
        lastArchetype,
        evolution,
      },
      topItems,
      worstItems,
      vibeStory,
      recommendation,
      shareableId,
    };
  } catch (error) {
    logger.error('[AURE Life] Failed to generate yearly wrap', { error, userId, year });
    throw error;
  }
}

/**
 * Generate AI vibe story for wrap
 */
async function generateWrapVibeStory(context: {
  totalRatings: number;
  categoryBreakdown: Record<string, number>;
  topCategory: string;
  topItems: Array<{ category: string; totalScore: number }>;
  archetypeEvolution: string;
  year: number;
}): Promise<string> {
  // Check if AI is configured
  if (!GEN_CONFIG.GPT_URL || !GEN_CONFIG.GPT_KEY) {
    // Fallback story
    return `In ${context.year}, you rated ${context.totalRatings} items, with ${context.topCategory} being your favorite category. Your archetype ${context.archetypeEvolution}. Keep exploring your unique taste!`;
  }

  try {
    const systemPrompt = `You are a vibe storyteller for AURE (AI Universal Rating Engine).
Write a 3-6 paragraph "Your Year in Vibes" story that's playful, encouraging, and celebrates the user's unique taste journey.
Include 3 funniest insights and 3 wholesome insights.
End with dominant aesthetic themes and a closing line about what they might evolve into next year.`;

    const userPrompt = `Year: ${context.year}
Total ratings: ${context.totalRatings}
Top category: ${context.topCategory}
Category breakdown: ${JSON.stringify(context.categoryBreakdown)}
Top items: ${JSON.stringify(context.topItems)}
Archetype evolution: ${context.archetypeEvolution}

Generate a 3-6 paragraph "Your Year in Vibes" story. Include funniest insights, wholesome insights, dominant themes, and a closing prediction for next year.`;

    const response = await fetch(GEN_CONFIG.GPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GEN_CONFIG.GPT_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      throw new Error(`GPT API error: ${response.status}`);
    }

    const data = await response.json();
    const story = data.choices?.[0]?.message?.content?.trim();

    if (!story) {
      throw new Error('No content from AI');
    }

    return story;
  } catch (error) {
    logger.warn('[AURE Life] AI wrap story generation failed, using fallback', { error });
    return `In ${context.year}, you rated ${context.totalRatings} items, with ${context.topCategory} being your favorite category. Your archetype ${context.archetypeEvolution}. Keep exploring your unique taste!`;
  }
}

/**
 * Generate recommendation for next year
 */
async function generateWrapRecommendation(context: {
  archetype: string | null;
  topCategory: string;
  year: number;
}): Promise<string> {
  // Check if AI is configured
  if (!GEN_CONFIG.GPT_URL || !GEN_CONFIG.GPT_KEY) {
    return `In ${context.year + 1}, you might evolve into new aesthetic territories. Keep exploring!`;
  }

  try {
    const systemPrompt = `You are a vibe predictor for AURE.
Give a short, playful prediction about what the user might evolve into next year based on their current archetype and favorite category.`;

    const userPrompt = `Current archetype: ${context.archetype || 'unknown'}
Top category: ${context.topCategory}
Next year: ${context.year + 1}

Generate a short closing line: "In ${context.year + 1}, you might evolve into..."`;

    const response = await fetch(GEN_CONFIG.GPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GEN_CONFIG.GPT_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error(`GPT API error: ${response.status}`);
    }

    const data = await response.json();
    const recommendation = data.choices?.[0]?.message?.content?.trim();

    if (!recommendation) {
      throw new Error('No content from AI');
    }

    return recommendation;
  } catch (error) {
    logger.warn('[AURE Life] AI wrap recommendation generation failed, using fallback', { error });
    return `In ${context.year + 1}, you might evolve into new aesthetic territories. Keep exploring!`;
  }
}

