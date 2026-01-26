/**
 * AURE Life Engine - Archetype Service 2.0
 * Identity system for user archetypes with catalog-based assignment
 * v0.39.5 - Archetype Engine 2.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { GEN_CONFIG } from '@parel/core/config/generator';
import { getTimelineForArchetype } from './timelineService';
import { ARCHETYPE_CATALOG, getArchetypeById, getAllArchetypeIds } from './archetypes';

export interface UserArchetype {
  userId: string;
  archetypeId: string;
  confidence: number;
  description: string | null;
  updatedAt: Date;
  previousArchetypeId?: string | null;
  changeReason?: string | null;
}

export interface NearbyArchetype {
  archetypeId: string;
  label: string;
  emoji: string;
  similarity: number;
}

/**
 * Recalculate user archetype based on activity
 * Uses catalog-based assignment with AI refinement
 */
export async function recalculateUserArchetype(userId: string): Promise<UserArchetype> {
  try {
    // Fetch last 30-60 timeline events
    const timelineEvents = await getTimelineForArchetype(userId, 60);

    // Fetch recent rating results
    const ratingResults = await prisma.ratingResult.findMany({
      where: {
        request: {
          userId,
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
      take: 30,
    });

    // Extract patterns
    const categoryDistribution: Record<string, number> = {};
    const avgScores: Record<string, number[]> = {};
    const scoreVariations: number[] = [];
    let totalRatings = 0;

    ratingResults.forEach((result) => {
      const category = result.request.category;
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
      totalRatings++;

      const metrics = result.metrics as Record<string, number>;
      const metricValues = Object.values(metrics);
      if (metricValues.length > 0) {
        const avg = metricValues.reduce((a, b) => a + b, 0) / metricValues.length;
        scoreVariations.push(avg);
        Object.keys(metrics).forEach((metric) => {
          if (!avgScores[metric]) {
            avgScores[metric] = [];
          }
          avgScores[metric].push(metrics[metric]);
        });
      }
    });

    // Calculate average scores per metric
    const avgMetrics: Record<string, number> = {};
    Object.keys(avgScores).forEach((metric) => {
      const scores = avgScores[metric];
      avgMetrics[metric] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    // Calculate chaos signal (variation in scores)
    const avgScore = scoreVariations.length > 0
      ? scoreVariations.reduce((a, b) => a + b, 0) / scoreVariations.length
      : 0;
    const scoreVariance = scoreVariations.length > 0
      ? scoreVariations.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scoreVariations.length
      : 0;
    const chaosSignal = Math.sqrt(scoreVariance) > 15 ? 'high' : 'low';

    // Initial heuristic scoring against catalog
    const archetypeScores: Record<string, number> = {};
    ARCHETYPE_CATALOG.forEach((archetype) => {
      let score = 0;

      // Category match
      const topCategories = Object.entries(categoryDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat]) => cat);
      
      const categoryMatches = archetype.typicalCategories.filter((cat) =>
        topCategories.includes(cat)
      ).length;
      score += categoryMatches * 20;

      // Trait matching (simplified)
      if (chaosSignal === 'high' && archetype.primaryTraits.includes('chaotic')) {
        score += 15;
      }
      if (chaosSignal === 'low' && archetype.primaryTraits.includes('organized')) {
        score += 15;
      }

      // Category focus bonus
      if (archetype.id === 'snack-wizard' && categoryDistribution['snack'] > totalRatings * 0.5) {
        score += 25;
      }

      archetypeScores[archetype.id] = score;
    });

    // Get top candidates
    const topCandidates = Object.entries(archetypeScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    // Build context for AI refinement
    const topCategories = Object.entries(categoryDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, count]) => `${cat} (${count})`)
      .join(', ');

    const topMetrics = Object.entries(avgMetrics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([metric, score]) => `${metric}: ${Math.round(score)}`)
      .join(', ');

    const eventTypes = timelineEvents.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventSummary = Object.entries(eventTypes)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ');

    // Call AI to refine archetype selection
    const archetypeResult = await callAIForArchetypeRefinement({
      totalRatings,
      topCategories,
      topMetrics,
      eventSummary,
      topCandidates,
      chaosSignal,
      catalogIds: getAllArchetypeIds(),
    });

    // Get current archetype
    const currentArchetype = await prisma.userArchetype.findUnique({
      where: { userId },
    });

    const previousArchetypeId = currentArchetype?.archetypeId || null;
    const changed = previousArchetypeId !== archetypeResult.archetypeId;

    // Generate change reason if changed
    let changeReason: string | null = null;
    if (changed && previousArchetypeId) {
      changeReason = await generateChangeReason(
        previousArchetypeId,
        archetypeResult.archetypeId,
        categoryDistribution
      );
    }

    // Update archetype
    const updatedArchetype = await upsertUserArchetype(userId, {
      archetypeId: archetypeResult.archetypeId,
      confidence: archetypeResult.confidence,
      description: archetypeResult.description,
      previousArchetypeId: changed ? previousArchetypeId : undefined,
      changeReason: changed ? changeReason : undefined,
    });

    logger.info('[AURE Life] Archetype recalculated', {
      userId,
      archetypeId: updatedArchetype.archetypeId,
      confidence: updatedArchetype.confidence,
      changed,
    });

    return updatedArchetype;
  } catch (error: any) {
    logger.error('[AURE Life] Failed to recalculate archetype', { error, userId });
    
    // Return default archetype on error
    return {
      userId,
      archetypeId: 'adventurer',
      confidence: 0,
      description: 'Your archetype is being analyzed...',
      updatedAt: new Date(),
    };
  }
}

/**
 * Call AI to refine archetype selection from catalog
 */
async function callAIForArchetypeRefinement(context: {
  totalRatings: number;
  topCategories: string;
  topMetrics: string;
  eventSummary: string;
  topCandidates: string[];
  chaosSignal: string;
  catalogIds: string[];
}): Promise<{
  archetypeId: string;
  confidence: number;
  description: string;
}> {
  // Check if AI is configured
  if (!GEN_CONFIG.GPT_URL || !GEN_CONFIG.GPT_KEY) {
    // Fallback to top candidate
    const fallbackId = context.topCandidates[0] || 'adventurer';
    const fallbackArchetype = getArchetypeById(fallbackId);
    return {
      archetypeId: fallbackId,
      confidence: 50,
      description: fallbackArchetype?.shortDescription || 'A balanced explorer of taste and style.',
    };
  }

  try {
    const systemPrompt = `You are an archetype assigner for AURE (AI Universal Rating Engine).
You MUST pick ONE archetype ID from this exact catalog: ${context.catalogIds.join(', ')}.
Return ONLY valid JSON with archetypeId (must match catalog), confidence (0-100), and description (1-2 sentences).
Never invent new archetype IDs - only use the provided catalog.`;

    const userPrompt = `User activity:
- Total ratings: ${context.totalRatings}
- Top categories: ${context.topCategories}
- Top metrics: ${context.topMetrics}
- Event types: ${context.eventSummary}
- Chaos signal: ${context.chaosSignal}
- Top candidates: ${context.topCandidates.join(', ')}

Available archetypes: ${context.catalogIds.join(', ')}

Pick the BEST archetype ID from the catalog that matches this user's patterns.
Return JSON:
{
  "archetypeId": "cozy-gremlin",
  "confidence": 75,
  "description": "You gravitate toward warm, comfortable aesthetics with a playful edge."
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
        max_tokens: 200,
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

    // Validate archetype ID is in catalog
    if (!context.catalogIds.includes(parsed.archetypeId)) {
      logger.warn('[AURE Life] AI returned invalid archetype ID, using fallback', {
        returned: parsed.archetypeId,
        catalog: context.catalogIds,
      });
      const fallbackId = context.topCandidates[0] || 'adventurer';
      const fallbackArchetype = getArchetypeById(fallbackId);
      return {
        archetypeId: fallbackId,
        confidence: 50,
        description: fallbackArchetype?.shortDescription || 'A balanced explorer of taste and style.',
      };
    }

    return {
      archetypeId: parsed.archetypeId.toLowerCase().replace(/\s+/g, '-'),
      confidence: Math.max(0, Math.min(100, parsed.confidence)),
      description: parsed.description || 'Your unique taste profile.',
    };
  } catch (error) {
    logger.warn('[AURE Life] AI archetype refinement failed, using fallback', { error });
    const fallbackId = context.topCandidates[0] || 'adventurer';
    const fallbackArchetype = getArchetypeById(fallbackId);
    return {
      archetypeId: fallbackId,
      confidence: 50,
      description: fallbackArchetype?.shortDescription || 'A balanced explorer of taste and style.',
    };
  }
}

/**
 * Generate change reason when archetype changes
 */
async function generateChangeReason(
  previousId: string,
  newId: string,
  categoryDistribution: Record<string, number>
): Promise<string> {
  const previousArchetype = getArchetypeById(previousId);
  const newArchetype = getArchetypeById(newId);

  if (!previousArchetype || !newArchetype) {
    return `Evolved from ${previousId} to ${newId}`;
  }

  // Simple heuristic-based reason
  const topCategory = Object.entries(categoryDistribution)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  if (topCategory && newArchetype.typicalCategories.includes(topCategory)) {
    return `Shifted focus to ${topCategory} category`;
  }

  return `Evolved from ${previousArchetype.label} to ${newArchetype.label}`;
}

/**
 * Get user archetype (or detect if missing)
 */
export async function getUserArchetype(userId: string): Promise<UserArchetype | null> {
  try {
    const archetype = await prisma.userArchetype.findUnique({
      where: { userId },
    });

    if (archetype) {
      return {
        userId: archetype.userId,
        archetypeId: archetype.archetypeId,
        confidence: archetype.confidence,
        description: archetype.description,
        updatedAt: archetype.updatedAt,
        previousArchetypeId: (archetype as any).previousArchetypeId || null,
        changeReason: (archetype as any).changeReason || null,
      };
    }

    // If no archetype exists, calculate one
    return await recalculateUserArchetype(userId);
  } catch (error: any) {
    // If model doesn't exist yet, return null
    if (error.message?.includes('model') || error.message?.includes('UserArchetype')) {
      logger.warn('[AURE Life] UserArchetype model not found - Prisma migration required');
      return null;
    }
    logger.error('[AURE Life] Failed to get user archetype', { error, userId });
    throw error;
  }
}

/**
 * Get nearby archetypes (similar archetypes that could fit)
 */
export async function getNearbyArchetypes(userId: string): Promise<NearbyArchetype[]> {
  try {
    const userArchetype = await getUserArchetype(userId);
    if (!userArchetype) {
      return [];
    }

    const currentArchetype = getArchetypeById(userArchetype.archetypeId);
    if (!currentArchetype) {
      return [];
    }

    // Find similar archetypes based on shared traits/categories
    const nearby: NearbyArchetype[] = [];
    
    ARCHETYPE_CATALOG.forEach((archetype) => {
      if (archetype.id === userArchetype.archetypeId) return;

      let similarity = 0;

      // Shared traits
      const sharedTraits = currentArchetype.primaryTraits.filter((trait) =>
        archetype.primaryTraits.includes(trait)
      ).length;
      similarity += sharedTraits * 20;

      // Shared categories
      const sharedCategories = currentArchetype.typicalCategories.filter((cat) =>
        archetype.typicalCategories.includes(cat)
      ).length;
      similarity += sharedCategories * 15;

      if (similarity > 0) {
        nearby.push({
          archetypeId: archetype.id,
          label: archetype.label,
          emoji: archetype.emoji,
          similarity,
        });
      }
    });

    // Sort by similarity and return top 2-3
    return nearby
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
  } catch (error) {
    logger.error('[AURE Life] Failed to get nearby archetypes', { error, userId });
    return [];
  }
}

/**
 * Upsert user archetype
 */
async function upsertUserArchetype(
  userId: string,
  data: {
    archetypeId: string;
    confidence: number;
    description: string | null;
    previousArchetypeId?: string | null;
    changeReason?: string | null;
  }
): Promise<UserArchetype> {
  try {
    const archetype = await prisma.userArchetype.upsert({
      where: { userId },
      create: {
        userId,
        archetypeId: data.archetypeId,
        confidence: data.confidence,
        description: data.description,
        ...(data.previousArchetypeId && { previousArchetypeId: data.previousArchetypeId }),
        ...(data.changeReason && { changeReason: data.changeReason }),
      },
      update: {
        archetypeId: data.archetypeId,
        confidence: data.confidence,
        description: data.description,
        updatedAt: new Date(),
        ...(data.previousArchetypeId && { previousArchetypeId: data.previousArchetypeId }),
        ...(data.changeReason && { changeReason: data.changeReason }),
      },
    });

    return {
      userId: archetype.userId,
      archetypeId: archetype.archetypeId,
      confidence: archetype.confidence,
      description: archetype.description,
      updatedAt: archetype.updatedAt,
      previousArchetypeId: (archetype as any).previousArchetypeId || null,
      changeReason: (archetype as any).changeReason || null,
    };
  } catch (error: any) {
    // If model doesn't exist yet, return placeholder
    if (error.message?.includes('model') || error.message?.includes('UserArchetype')) {
      logger.warn('[AURE Life] UserArchetype model not found - Prisma migration required');
      return {
        userId,
        archetypeId: data.archetypeId,
        confidence: data.confidence,
        description: data.description,
        updatedAt: new Date(),
        previousArchetypeId: data.previousArchetypeId || null,
        changeReason: data.changeReason || null,
      };
    }
    throw error;
  }
}

// Legacy function for backwards compatibility
export async function detectUserArchetype(userId: string): Promise<UserArchetype> {
  return recalculateUserArchetype(userId);
}
