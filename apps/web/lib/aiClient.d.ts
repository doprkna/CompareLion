/**
 * AI Client for Question Generation
 *
 * Handles communication with the GPT API endpoint for generating questions
 */
export type GenRequest = {
    categoryName: string;
    categoryPath?: string[];
    language: string;
    minCount: number;
    maxCount: number;
};
export type GenResponse = {
    questions: string[];
    meta?: any;
    tokensIn?: number;
    tokensOut?: number;
    model?: string;
};
/**
 * Generate questions for a category using the GPT API
 *
 * @param req - Generation request parameters
 * @returns Array of generated questions with metadata
 * @throws Error if generation fails
 */
export declare function generateQuestions(req: GenRequest): Promise<GenResponse>;
/**
 * Test the GPT API connection
 * Returns true if the API is reachable and configured
 */
export declare function testGPTConnection(): Promise<{
    success: boolean;
    error?: string;
}>;
