/**
 * AURE Assist Engine - Screenshot Scraper Service
 * Analyzes screenshots and suggests actions
 * v0.39.3 - AURE Assist Engine
 */
export interface ScreenshotAnalysis {
    description: string;
    contextGuess: string;
    suggestedActions: string[];
}
/**
 * Analyze screenshot and suggest actions
 * AI describes what's in the screenshot and suggests what to do with it
 */
export declare function analyzeScreenshot(imageUrl: string): Promise<ScreenshotAnalysis>;
