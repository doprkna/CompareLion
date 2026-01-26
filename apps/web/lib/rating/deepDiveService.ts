/**
 * Deep Dive Analysis Service
 * Premium extended analysis for AURE ratings
 * v0.38.13 - Premium Deep Dive Analysis
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getCategoryPreset, buildPromptFromPreset } from './presets';
import { applyAdaptiveTemplate } from './adaptiveTemplate';
import { getComparisonData, RatingMetrics } from './ratingService';
import { GEN_CONFIG } from '@parel/core/config/generator';

export interface DeepDiveAnalysis {
  extendedMetrics: RatingMetrics; // 3-5 additional category-specific metrics
  longSummary: string; // 2-4 paragraphs
  improvementTips: string[]; // Array of improvement suggestions
  cohortComparisons: {
    top10: RatingMetrics; // Top 10% scores
    median: RatingMetrics; // Median scores
  };
}

/**
 * Generate deep dive analysis for a rating request
 * Premium-only extended analysis with more insights
 * 
 * @param requestId - Rating request ID
 * @returns Deep dive analysis
 */
export async function generateDeepDiveAnalysis(requestId: string): Promise<DeepDiveAnalysis> {
  try {
    // Fetch request and existing result
    const request = await prisma.ratingRequest.findUnique({
      where: { id: requestId },
      include: {
        result: true,
      },
    });

    if (!request) {
      throw new Error('Rating request not found');
    }

    if (!request.result) {
      throw new Error('Rating result not found. Generate rating first.');
    }

    const existingMetrics = request.result.metrics as RatingMetrics;
    const category = request.category;
    const preset = getCategoryPreset(category);

    if (!preset) {
      throw new Error(`Unknown category: ${category}`);
    }

    // Get comparison data for cohort analysis
    const comparisonData = await getComparisonData(requestId);

    // Apply adaptive template rules
    const entryData = {
      imageUrl: request.imageUrl,
      text: request.text,
      category: request.category,
    };
    const adaptiveContext = applyAdaptiveTemplate(entryData, preset);

    // Build deep dive prompt
    const deepDivePrompt = buildDeepDivePrompt(
      preset,
      existingMetrics,
      comparisonData,
      adaptiveContext.hints
    );

    // Generate deep dive via AI (or fallback)
    let analysis: DeepDiveAnalysis;
    
    if (GEN_CONFIG.GPT_URL && GEN_CONFIG.GPT_KEY) {
      try {
        analysis = await callAIForDeepDive(deepDivePrompt, category, existingMetrics, comparisonData);
      } catch (error) {
        logger.warn('[DeepDiveService] AI generation failed, using fallback', { requestId, error });
        analysis = generateFallbackDeepDive(existingMetrics, comparisonData, preset);
      }
    } else {
      analysis = generateFallbackDeepDive(existingMetrics, comparisonData, preset);
    }

    return analysis;
  } catch (error) {
    logger.error('[DeepDiveService] Failed to generate deep dive analysis', { requestId, error });
    throw error;
  }
}

/**
 * Build deep dive prompt for AI
 */
function buildDeepDivePrompt(
  preset: any,
  existingMetrics: RatingMetrics,
  comparisonData: any,
  adaptiveHints: string[]
): string {
  const metricNames = preset.metrics.map((m: any) => m.label).join(', ');
  const userScores = Object.entries(existingMetrics)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  let prompt = `You are Parel's Premium Deep Dive Analyst. Provide an extended, detailed analysis.

Category: ${preset.name}
User's Current Scores: ${userScores}
Available Metrics: ${metricNames}

Category Average Scores: ${JSON.stringify(comparisonData.avgScore)}
User Percentiles: ${JSON.stringify(comparisonData.percentiles)}

${adaptiveHints.length > 0 ? `Additional Context: ${adaptiveHints.join(' ')}` : ''}

Provide a comprehensive deep dive analysis:

1. Extended Metrics (3-5 additional category-specific metrics beyond the base metrics):
   - Add nuanced metrics relevant to this category
   - Score each 0-100
   - Examples: "presentationQuality", "originality", "execution", "attentionToDetail", "overallImpression"

2. Long Summary (2-4 short paragraphs):
   - Explain WHY the item scored as it did
   - Compare to category averages and percentiles
   - Highlight strengths and areas for improvement
   - Be specific and actionable

3. Improvement Tips (3-5 concrete suggestions):
   - Specific, actionable advice
   - Focus on areas with lower scores
   - Be encouraging but honest

4. Cohort Comparisons:
   - Top 10%: What scores do top performers achieve?
   - Median: How does this compare to the average?

Return JSON format:
{
  "extendedMetrics": { "metric1": 75, "metric2": 82, ... },
  "longSummary": "Paragraph 1...\n\nParagraph 2...\n\nParagraph 3...",
  "improvementTips": ["Tip 1", "Tip 2", "Tip 3"],
  "cohortComparisons": {
    "top10": { "metric1": 90, "metric2": 88, ... },
    "median": { "metric1": 65, "metric2": 70, ... }
  }
}`;

  return prompt;
}

