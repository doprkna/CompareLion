/**
 * AURE Assist Engine - AI Coach Service 2.0
 * Personalized Lifestyle Improvement Engine
 * v0.39.9 - Coach 2.0 (Adaptive + Premium-ready)
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { GEN_CONFIG } from '@parel/core/config/generator';
import { isPremiumUser } from '@/lib/rating/premiumCheck';

export type CoachType = 'snack' | 'desk' | 'outfit' | 'room' | 'generic';

export interface CoachAdvice {
  tips: string[];
  summary: string;
  focusAreas: string[];
}

export interface CoachAnalysis {
  strengths: string[];
  weaknesses: string[];
  recentTrend: 'up' | 'down' | 'flat';
  avgMetrics: Record<string, number>;
}

export interface CoachGoal {
  id: string;
  userId: string;
  coachType: CoachType;
  title: string;
  description: string;
  targetMetric: string;
  targetDelta: number;
  progress: number; // 0-100
  createdAt: Date;
  completedAt: Date | null;
}

export interface CoachSummary {
  id: string;
  userId: string;
  coachType: CoachType;
  weekOf: string; // ISO date string
  summaryText: string;
  createdAt: Date;
}

export interface CoachAnalysis {
  strengths: string[];
  weaknesses: string[];
  recentTrend: 'up' | 'down' | 'flat';
  avgMetrics: Record<string, number>;
}

export interface CoachGoal {
  id: string;
  userId: string;
  coachType: CoachType;
  title: string;
  description: string;
  targetMetric: string;
  targetDelta: number;
  progress: number; // 0-100
  createdAt: Date;
  completedAt: Date | null;
}

export interface CoachSummary {
  id: string;
  userId: string;
  coachType: CoachType;
  weekOf: string; // ISO date string
  summaryText: string;
  createdAt: Date;
}

/**
 * Generate coach advice for user
 * Premium-only feature
 */
