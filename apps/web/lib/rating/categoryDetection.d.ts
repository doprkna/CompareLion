/**
 * Category Detection Service
 * AI-powered category detection for images
 * v0.38.8 - AI Category Detection
 */
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
export declare function detectImageCategory(imageUrl: string): Promise<CategoryDetection>;
