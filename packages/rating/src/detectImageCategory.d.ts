import { Category } from './categoryRules';
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
export declare function detectImageCategory(imageUrlOrText: string): Promise<CategoryDetection>;
