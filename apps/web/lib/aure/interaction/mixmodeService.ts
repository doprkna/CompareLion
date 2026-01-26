/**
 * AURE Interaction Engine - Mix Mode Service 2.0
 * Generates vibe stories + collage from multiple rating requests
 * v0.39.8 - Mix Mode 2.0 (Multi-Image Vibe Story)
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { GEN_CONFIG } from '@parel/core/config/generator';

export interface MixStory {
  id: string;
  userId: string;
  requestIds: string[];
  story: string;
  labels: string[];
  moodScore: number;
  createdAt: Date;
}

export interface MixStoryResult {
  story: string;
  labels: string[];
  moodScore: number;
}

/**
 * Generate mix story from multiple rating requests
 * Combines AURE summaries into AI-generated vibe story
 */
export async function generateMixStory(
  userId: string,
  requestIds: string[]
): Promise<MixStory> {
  try {
    if (requestIds.length < 2) {
      throw new Error('Need at least 2 requests for mix story');
    }

    // Fetch rating results
    const results = await prisma.ratingResult.findMany({
      where: {
        requestId: {
          in: requestIds,
        },
      },
      include: {
        request: {
          select: {
            category: true,
            imageUrl: true,
            text: true,
          },
        },
      },
    });

    if (results.length !== requestIds.length) {
      throw new Error('Some requests not found or not rated');
    }

    // Build context for AI
    const summaries = results.map((r) => r.summaryText).join('\n\n');
    const categories = results.map((r) => r.request.category).join(', ');
    
    // Extract metrics for mood score calculation
    const allMetrics = results.map((r) => r.metrics as Record<string, number>);
    const topMetrics = extractTopMetrics(allMetrics);

    // Generate AI story with labels and mood score
    const storyResult = await callAIForMixStory(summaries, categories, topMetrics);

    // Save mix session (store story + labels as JSON in story field for now)
    try {
      const session = await prisma.mixSession.create({
        data: {
          userId,
          requestIds: requestIds,
          story: JSON.stringify({
            story: storyResult.story,
            labels: storyResult.labels,
            moodScore: storyResult.moodScore,
          }),
        },
      });

      return {
        id: session.id,
        userId: session.userId,
        requestIds: requestIds,
        story: storyResult.story,
        labels: storyResult.labels,
        moodScore: storyResult.moodScore,
        createdAt: session.createdAt,
      };
    } catch (error: any) {
      // If model doesn't exist yet, return placeholder
      if (error.message?.includes('model') || error.message?.includes('MixSession')) {
        logger.warn('[AURE Interaction] MixSession model not found - Prisma migration required');
        return {
          id: 'placeholder',
          userId,
          requestIds,
          story: storyResult.story,
          labels: storyResult.labels,
          moodScore: storyResult.moodScore,
          createdAt: new Date(),
        };
      }
      throw error;
    }
  } catch (error) {
    logger.error('[AURE Interaction] Failed to generate mix story', { error, userId, requestIds });
    throw error;
  }
}

/**
 * Extract top metrics from all rating results
 */
function extractTopMetrics(allMetrics: Record<string, number>[]): Record<string, number> {
  const metricTotals: Record<string, number> = {};
  const metricCounts: Record<string, number> = {};

  allMetrics.forEach((metrics) => {
    Object.entries(metrics).forEach(([key, value]) => {
      metricTotals[key] = (metricTotals[key] || 0) + value;
      metricCounts[key] = (metricCounts[key] || 0) + 1;
    });
  });

  const averages: Record<string, number> = {};
  Object.keys(metricTotals).forEach((key) => {
    averages[key] = Math.round(metricTotals[key] / metricCounts[key]);
  });

  // Sort by average value and return top 3
  const sorted = Object.entries(averages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return Object.fromEntries(sorted);
}

/**
 * Call AI to generate mix story with labels and mood score
 */
async function callAIForMixStory(
  summaries: string,
  categories: string,
  topMetrics: Record<string, number>
): Promise<MixStoryResult> {
  // Check if AI is configured
  if (!GEN_CONFIG.GPT_URL || !GEN_CONFIG.GPT_KEY) {
    // Fallback result
    const avgScore = Object.values(topMetrics).reduce((a, b) => a + b, 0) / Object.keys(topMetrics).length || 50;
    return {
      story: `A collection of ${categories} items that tell a unique story. Each piece brings its own vibe, creating a fascinating mix of styles and preferences.`,
      labels: ['Mixed Vibes', 'Curated Collection', 'Personal Style'],
      moodScore: Math.round(avgScore),
    };
  }

  try {
    const systemPrompt = `You are a vibe storyteller for AURE (AI Universal Rating Engine).
Combine multiple item summaries into a cohesive, playful story.
Generate:
1. A 1-2 paragraph "vibe story" that connects the items thematically
2. 3 short mood labels (2-3 words each, like "Cozy", "Chaotic", "Snack-Focused")
3. A mood score (0-100) representing overall vibe intensity

Keep it concise, positive, and fun.`;

    const metricsText = Object.entries(topMetrics)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    const userPrompt = `Categories: ${categories}
Top Metrics: ${metricsText}

Summaries:
${summaries.substring(0, 2000)}${summaries.length > 2000 ? '...' : ''}

Generate a vibe story, 3 mood labels, and mood score. Format as JSON:
{
  "story": "...",
  "labels": ["label1", "label2", "label3"],
  "moodScore": 75
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
        max_tokens: 400,
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

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(content);
      return {
        story: parsed.story || content,
        labels: Array.isArray(parsed.labels) ? parsed.labels.slice(0, 3) : ['Mixed Vibes', 'Curated', 'Personal'],
        moodScore: typeof parsed.moodScore === 'number' ? Math.max(0, Math.min(100, parsed.moodScore)) : 50,
      };
    } catch {
      // If not JSON, treat as story only
      const avgScore = Object.values(topMetrics).reduce((a, b) => a + b, 0) / Object.keys(topMetrics).length || 50;
      return {
        story: content,
        labels: ['Mixed Vibes', 'Curated Collection', 'Personal Style'],
        moodScore: Math.round(avgScore),
      };
    }
  } catch (error) {
    logger.warn('[AURE Interaction] AI mix story generation failed, using fallback', { error });
    const avgScore = Object.values(topMetrics).reduce((a, b) => a + b, 0) / Object.keys(topMetrics).length || 50;
    return {
      story: `A collection of ${categories} items that tell a unique story. Each piece brings its own vibe, creating a fascinating mix of styles and preferences.`,
      labels: ['Mixed Vibes', 'Curated Collection', 'Personal Style'],
      moodScore: Math.round(avgScore),
    };
  }
}

/**
 * Get image URLs for collage generation
 */
export async function getMixImageUrls(requestIds: string[]): Promise<string[]> {
  try {
    const requests = await prisma.ratingRequest.findMany({
      where: {
        id: {
          in: requestIds,
        },
      },
      select: {
        imageUrl: true,
      },
    });

    return requests
      .map((r) => r.imageUrl)
      .filter((url): url is string => !!url)
      .slice(0, 6); // Cap at 6 images
  } catch (error) {
    logger.error('[AURE Interaction] Failed to get mix image URLs', { error, requestIds });
    return [];
  }
}

