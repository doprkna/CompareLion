/**
 * Parel Story Generator - Weekly Story Service
 * Auto-generates weekly recap stories from user activity
 * v0.40.3 - Auto-Story from Weekly Activity (My Week Story)
 */

import { prisma } from '@parel/db';
import { logger } from '@parel/core';
import { GEN_CONFIG } from '@parel/core';
import { cacheGet, cacheSet } from '@parel/core/cache';
// TODO-PHASE2: Replace web-specific AURE logic with backend-safe alternative
// import { getTimelineForWeeklyVibe } from '@/lib/aure/life/timelineService';
// import { generateWeeklyVibe } from '@/lib/aure/life/weeklyVibeService';
// import { getUserArchetype } from '@/lib/aure/life/archetypeService';

export interface WeeklyActivity {
  topImages: Array<{
    imageUrl: string;
    category: string;
    caption?: string;
    requestId: string;
  }>;
  vibeSummary: string;
  archetypeChange?: {
    from: string | null;
    to: string;
    reason?: string | null;
  };
  questHighlights: string[];
  weirdMoments: string[];
  categoryDistribution: Record<string, number>;
  totalRatings: number;
  avgScore: number;
}

export interface WeeklyStoryPanel {
  role: 'intro' | 'build' | 'peak' | 'outro';
  imageUrl: string;
  caption: string;
  vibeTag: string;
  microStory: string;
}

export interface WeeklyStory {
  title: string;
  panels: WeeklyStoryPanel[];
  outro: string;
}

/**
 * Get weekly activity data (last 7 days)
 */
