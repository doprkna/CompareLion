import { CATEGORY_RULES, Category } from './categoryRules';

export interface CategoryDetection {
  category: Category | null;
  final: string;
  confidence?: number;
}

/**
 * Detect image category from image URL or text description
 * @param imageUrlOrText - Image URL or text description to analyze
 * @returns Category detection result
 */
export async function detectImageCategory(
  imageUrlOrText: string
): Promise<CategoryDetection> {
  // For now, use simple text-based detection
  // TODO: Integrate with actual image analysis API (e.g., Google Vision, AWS Rekognition)
  
  const text = imageUrlOrText.toLowerCase();
  
  // Check against category rules
  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    if (keywords.some((k) => text.includes(k))) {
      return {
        category: category as Category,
        final: category,
        confidence: 0.8,
      };
    }
  }
  
  // Default: safe category
  return {
    category: null,
    final: 'safe',
    confidence: 0.5,
  };
}

