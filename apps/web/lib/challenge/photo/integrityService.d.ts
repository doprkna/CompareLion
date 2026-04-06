/**
 * Image Integrity Check Service
 * AI-powered image integrity analysis
 * v0.38.6 - Image Integrity Check + Scam Alert
 */
export interface IntegrityAnalysis {
    watermarkDetected: boolean;
    stockPhotoLikelihood: number;
    aiGeneratedLikelihood: number;
    screenshotLikelihood: number;
    notes: string;
}
/**
 * Analyze image integrity using AI
 * Detects watermarks, stock photos, AI-generated patterns, screenshots
 *
 * @param imageUrl - URL to the image
 * @returns Integrity analysis results
 */
export declare function analyzeImageIntegrity(imageUrl: string): Promise<IntegrityAnalysis>;
/**
 * Generate playful system message based on integrity analysis
 */
export declare function generatePlayfulMessage(analysis: IntegrityAnalysis): string;
