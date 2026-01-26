/**
 * Category Detection Service
 * AI-powered category detection for images
 * v0.38.8 - AI Category Detection
 */

import { logger } from '@/lib/logger';
import { GEN_CONFIG } from '@parel/core/config/generator';
import { getAllCategories } from './presets';

export interface CategoryDetection {
  categories: Array<{
    name: string;
    confidence: number;
  }>;
  final: string;
}

/**
 * Detect category for an image using AI
 * 
 * @param imageUrl - URL to the image
 * @returns Category detection with confidence scores
 */
export async function detectImageCategory(imageUrl: string): Promise<CategoryDetection> {
  try {
    // Try AI detection if configured
    if (GEN_CONFIG.GPT_URL && GEN_CONFIG.GPT_KEY) {
      try {
        const detection = await callAIForCategoryDetection(imageUrl);
        return detection;
      } catch (error) {
        logger.warn('[CategoryDetection] AI detection failed, using fallback', { imageUrl, error });
        // Fall through to fallback
      }
    }

    // Fallback: return equal confidence for all categories
    const allCategories = getAllCategories();
    return {
      categories: allCategories.map((cat) => ({
        name: cat,
        confidence: 1 / allCategories.length,
      })),
      final: allCategories[0] || 'snack',
    };
  } catch (error) {
    logger.error('[CategoryDetection] Failed to detect category', { imageUrl, error });
    throw error;
  }
}

/**
 * Call AI API to detect image category
 */
async function callAIForCategoryDetection(imageUrl: string): Promise<CategoryDetection> {
  const availableCategories = getAllCategories();
  const categoryList = availableCategories.join(', ');

  const systemPrompt = `You are a category classifier. Analyze images and determine which category they belong to. Be accurate and concise.`;

  const userPrompt = `Analyze this image: ${imageUrl}

Available categories: ${categoryList}

Determine which category this image belongs to. Consider:
- Visual content (what's in the image)
- Context clues (setting, objects, style)
- Best match from available categories

Return JSON format:
{
  "categories": [
    { "name": "category1", "confidence": 0.0-1.0 },
    { "name": "category2", "confidence": 0.0-1.0 },
    ...
  ],
  "final": "best_matching_category"
}

Requirements:
- Include all available categories with confidence scores
- Confidence scores should sum to approximately 1.0
- "final" should be the category with highest confidence
- Only use categories from the available list`;

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
      temperature: 0.3,
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

  // Try to parse JSON (may be wrapped in markdown)
  let parsed: CategoryDetection;
  try {
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse AI response as JSON');
  }

  // Validate structure
  if (!parsed.categories || !Array.isArray(parsed.categories) || !parsed.final) {
    throw new Error('Invalid category detection structure');
  }

  // Validate categories are from available list
  const validCategories = getAllCategories();
  const validatedCategories = parsed.categories
    .filter((cat: any) => validCategories.includes(cat.name))
    .map((cat: any) => ({
      name: cat.name,
      confidence: Math.max(0, Math.min(1, cat.confidence || 0)),
    }))
    .sort((a: any, b: any) => b.confidence - a.confidence);

  // Ensure final is valid
  const finalCategory = validCategories.includes(parsed.final)
    ? parsed.final
    : validatedCategories[0]?.name || validCategories[0] || 'snack';

  return {
    categories: validatedCategories,
    final: finalCategory,
  };
}

