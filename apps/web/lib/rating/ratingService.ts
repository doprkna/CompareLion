/**
 * AI Universal Rating Service
 * Generate ratings for user-submitted content
 * v0.38.1 - AI Universal Rating Engine
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getCategoryPreset, buildPromptFromPreset } from './presets';
import { GEN_CONFIG } from '@parel/core/config/generator';
import { applyAdaptiveTemplate } from './adaptiveTemplate';

export interface RatingMetrics {
  [key: string]: number; // e.g. { "creativity": 75, "visualAppeal": 62 }
}

export interface RatingResult {
  metrics: RatingMetrics;
  summaryText: string;
  roastText: string;
}

/**
 * Generate universal rating for a request
 * Stub implementation - returns placeholder ratings for now
 * 
 * @param requestId - Rating request ID
 * @returns Rating result with metrics, summary, and roast
 */
export async function generateUniversalRating(requestId: string): Promise<RatingResult> {
  try {
    // Fetch request
    const request = await prisma.ratingRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Rating request not found');
    }

    // Get category preset (supports built-in presets and user templates)
    const preset = await getCategoryPreset(request.category);
    if (!preset) {
      throw new Error(`Unknown category or template: ${request.category}`);
    }

    // Apply adaptive template rules
    const entryData = {
      imageUrl: request.imageUrl,
      text: request.text,
      category: request.category,
    };
    const adaptiveContext = applyAdaptiveTemplate(entryData, preset);

    // Build prompt with adaptive hints
    const basePrompt = buildPromptFromPreset(preset);
    const adaptivePrompt = adaptiveContext.hints.length > 0
      ? buildPromptFromPreset(preset, undefined, adaptiveContext.hints)
      : basePrompt;

    // TODO: Implement actual AI call with adaptivePrompt
    // For now, return placeholder ratings based on category
    // Future: Call AI API with image URL + text + adaptive prompt
    
    const metrics: RatingMetrics = {};
    preset.metrics.forEach((metric) => {
      // Generate random score between 40-95 for placeholder
      metrics[metric.id] = Math.floor(Math.random() * 55) + 40;
    });

    const placeholderSummaries: Record<string, string[]> = {
      snack: [
        'This snack has a nice balance of flavors and presentation.',
        'A creative take on snacking with good visual appeal.',
        'Looks delicious and well-prepared!',
      ],
      outfit: [
        'This outfit shows great style and coordination.',
        'A confident look with good color coordination.',
        'Nice combination of pieces that work well together.',
      ],
      car: [
        'This car has great style and presence.',
        'A cool ride with good aesthetics.',
        'Nice design with unique character.',
      ],
      room: [
        'This room has a cozy and well-organized feel.',
        'Great aesthetics with a welcoming atmosphere.',
        'A creative space with good organization.',
      ],
      gift: [
        'A thoughtful and well-presented gift idea.',
        'Creative and unique gift with good presentation.',
        'Shows thoughtfulness and attention to detail.',
      ],
      pet: [
        'An adorable pet with lots of personality!',
        'Very photogenic and cute companion.',
        'A unique pet with great character.',
      ],
    };

    const placeholderRoasts: Record<string, string[]> = {
      snack: [
        'This snack is so good, it should be illegal! 🍪',
        'My taste buds are having a party! 🎉',
        'This is snack perfection! ✨',
      ],
      outfit: [
        'You look absolutely fire! 🔥',
        'This outfit is giving main character energy! 👑',
        'Style goals achieved! 💯',
      ],
      car: [
        'This car is absolutely stunning! 🚗',
        'Ride goals achieved! ✨',
        'This is car perfection! 🏆',
      ],
      room: [
        'This room is giving cozy vibes! 🏠',
        'I want to move in immediately! ✨',
        'Interior design goals right here! 🎨',
      ],
      gift: [
        'Someone is going to love this! 💝',
        'Gift-giving level: expert! 🎁',
        'This is thoughtful perfection! ✨',
      ],
      pet: [
        'Too cute to handle! 🐾',
        'This pet is illegally adorable! 🥺',
        'Cutest pet award goes to... 🏆',
      ],
    };

    const summaries = placeholderSummaries[request.category] || ['Looks great!'];
    const roasts = placeholderRoasts[request.category] || ['Nice!'];

    const summaryText = summaries[Math.floor(Math.random() * summaries.length)];
    const roastText = roasts[Math.floor(Math.random() * roasts.length)];

    return {
      metrics,
      summaryText,
      roastText,
    };
  } catch (error) {
    logger.error('[RatingService] Failed to generate rating', { requestId, error });
    throw error;
  }
}

/**
 * Create rating request
 * 
 * @param userId - User ID
 * @param category - Category preset name
 * @param imageUrl - Optional image URL
 * @param text - Optional text content
 * @returns Created rating request
 */