export async function getWeeklyActivity(userId: string): Promise<WeeklyActivity> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch timeline events
    // TODO-PHASE2: Replace web-specific AURE logic with backend-safe alternative
    const timelineEvents: any[] = []; // await getTimelineForWeeklyVibe(userId);

    // Fetch rating results with images
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
      take: 20, // Get top 20 for selection
    });

    // Get top images (with highest scores)
    const topImages = ratingResults
      .filter((result) => result.request.imageUrl)
      .map((result) => {
        const metrics = result.metrics as Record<string, number>;
        const metricValues = Object.values(metrics);
        const avgScore = metricValues.length > 0
          ? metricValues.reduce((a, b) => a + b, 0) / metricValues.length
          : 0;

        return {
          imageUrl: result.request.imageUrl!,
          category: result.request.category,
          requestId: result.requestId,
          score: avgScore,
          summaryText: result.summaryText || '',
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((item) => ({
        imageUrl: item.imageUrl,
        category: item.category,
        caption: item.summaryText.substring(0, 100) || undefined,
        requestId: item.requestId,
      }));

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

    // Get weekly vibe summary
    let vibeSummary = 'A week of exploration and discovery.';
    // TODO-PHASE2: Replace web-specific AURE logic with backend-safe alternative
    // try {
    //   const vibe = await generateWeeklyVibe(userId);
    //   vibeSummary = vibe.summary;
    // } catch (error) {
    //   logger.debug('[WeeklyStory] Failed to generate weekly vibe', { error });
    // }

    // Get archetype change (if any)
    let archetypeChange: { from: string | null; to: string; reason?: string | null } | undefined;
    // TODO-PHASE2: Replace web-specific AURE logic with backend-safe alternative
    // try {
    //   const archetype = await getUserArchetype(userId);
    //   if (archetype.previousArchetypeId && archetype.previousArchetypeId !== archetype.archetypeId) {
    //     archetypeChange = {
    //       from: archetype.previousArchetypeId,
    //       to: archetype.archetypeId,
    //       reason: archetype.changeReason || null,
    //     };
    //   }
    // } catch (error) {
    //   logger.debug('[WeeklyStory] Failed to get archetype', { error });
    // }

    // Get quest completions
    let questHighlights: string[] = [];
    try {
      const questCompletions = await prisma.questProgress.findMany({
        where: {
          userId,
          completedAt: {
            gte: sevenDaysAgo,
          },
        },
        include: {
          quest: {
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          completedAt: 'desc',
        },
        take: 5,
      });

      questHighlights = questCompletions
        .filter((completion) => completion.quest)
        .map((completion) => (completion.quest as any).title || 'Quest completed');
    } catch (error) {
      logger.debug('[WeeklyStory] Failed to get quest completions', { error });
      // Continue without quest highlights
    }

    // Find "weird" moments (low scores or unusual categories)
    const weirdMoments = ratingResults
      .filter((result) => {
        const metrics = result.metrics as Record<string, number>;
        const metricValues = Object.values(metrics);
        if (metricValues.length === 0) return false;
        const avg = metricValues.reduce((a, b) => a + b, 0) / metricValues.length;
        return avg < 30 || result.request.category === 'weird';
      })
      .slice(0, 3)
      .map((result) => {
        const category = result.request.category;
        const summary = result.summaryText || '';
        return `${category}: ${summary.substring(0, 80)}`;
      });

    return {
      topImages,
      vibeSummary,
      archetypeChange,
      questHighlights,
      weirdMoments,
      categoryDistribution,
      totalRatings: ratingResults.length,
      avgScore: Math.round(avgScore * 10) / 10,
    };
  } catch (error) {
    logger.error('[WeeklyStory] Failed to get weekly activity', { error, userId });
    throw error;
  }
}

/**
 * Generate weekly story from activity data
 * Cached for 1 hour to avoid regenerating same story multiple times
 */
export async function generateWeeklyStory(data: WeeklyActivity, userId?: string): Promise<WeeklyStory> {
  try {
    // Try cache first if userId provided
    if (userId) {
      const cacheKey = `weeklyStory:${userId}`;
      const cached = await cacheGet<WeeklyStory>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    // Determine number of panels (3-6 based on available data)
    let numPanels = 3;
    if (data.topImages.length >= 2) numPanels = 4;
    if (data.archetypeChange) numPanels = Math.min(6, numPanels + 1);
    if (data.questHighlights.length > 0) numPanels = Math.min(6, numPanels + 1);
    if (data.weirdMoments.length > 0) numPanels = Math.min(6, numPanels + 1);

    // Generate story via AI
    const story = await callAIForWeeklyStory(data, numPanels);

    // Cache result for 1 hour
    if (userId) {
      await cacheSet(`weeklyStory:${userId}`, story, 3600);
    }

    return story;
  } catch (error) {
    logger.error('[WeeklyStory] Failed to generate weekly story', { error, data });
    throw error;
  }
}

/**
 * Call AI to generate weekly story
 */
async function callAIForWeeklyStory(
  data: WeeklyActivity,
  numPanels: number
): Promise<WeeklyStory> {
  if (!GEN_CONFIG.GPT_URL || !GEN_CONFIG.GPT_KEY) {
    // Fallback story
    const panels: WeeklyStoryPanel[] = [];
    const roles: ('intro' | 'build' | 'peak' | 'outro')[] = ['intro', 'build', 'peak', 'outro'];
    
    for (let i = 0; i < numPanels; i++) {
      const role = i === 0 ? 'intro' : i === numPanels - 1 ? 'outro' : i === Math.floor(numPanels / 2) ? 'peak' : 'build';
      panels.push({
        role,
        imageUrl: data.topImages[i % data.topImages.length]?.imageUrl || '',
        caption: 'A moment from this week',
        vibeTag: 'vibe',
        microStory: 'This week was full of moments.',
      });
    }

    return {
      title: 'My Week in Vibes',
      panels,
      outro: 'Next week\'s vibe forecast: more adventures await!',
    };
  }

  try {
    const systemPrompt = `You are a creative storyteller for Parel Stories.
Generate a fun, playful weekly recap story (3-6 panels) from user activity.
Keep captions under 10 words, vibe tags 1-2 words, micro stories 1 sentence.
Make it celebratory and fun!`;

    const topCategories = Object.entries(data.categoryDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, count]) => `${cat} (${count})`)
      .join(', ');

    const imageDescriptions = data.topImages.slice(0, numPanels).map((img, idx) => 
      `Panel ${idx + 1}: ${img.category} - ${img.caption || 'image'}`
    ).join('\n');

    const archetypeNote = data.archetypeChange
      ? `Archetype changed from ${data.archetypeChange.from} to ${data.archetypeChange.to}. Reason: ${data.archetypeChange.reason || 'activity shift'}.`
      : 'No archetype change this week.';

    const questNote = data.questHighlights.length > 0
      ? `Completed quests: ${data.questHighlights.slice(0, 3).join(', ')}.`
      : 'No quests completed this week.';

    const weirdNote = data.weirdMoments.length > 0
      ? `Weird moments: ${data.weirdMoments.slice(0, 2).join('; ')}.`
      : '';

    const userPrompt = `Generate a ${numPanels}-panel weekly recap story.

Week Summary: ${data.vibeSummary.substring(0, 200)}

Activity:
- Total ratings: ${data.totalRatings}
- Top categories: ${topCategories}
- Average score: ${data.avgScore}
${archetypeNote}
${questNote}
${weirdNote}

Available Images:
${imageDescriptions}

Generate:
1. Title (short, catchy, 2-5 words)
2. ${numPanels} panels with:
   - Role: intro (first), build (middle), peak (climax), outro (last)
   - Caption (under 10 words)
   - Vibe tag (1-2 words)
   - Micro story (1 sentence, fun/playful)
3. Outro line (1 sentence, future-looking)

Return JSON:
{
  "title": "...",
  "panels": [
    {
      "role": "intro|build|peak|outro",
      "imageUrl": "use from available images",
      "caption": "...",
      "vibeTag": "...",
      "microStory": "..."
    },
    ...
  ],
  "outro": "..."
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
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`GPT API error: ${response.status}`);
    }

    const responseData = await response.json();
    const content = responseData.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No content from AI');
    }

    // Parse JSON
    let parsed: any;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error('Failed to parse AI response as JSON');
    }

    // Map image URLs from available images
    const panels = parsed.panels.map((panel: any, index: number) => {
      const imageIndex = index % data.topImages.length;
      return {
        role: panel.role || (index === 0 ? 'intro' : index === numPanels - 1 ? 'outro' : index === Math.floor(numPanels / 2) ? 'peak' : 'build'),
        imageUrl: data.topImages[imageIndex]?.imageUrl || '',
        caption: panel.caption || 'A moment from this week',
        vibeTag: panel.vibeTag || 'vibe',
        microStory: panel.microStory || 'This week was full of moments.',
      };
    });

    return {
      title: parsed.title || 'My Week in Vibes',
      panels,
      outro: parsed.outro || 'Next week\'s vibe forecast: more adventures await!',
    };
  } catch (error) {
    logger.warn('[WeeklyStory] AI story generation failed, using fallback', { error });
    // Fallback
    const panels: WeeklyStoryPanel[] = [];
    const roles: ('intro' | 'build' | 'peak' | 'outro')[] = ['intro', 'build', 'peak', 'outro'];
    
    for (let i = 0; i < numPanels; i++) {
      const role = i === 0 ? 'intro' : i === numPanels - 1 ? 'outro' : i === Math.floor(numPanels / 2) ? 'peak' : 'build';
      panels.push({
        role,
        imageUrl: data.topImages[i % data.topImages.length]?.imageUrl || '',
        caption: 'A moment from this week',
        vibeTag: 'vibe',
        microStory: 'This week was full of moments.',
      });
    }

    return {
      title: 'My Week in Vibes',
      panels,
      outro: 'Next week\'s vibe forecast: more adventures await!',
    };
  }
}

