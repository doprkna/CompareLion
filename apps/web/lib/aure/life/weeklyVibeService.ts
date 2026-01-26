/**
 * AURE Life Engine - Weekly Vibe Service
 * Generates weekly vibe summaries based on user activity
 * v0.39.1 - AURE Life Engine
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { GEN_CONFIG } from '@parel/core/config/generator';
import { getTimelineForWeeklyVibe } from './timelineService';

export interface WeeklyVibe {
  summary: string;
  categoryDistribution: Record<string, number>;
  avgScore: number;
  vibeChange?: string | null;
  generatedAt: Date;
}

/**
 * Generate weekly vibe summary for a user
 * Analyzes last 7 days of activity and generates AI summary
 */
export async function generateWeeklyVibe(userId: string): Promise<WeeklyVibe> {
  try {
    // Fetch last 7 days of timeline events
    const timelineEvents = await getTimelineForWeeklyVibe(userId);

    // Fetch rating results from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const ratingResults = await prisma.ratingResult.findMany({
      where: {
        request: {
          userId,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      },
      include: {
        request: {
          select: {
            category: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Compute category distribution
    const categoryDistribution: Record<string, number> = {};
    const scores: number[] = [];

    ratingResults.forEach((result) => {
      const category = result.request.category;
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;

      const metrics = result.metrics as Record<string, number>;
      const metricValues = Object.values(metrics);
      if (metricValues.length > 0) {
        const avg = metricValues.reduce((a, b) => a + b, 0) / metricValues.length;
        scores.push(avg);
      }
    });

    const avgScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    // Get previous week's vibe for comparison (if exists)
    const previousWeekStart = new Date(sevenDaysAgo);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousWeekEnd = new Date(sevenDaysAgo);

    const previousWeekResults = await prisma.ratingResult.findMany({
      where: {
        request: {
          userId,
          createdAt: {
            gte: previousWeekStart,
            lt: previousWeekEnd,
          },
        },
      },
      take: 10, // Sample for comparison
    });

    const previousAvgScore = previousWeekResults.length > 0
      ? previousWeekResults.reduce((sum, result) => {
          const metrics = result.metrics as Record<string, number>;
          const metricValues = Object.values(metrics);
          if (metricValues.length > 0) {
            const avg = metricValues.reduce((a, b) => a + b, 0) / metricValues.length;
            return sum + avg;
          }
          return sum;
        }, 0) / previousWeekResults.length
      : null;

    // Build context for AI
    const topCategories = Object.entries(categoryDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, count]) => `${cat} (${count})`)
      .join(', ');

    const eventTypes = timelineEvents.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventSummary = Object.entries(eventTypes)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ');

    // Generate AI summary
    const aiSummary = await callAIForWeeklyVibe({
      totalRatings: ratingResults.length,
      topCategories,
      avgScore: Math.round(avgScore),
      eventSummary,
      previousAvgScore: previousAvgScore ? Math.round(previousAvgScore) : null,
    });

    return {
      summary: aiSummary.summary,
      categoryDistribution,
      avgScore: Math.round(avgScore * 10) / 10,
      vibeChange: aiSummary.vibeChange || null,
      generatedAt: new Date(),
    };
  } catch (error) {
    logger.error('[AURE Life] Failed to generate weekly vibe', { error, userId });
    
    // Return fallback summary
    return {
      summary: 'Your weekly vibe is being analyzed. Check back soon!',
      categoryDistribution: {},
      avgScore: 0,
      vibeChange: null,
      generatedAt: new Date(),
    };
  }
}

/**
 * Call AI to generate weekly vibe summary
 */
async function callAIForWeeklyVibe(context: {
  totalRatings: number;
  topCategories: string;
  avgScore: number;
  eventSummary: string;
  previousAvgScore: number | null;
}): Promise<{
  summary: string;
  vibeChange?: string | null;
}> {
  // Check if AI is configured
  if (!GEN_CONFIG.GPT_URL || !GEN_CONFIG.GPT_KEY) {
    // Fallback summary
    return {
      summary: `This week you explored ${context.topCategories || 'various categories'} with an average score of ${context.avgScore}. Keep exploring your unique taste!`,
      vibeChange: null,
    };
  }

  try {
    const systemPrompt = `You are a vibe curator for AURE (AI Universal Rating Engine).
Generate 2-paragraph weekly vibe summaries that are:
- Playful and encouraging
- Highlight patterns and trends
- Celebrate user's unique taste journey
- Optional: Compare to previous week if data available

Keep it concise (2 paragraphs max), positive, and fun.`;

    const changePrompt = context.previousAvgScore
      ? `Previous week average: ${context.previousAvgScore}. Current week average: ${context.avgScore}.`
      : '';

    const userPrompt = `This week's activity:
- Total ratings: ${context.totalRatings}
- Top categories: ${context.topCategories}
- Average score: ${context.avgScore}
- Event types: ${context.eventSummary}
${changePrompt}

Generate a 2-paragraph weekly vibe summary. ${context.previousAvgScore ? 'Include a brief note on what changed from last week.' : ''}

Return JSON:
{
  "summary": "Paragraph 1...\\n\\nParagraph 2...",
  "vibeChange": "Brief note on changes (optional)"
}`;

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
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`GPT API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No content from AI');
    }

    // Parse JSON (may be wrapped in markdown)
    let parsed: any;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate structure
    if (!parsed.summary) {
      throw new Error('Invalid vibe summary structure');
    }

    return {
      summary: parsed.summary,
      vibeChange: parsed.vibeChange || null,
    };
  } catch (error) {
    logger.warn('[AURE Life] AI weekly vibe generation failed, using fallback', { error });
    return {
      summary: `This week you explored ${context.topCategories || 'various categories'} with an average score of ${context.avgScore}. Keep exploring your unique taste!`,
      vibeChange: null,
    };
  }
}