export async function createRatingRequest(
  userId: string,
  category: string,
  imageUrl?: string,
  text?: string
): Promise<{ id: string }> {
  try {
    // Validate category (supports built-in presets and user templates)
    const preset = await getCategoryPreset(category);
    if (!preset) {
      throw new Error(`Unknown category or template: ${category}`);
    }

    // Determine input type
    let inputType: 'image' | 'text' | 'hybrid' = 'text';
    if (imageUrl && text) {
      inputType = 'hybrid';
    } else if (imageUrl) {
      inputType = 'image';
    } else if (!text) {
      throw new Error('Either imageUrl or text must be provided');
    }

    // Create request
    const request = await prisma.ratingRequest.create({
      data: {
        userId,
        inputType,
        imageUrl: imageUrl || null,
        text: text || null,
        category,
      },
    });

    return { id: request.id };
  } catch (error) {
    logger.error('[RatingService] Failed to create rating request', {
      userId,
      category,
      error,
    });
    throw error;
  }
}

/**
 * Get rating result for a request
 * Generates rating if not already created
 * 
 * @param requestId - Rating request ID
 * @returns Rating result
 */
export async function getRatingResult(requestId: string): Promise<RatingResult> {
  try {
    // Check if result already exists
    const existing = await prisma.ratingResult.findUnique({
      where: { requestId },
    });

    if (existing) {
      return {
        metrics: existing.metrics as RatingMetrics,
        summaryText: existing.summaryText,
        roastText: existing.roastText,
      };
    }

    // Generate new rating
    const result = await generateUniversalRating(requestId);

    // Save result
    await prisma.ratingResult.create({
      data: {
        requestId,
        metrics: result.metrics,
        summaryText: result.summaryText,
        roastText: result.roastText,
      },
    });

    return result;
  } catch (error) {
    logger.error('[RatingService] Failed to get rating result', { requestId, error });
    throw error;
  }
}

export interface ComparisonData {
  userScore: RatingMetrics;
  avgScore: RatingMetrics;
  percentiles: RatingMetrics;
  topEntries: Array<{
    requestId: string;
    imageUrl: string | null;
    metrics: RatingMetrics;
    totalScore: number;
  }>;
}

/**
 * Get comparison data for a rating result
 * Compares user's item to category average, percentiles, and top entries
 * 
 * @param requestId - Rating request ID
 * @returns Comparison data with user score, averages, percentiles, and top 3 entries
 */
