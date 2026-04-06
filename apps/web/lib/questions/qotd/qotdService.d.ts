/**
 * Question of the Day Service
 * Select and cache daily question
 * v0.37.10 - Question of the Day Widget
 */
export interface QOTDData {
    questionId: string;
    text: string;
    tags?: string[];
    stats?: {
        answerCount: number;
        skipRate: number;
    };
}
/**
 * Get question of the day
 * Selection strategy:
 * 1. Check cache first (per UTC day)
 * 2. Try pre-curated questions (admin flag in metadata)
 * 3. Try highest engagement (most answers today)
 * 4. Random fallback
 */
export declare function getQuestionOfTheDay(): Promise<QOTDData | null>;