export async function generateCoachAdvice(
  userId: string,
  coachType: CoachType
): Promise<CoachAdvice | { error: 'premium_required' }> {
  // Check premium status
  const isPremium = await isPremiumUser(userId);
  if (!isPremium) {
    return { error: 'premium_required' };
  }

  try {
    // Fetch recent rating results for the category
    const categoryFilter = coachType === 'generic' ? undefined : coachType;
    const limit = coachType === 'generic' ? 30 : 20;

    const ratingResults = await prisma.ratingResult.findMany({
      where: {
        request: {
          userId,
          ...(categoryFilter ? { category: categoryFilter } : {}),
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
      take: limit,
    });

    if (ratingResults.length === 0) {
      return {
        tips: [
          `Start rating ${coachType === 'generic' ? 'items' : coachType}s to get personalized advice!`,
        ],
        summary: `You haven't rated enough ${coachType === 'generic' ? 'items' : coachType}s yet. Start rating to get personalized coaching!`,
        focusAreas: [],
      };
    }

    // Compute patterns
    const allMetrics: Record<string, number[]> = {};
    const summaries: string[] = [];

    ratingResults.forEach((result) => {
      const metrics = result.metrics as Record<string, number>;
      Object.keys(metrics).forEach((metric) => {
        if (!allMetrics[metric]) {
          allMetrics[metric] = [];
        }
        allMetrics[metric].push(metrics[metric]);
      });
      summaries.push(result.summaryText);
    });

    // Calculate average scores per metric
    const avgMetrics: Record<string, number> = {};
    Object.keys(allMetrics).forEach((metric) => {
      const scores = allMetrics[metric];
      avgMetrics[metric] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    // Find weak and strong metrics
    const sortedMetrics = Object.entries(avgMetrics).sort((a, b) => a[1] - b[1]);
    const weakMetrics = sortedMetrics.slice(0, 2).map(([m]) => m);
    const strongMetrics = sortedMetrics.slice(-2).map(([m]) => m);

    // Build context for AI
    const topMetrics = Object.entries(avgMetrics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([metric, score]) => `${metric}: ${Math.round(score)}`)
      .join(', ');

    const sampleSummaries = summaries.slice(0, 5).join('\n\n');

    // Generate AI advice
    const advice = await callAIForCoachAdvice({
      coachType,
      topMetrics,
      weakMetrics: weakMetrics.join(', '),
      strongMetrics: strongMetrics.join(', '),
      sampleSummaries,
      totalRatings: ratingResults.length,
    });

    return advice;
  } catch (error) {
    logger.error('[AURE Assist] Failed to generate coach advice', { error, userId, coachType });
    return {
      tips: ['Unable to generate advice at this time.'],
      summary: 'Please try again later.',
      focusAreas: [],
    };
  }
}

/**
 * Call AI to generate coach advice
 */
async function callAIForCoachAdvice(context: {
  coachType: CoachType;
  topMetrics: string;
  weakMetrics: string;
  strongMetrics: string;
  sampleSummaries: string;
  totalRatings: number;
}): Promise<CoachAdvice> {
  // Check if AI is configured
  if (!GEN_CONFIG.GPT_URL || !GEN_CONFIG.GPT_KEY) {
    // Fallback advice
    return {
      tips: [
        `Focus on improving ${context.weakMetrics || 'your weak areas'}`,
        `Keep up the good work on ${context.strongMetrics || 'your strengths'}`,
        'Continue exploring and rating to refine your taste',
      ],
      summary: `Based on your ${context.totalRatings} ratings, you're doing well! Keep exploring.`,
      focusAreas: context.weakMetrics ? context.weakMetrics.split(', ') : [],
    };
  }

  try {
    const coachPrompts: Record<CoachType, string> = {
      snack: 'Give advice about healthier snack choices, variety, and nutrition.',
      desk: 'Give advice about productivity, ergonomics, and workspace organization.',
      outfit: 'Give advice about style, coherence, and fashion choices.',
      room: 'Give advice about comfort, decluttering, and room organization.',
      generic: 'Give overall lifestyle and taste improvement advice.',
    };

    const systemPrompt = `You are a personal coach for AURE (AI Universal Rating Engine).
Provide specific, practical advice based on user's rating patterns.
Give 3-5 actionable tips, a short summary, and focus areas.
Be encouraging and constructive.`;

    const userPrompt = `Coach Type: ${context.coachType}
${coachPrompts[context.coachType]}

User's Rating Patterns:
- Total ratings: ${context.totalRatings}
- Top metrics: ${context.topMetrics}
- Weak areas: ${context.weakMetrics}
- Strong areas: ${context.strongMetrics}

Sample summaries:
${context.sampleSummaries.substring(0, 1000)}${context.sampleSummaries.length > 1000 ? '...' : ''}

Generate 3-5 specific, practical suggestions to improve this area.

Return JSON:
{
  "tips": ["...", "...", "..."],
  "summary": "Short overall message",
  "focusAreas": ["area1", "area2"]
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

    // Parse JSON (may be wrapped in markdown)
    let parsed: any;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate structure
    if (!parsed.tips || !Array.isArray(parsed.tips) || !parsed.summary) {
      throw new Error('Invalid coach advice structure');
    }

    return {
      tips: parsed.tips.slice(0, 5), // Max 5 tips
      summary: parsed.summary,
      focusAreas: parsed.focusAreas || [],
    };
  } catch (error) {
    logger.warn('[AURE Assist] AI coach advice generation failed, using fallback', { error });
    return {
      tips: [
        `Focus on improving ${context.weakMetrics || 'your weak areas'}`,
        `Keep up the good work on ${context.strongMetrics || 'your strengths'}`,
        'Continue exploring and rating to refine your taste',
      ],
      summary: `Based on your ${context.totalRatings} ratings, you're doing well! Keep exploring.`,
      focusAreas: context.weakMetrics ? context.weakMetrics.split(', ') : [],
    };
  }
}

/**
 * Analyze user for coach (Coach 2.0)
 * Returns strengths, weaknesses, and recent trend
 */
export async function analyzeUserForCoach(
  userId: string,
  coachType: CoachType
): Promise<CoachAnalysis | { error: 'premium_required' }> {
  // Check premium status
  const isPremium = await isPremiumUser(userId);
  if (!isPremium) {
    return { error: 'premium_required' };
  }

  try {
    const categoryFilter = coachType === 'generic' ? undefined : coachType;
    const limit = coachType === 'generic' ? 30 : 20;

    const ratingResults = await prisma.ratingResult.findMany({
      where: {
        request: {
          userId,
          ...(categoryFilter ? { category: categoryFilter } : {}),
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
      take: limit,
    });

    if (ratingResults.length === 0) {
      return {
        strengths: [],
        weaknesses: [],
        recentTrend: 'flat',
        avgMetrics: {},
      };
    }

    // Compute average metrics
    const allMetrics: Record<string, number[]> = {};
    ratingResults.forEach((result) => {
      const metrics = result.metrics as Record<string, number>;
      Object.keys(metrics).forEach((metric) => {
        if (!allMetrics[metric]) {
          allMetrics[metric] = [];
        }
        allMetrics[metric].push(metrics[metric]);
      });
    });

    const avgMetrics: Record<string, number> = {};
    Object.keys(allMetrics).forEach((metric) => {
      const scores = allMetrics[metric];
      avgMetrics[metric] = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    });

    // Find strengths (top 3 metrics)
    const sortedMetrics = Object.entries(avgMetrics).sort((a, b) => b[1] - a[1]);
    const strengths = sortedMetrics.slice(0, 3).map(([metric]) => metric);
    const weaknesses = sortedMetrics.slice(-3).map(([metric]) => metric);

    // Calculate trend (compare first half vs second half)
    const midPoint = Math.floor(ratingResults.length / 2);
    const recentHalf = ratingResults.slice(0, midPoint);
    const olderHalf = ratingResults.slice(midPoint);

    let recentAvg = 0;
    let olderAvg = 0;

    if (recentHalf.length > 0) {
      recentHalf.forEach((r) => {
        const metrics = r.metrics as Record<string, number>;
        const values = Object.values(metrics);
        if (values.length > 0) {
          recentAvg += values.reduce((a, b) => a + b, 0) / values.length;
        }
      });
      recentAvg = recentAvg / recentHalf.length;
    }

    if (olderHalf.length > 0) {
      olderHalf.forEach((r) => {
        const metrics = r.metrics as Record<string, number>;
        const values = Object.values(metrics);
        if (values.length > 0) {
          olderAvg += values.reduce((a, b) => a + b, 0) / values.length;
        }
      });
      olderAvg = olderAvg / olderHalf.length;
    }

    const trend: 'up' | 'down' | 'flat' =
      recentAvg > olderAvg + 2 ? 'up' : recentAvg < olderAvg - 2 ? 'down' : 'flat';

    return {
      strengths,
      weaknesses,
      recentTrend: trend,
      avgMetrics,
    };
  } catch (error) {
    logger.error('[AURE Assist] Failed to analyze user for coach', { error, userId, coachType });
    return {
      strengths: [],
      weaknesses: [],
      recentTrend: 'flat',
      avgMetrics: {},
    };
  }
}

/**
 * Generate coach goals (Coach 2.0)
 * AI generates 2-4 improvement goals
 * Note: Requires CoachGoal Prisma table for persistence (currently returns in-memory goals)
 */
export async function generateCoachGoals(
  userId: string,
  coachType: CoachType
): Promise<CoachGoal[] | { error: 'premium_required' }> {
  // Check premium status
  const isPremium = await isPremiumUser(userId);
  if (!isPremium) {
    return { error: 'premium_required' };
  }

  try {
    // Get analysis first
    const analysis = await analyzeUserForCoach(userId, coachType);
    if ('error' in analysis) {
      return analysis;
    }

    // Generate goals via AI
    const goals = await callAIForCoachGoals(userId, coachType, analysis);

    // TODO: If CoachGoal Prisma table exists, save goals here
    // For now, return in-memory goals
    return goals;
  } catch (error) {
    logger.error('[AURE Assist] Failed to generate coach goals', { error, userId, coachType });
    return [];
  }
}

/**
 * Call AI to generate coach goals
 */
async function callAIForCoachGoals(
  userId: string,
  coachType: CoachType,
  analysis: CoachAnalysis
): Promise<CoachGoal[]> {
  if (!GEN_CONFIG.GPT_URL || !GEN_CONFIG.GPT_KEY) {
    // Fallback goals
    return analysis.weaknesses.slice(0, 3).map((weakness, idx) => ({
      id: `goal-${userId}-${coachType}-${idx}`,
      userId,
      coachType,
      title: `Improve ${weakness}`,
      description: `Focus on improving your ${weakness} score`,
      targetMetric: weakness,
      targetDelta: 10,
      progress: 0,
      createdAt: new Date(),
      completedAt: null,
    }));
  }

  try {
    const coachPrompts: Record<CoachType, string> = {
      snack: 'snack choices, nutrition, and variety',
      desk: 'desk organization, productivity, and ergonomics',
      outfit: 'style, coherence, and fashion choices',
      room: 'room comfort, decluttering, and organization',
      generic: 'overall lifestyle and taste improvement',
    };

    const systemPrompt = `You are a personal coach for AURE (AI Universal Rating Engine).
Generate 2-4 specific, actionable improvement goals based on user's rating patterns.
Each goal should have a clear target metric and improvement delta.
Be encouraging and realistic.`;

    const userPrompt = `Coach Type: ${coachType}
Focus Area: ${coachPrompts[coachType]}

User's Analysis:
- Strengths: ${analysis.strengths.join(', ')}
- Weaknesses: ${analysis.weaknesses.join(', ')}
- Recent Trend: ${analysis.recentTrend}
- Average Metrics: ${Object.entries(analysis.avgMetrics)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ')}

Generate 2-4 improvement goals. Each goal should:
- Have a clear title (e.g., "Improve snack visual appeal by +10 points")
- Target a specific metric from weaknesses
- Have a realistic targetDelta (5-15 points)
- Be achievable within a week

Return JSON array:
[
  {
    "title": "Goal title",
    "description": "Goal description",
    "targetMetric": "metricName",
    "targetDelta": 10
  },
  ...
]`;

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

    // Parse JSON
    let parsed: any[];
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!Array.isArray(parsed)) {
      throw new Error('Invalid goals structure');
    }

    // Convert to CoachGoal format
    return parsed.slice(0, 4).map((goal, idx) => ({
      id: `goal-${userId}-${coachType}-${Date.now()}-${idx}`,
      userId,
      coachType,
      title: goal.title || `Goal ${idx + 1}`,
      description: goal.description || '',
      targetMetric: goal.targetMetric || analysis.weaknesses[0] || 'overall',
      targetDelta: typeof goal.targetDelta === 'number' ? goal.targetDelta : 10,
      progress: 0,
      createdAt: new Date(),
      completedAt: null,
    }));
  } catch (error) {
    logger.warn('[AURE Assist] AI goal generation failed, using fallback', { error });
    return analysis.weaknesses.slice(0, 3).map((weakness, idx) => ({
      id: `goal-${userId}-${coachType}-${idx}`,
      userId,
      coachType,
      title: `Improve ${weakness}`,
      description: `Focus on improving your ${weakness} score`,
      targetMetric: weakness,
      targetDelta: 10,
      progress: 0,
      createdAt: new Date(),
      completedAt: null,
    }));
  }
}

/**
 * Update goal progress (Coach 2.0)
 * Compares new AURE results vs target metrics
 * Note: Requires CoachGoal Prisma table for persistence
 */
export async function updateGoalProgress(
  userId: string,
  coachType: CoachType
): Promise<{ updated: number } | { error: 'premium_required' }> {
  // Check premium status
  const isPremium = await isPremiumUser(userId);
  if (!isPremium) {
    return { error: 'premium_required' };
  }

  try {
    // TODO: Fetch active goals from CoachGoal table
    // Compare new ratings vs target metrics
    // Update progress (0-100)
    // Mark as completed if progress >= 100
    logger.info('[AURE Assist] Goal progress update called', { userId, coachType });
    return { updated: 0 };
  } catch (error) {
    logger.error('[AURE Assist] Failed to update goal progress', { error, userId, coachType });
    return { updated: 0 };
  }
}

/**
 * Generate weekly coach summary (Coach 2.0)
 * Produces AI summary of goals + progress
 * Note: Requires CoachGoal and CoachSummary Prisma tables for persistence
 */
export async function generateCoachSummary(
  userId: string,
  coachType: CoachType
): Promise<CoachSummary | { error: 'premium_required' }> {
  // Check premium status
  const isPremium = await isPremiumUser(userId);
  if (!isPremium) {
    return { error: 'premium_required' };
  }

  try {
    // Get current week start (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysFromMonday);
    weekStart.setHours(0, 0, 0, 0);

    // TODO: Fetch goals and progress from CoachGoal table
    // For now, generate summary from analysis
    const analysis = await analyzeUserForCoach(userId, coachType);
    if ('error' in analysis) {
      return analysis;
    }

    const summaryText = await callAIForCoachSummary(coachType, analysis);

    return {
      id: `summary-${userId}-${coachType}-${weekStart.toISOString()}`,
      userId,
      coachType,
      weekOf: weekStart.toISOString(),
      summaryText,
      createdAt: new Date(),
    };
  } catch (error) {
    logger.error('[AURE Assist] Failed to generate coach summary', { error, userId, coachType });
    return {
      id: `summary-${userId}-${coachType}-${Date.now()}`,
      userId,
      coachType,
      weekOf: new Date().toISOString(),
      summaryText: 'Unable to generate summary at this time.',
      createdAt: new Date(),
    };
  }
}

/**
 * Call AI to generate coach summary
 */
async function callAIForCoachSummary(coachType: CoachType, analysis: CoachAnalysis): Promise<string> {
  if (!GEN_CONFIG.GPT_URL || !GEN_CONFIG.GPT_KEY) {
    return `This week, you showed ${analysis.recentTrend === 'up' ? 'improvement' : analysis.recentTrend === 'down' ? 'some decline' : 'consistent performance'} in your ${coachType} ratings. Keep up the good work!`;
  }

  try {
    const systemPrompt = `You are a personal coach for AURE (AI Universal Rating Engine).
Generate a short, encouraging weekly summary (2-3 sentences) based on user's rating patterns.
Be positive and constructive.`;

    const userPrompt = `Coach Type: ${coachType}

User's Weekly Analysis:
- Strengths: ${analysis.strengths.join(', ')}
- Weaknesses: ${analysis.weaknesses.join(', ')}
- Recent Trend: ${analysis.recentTrend}

Generate a short weekly summary (2-3 sentences) covering:
- What improved (if trend is up)
- What needs attention (if trend is down)
- What to try next week`;

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
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`GPT API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    return content || `This week, you showed ${analysis.recentTrend === 'up' ? 'improvement' : analysis.recentTrend === 'down' ? 'some decline' : 'consistent performance'} in your ${coachType} ratings.`;
  } catch (error) {
    logger.warn('[AURE Assist] AI summary generation failed, using fallback', { error });
    return `This week, you showed ${analysis.recentTrend === 'up' ? 'improvement' : analysis.recentTrend === 'down' ? 'some decline' : 'consistent performance'} in your ${coachType} ratings. Keep up the good work!`;
  }
}