export async function getComparisonData(requestId: string): Promise<ComparisonData> {
  try {
    // Get user's rating result and request
    const userResult = await prisma.ratingResult.findUnique({
      where: { requestId },
      include: {
        request: {
          select: {
            category: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!userResult) {
      throw new Error('Rating result not found');
    }

    const userMetrics = userResult.metrics as RatingMetrics;
    const category = userResult.request.category;

    // Get all rating results in the same category
    const categoryResults = await prisma.ratingResult.findMany({
      where: {
        request: {
          category,
        },
      },
      include: {
        request: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
      },
    });

    if (categoryResults.length === 0) {
      throw new Error('No results found in category');
    }

    // Collect all metric keys from all results
    const allMetricKeys = new Set<string>();
    categoryResults.forEach((result) => {
      const metrics = result.metrics as RatingMetrics;
      Object.keys(metrics).forEach((key) => allMetricKeys.add(key));
    });

    // Compute averages per metric
    const avgScore: RatingMetrics = {};
    allMetricKeys.forEach((metricKey) => {
      let sum = 0;
      let count = 0;
      categoryResults.forEach((result) => {
        const metrics = result.metrics as RatingMetrics;
        if (typeof metrics[metricKey] === 'number') {
          sum += metrics[metricKey];
          count++;
        }
      });
      avgScore[metricKey] = count > 0 ? Math.round((sum / count) * 100) / 100 : 0;
    });

    // Compute percentiles (simple rank / total)
    const percentiles: RatingMetrics = {};
    allMetricKeys.forEach((metricKey) => {
      const userValue = userMetrics[metricKey] || 0;
      let rank = 0;
      categoryResults.forEach((result) => {
        const metrics = result.metrics as RatingMetrics;
        const value = metrics[metricKey] || 0;
        if (value < userValue) {
          rank++;
        }
      });
      // Percentile = (rank / total) * 100
      percentiles[metricKey] = Math.round((rank / categoryResults.length) * 100);
    });

    // Get top 3 entries by total score (sum of all metrics)
    const entriesWithScores = categoryResults.map((result) => {
      const metrics = result.metrics as RatingMetrics;
      const totalScore = Object.values(metrics).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
      return {
        requestId: result.requestId,
        imageUrl: result.request.imageUrl,
        metrics,
        totalScore,
      };
    });

    // Sort by total score descending and take top 3
    const topEntries = entriesWithScores
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 3);

    return {
      userScore: userMetrics,
      avgScore,
      percentiles,
      topEntries,
    };
  } catch (error) {
    logger.error('[RatingService] Failed to get comparison data', { requestId, error });
    throw error;
  }
}

export interface FlavorText {
  compliment: string;
  roast: string;
  neutral?: string;
}

/**
 * Generate flavor text (compliment + roast) for a rating result
 * Uses AI if available, falls back to placeholder text
 * 
 * @param requestId - Rating request ID
 * @returns Flavor text with compliment and roast
 */
export async function generateFlavorText(requestId: string): Promise<FlavorText> {
  try {
    // Get rating result and request
    const result = await prisma.ratingResult.findUnique({
      where: { requestId },
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

    if (!result) {
      throw new Error('Rating result not found');
    }

    const metrics = result.metrics as RatingMetrics;
    const category = result.request.category;
    const preset = getCategoryPreset(category);

    if (!preset) {
      throw new Error(`Unknown category: ${category}`);
    }

    // Build context for AI prompt
    const metricsText = preset.metrics
      .map((m) => `${m.label}: ${metrics[m.id] || 0}`)
      .join(', ');

    // Try AI generation if configured
    if (GEN_CONFIG.GPT_URL && GEN_CONFIG.GPT_KEY) {
      try {
        const flavorText = await callAIForFlavor(category, metricsText, result.summaryText);
        return flavorText;
      } catch (error) {
        logger.warn('[RatingService] AI flavor generation failed, using fallback', { requestId, error });
        // Fall through to placeholder
      }
    }

    // Fallback to placeholder flavor text
    return generatePlaceholderFlavor(category, metrics);
  } catch (error) {
    logger.error('[RatingService] Failed to generate flavor text', { requestId, error });
    throw error;
  }
}

/**
 * Call AI API to generate flavor text
 */
async function callAIForFlavor(
  category: string,
  metricsText: string,
  summaryText: string
): Promise<FlavorText> {
  const systemPrompt = `You are Parel, a friendly AI with a playful personality. Generate short, light-hearted feedback. Keep it fun but never toxic or mean.`;

  const userPrompt = `Category: ${category}
Metrics: ${metricsText}
Summary: ${summaryText}

Generate:
1. One short compliment (1-2 sentences, positive and encouraging)
2. One short playful roast (1-2 sentences, light humor, never toxic)
3. Optional neutral observation (1 sentence, if relevant)

Return JSON format:
{
  "compliment": "...",
  "roast": "...",
  "neutral": "..." (optional)
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

  // Try to parse JSON (may be wrapped in markdown)
  let parsed: FlavorText;
  try {
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    // If not JSON, try to extract from text
    throw new Error('Failed to parse AI response as JSON');
  }

  // Validate structure
  if (!parsed.compliment || !parsed.roast) {
    throw new Error('Invalid flavor text structure');
  }

  return {
    compliment: parsed.compliment,
    roast: parsed.roast,
    neutral: parsed.neutral,
  };
}

/**
 * Generate placeholder flavor text (fallback when AI unavailable)
 */
function generatePlaceholderFlavor(category: string, metrics: RatingMetrics): FlavorText {
  const placeholderCompliments: Record<string, string[]> = {
    snack: [
      'This snack looks absolutely delicious!',
      'Yum! This is snack perfection.',
      'My taste buds are already celebrating!',
    ],
    outfit: [
      'You look absolutely fire!',
      'This outfit is giving main character energy!',
      'Style goals achieved!',
    ],
    car: [
      'This car is absolutely stunning!',
      'Ride goals achieved!',
      'This is car perfection!',
    ],
    room: [
      'This room is giving cozy vibes!',
      'I want to move in immediately!',
      'Interior design goals right here!',
    ],
    gift: [
      'Someone is going to love this!',
      'Gift-giving level: expert!',
      'This is thoughtful perfection!',
    ],
    pet: [
      'Too cute to handle!',
      'This pet is illegally adorable!',
      'Cutest pet award goes to...',
    ],
  };

  const placeholderRoasts: Record<string, string[]> = {
    snack: [
      'But seriously, save some for the rest of us!',
      'This might be too good to share.',
      'Warning: may cause snack envy.',
    ],
    outfit: [
      'But can you handle all that style?',
      'This outfit might break the internet.',
      'Too stylish for your own good!',
    ],
    car: [
      'But can you handle all that coolness?',
      'This car might cause traffic jams from people staring.',
      'Too cool for the parking lot!',
    ],
    room: [
      'But can you handle all that coziness?',
      'This room might make you never want to leave.',
      'Too perfect for reality!',
    ],
    gift: [
      'But can you handle being this thoughtful?',
      'This gift might make others look bad.',
      'Too perfect for gift-giving!',
    ],
    pet: [
      'But can you handle all that cuteness?',
      'This pet might cause cuteness overload.',
      'Too adorable for words!',
    ],
  };

  const compliments = placeholderCompliments[category] || ['Looks great!'];
  const roasts = placeholderRoasts[category] || ['Nice!'];

  return {
    compliment: compliments[Math.floor(Math.random() * compliments.length)],
    roast: roasts[Math.floor(Math.random() * roasts.length)],
  };
}