/**
 * Call AI API for deep dive analysis
 */
async function callAIForDeepDive(
  prompt: string,
  category: string,
  existingMetrics: RatingMetrics,
  comparisonData: any
): Promise<DeepDiveAnalysis> {
  const systemPrompt = `You are Parel's Premium Deep Dive Analyst. Provide detailed, actionable insights. Be specific, encouraging, and honest.`;

  const response = await fetch(GEN_CONFIG.GPT_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GEN_CONFIG.GPT_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
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

  // Validate and compute cohort comparisons from comparisonData
  const top10Metrics: RatingMetrics = {};
  const medianMetrics: RatingMetrics = {};

  // Calculate top 10% and median from comparisonData
  Object.keys(existingMetrics).forEach((key) => {
    // Top 10%: use 90th percentile approximation
    top10Metrics[key] = Math.min(100, (comparisonData.avgScore[key] || 0) * 1.3);
    
    // Median: use average as approximation
    medianMetrics[key] = comparisonData.avgScore[key] || 0;
  });

  return {
    extendedMetrics: parsed.extendedMetrics || {},
    longSummary: parsed.longSummary || 'Deep dive analysis unavailable.',
    improvementTips: Array.isArray(parsed.improvementTips) ? parsed.improvementTips : [],
    cohortComparisons: {
      top10: parsed.cohortComparisons?.top10 || top10Metrics,
      median: parsed.cohortComparisons?.median || medianMetrics,
    },
  };
}

/**
 * Generate fallback deep dive (when AI unavailable)
 */
function generateFallbackDeepDive(
  existingMetrics: RatingMetrics,
  comparisonData: any,
  preset: any
): DeepDiveAnalysis {
  // Generate extended metrics based on existing metrics
  const extendedMetrics: RatingMetrics = {};
  const metricKeys = Object.keys(existingMetrics);
  
  // Add 3-5 extended metrics
  const extendedMetricNames = [
    'presentationQuality',
    'originality',
    'execution',
    'attentionToDetail',
    'overallImpression',
  ];

  extendedMetricNames.slice(0, Math.min(5, 5 - metricKeys.length)).forEach((name) => {
    // Base score on existing metrics average
    const avgScore = Object.values(existingMetrics).reduce((sum, v) => sum + v, 0) / Object.values(existingMetrics).length;
    extendedMetrics[name] = Math.round(avgScore + (Math.random() * 20 - 10)); // ±10 variation
  });

  // Generate summary
  const avgScore = Object.values(existingMetrics).reduce((sum, v) => sum + v, 0) / Object.values(existingMetrics).length;
  const longSummary = `Your ${preset.name} scored an average of ${Math.round(avgScore)}/100 across all metrics.

Compared to other ${preset.name} submissions, your item performs ${avgScore > comparisonData.avgScore[Object.keys(existingMetrics)[0]] ? 'above' : 'below'} average. The top 10% of submissions typically score around ${Math.round((comparisonData.avgScore[Object.keys(existingMetrics)[0]] || 0) * 1.3)}/100.

To improve your score, focus on the areas where you scored lower. Consider experimenting with different approaches and seeking feedback from others.`;

  // Generate improvement tips
  const improvementTips = [
    'Focus on improving areas with lower scores',
    'Compare your approach to top performers',
    'Experiment with different variations',
    'Seek feedback from others',
    'Pay attention to detail and presentation',
  ];

  // Calculate cohort comparisons
  const top10Metrics: RatingMetrics = {};
  const medianMetrics: RatingMetrics = {};

  Object.keys(existingMetrics).forEach((key) => {
    top10Metrics[key] = Math.min(100, Math.round((comparisonData.avgScore[key] || 0) * 1.3));
    medianMetrics[key] = Math.round(comparisonData.avgScore[key] || 0);
  });

  return {
    extendedMetrics,
    longSummary,
    improvementTips,
    cohortComparisons: {
      top10: top10Metrics,
      median: medianMetrics,
    },
  };
}

