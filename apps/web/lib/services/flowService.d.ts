/**
 * Flow Service - Core Gameplay Logic
 * Connects QuestionGeneration to flow runner
 * v0.23.0 - Added localization support
 */
export interface FlowQuestion {
    id: string;
    question: string;
    options?: Array<{
        id: string;
        label: string;
        value: string;
    }>;
    category: string;
    difficulty: string;
    type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT' | 'NUMERIC';
    metadata?: any;
}
export interface FlowAnswer {
    questionId: string;
    userId: string;
    optionIds?: string[];
    textValue?: string;
    numericValue?: number;
    skipped: boolean;
}
export interface LocalizationFilter {
    lang?: string;
    region?: string;
}
/**
 * Get next question for user flow
 * Prioritizes questions from successful QuestionGeneration jobs
 * v0.23.0 - Added localization filtering
 */
export declare function getNextFlowQuestion(userId: string, categoryId?: string, localization?: LocalizationFilter): Promise<FlowQuestion | null>;
/**
 * Record user's answer to a flow question
 */
export declare function recordFlowAnswer(answer: FlowAnswer): Promise<{ success: boolean; streakCount?: number }>;
/**
 * Get flow statistics for a user
 */
export declare function getUserFlowStats(userId: string): Promise<{
    totalAnswered: any;
    totalSkipped: any;
    todayAnswered: any;
    totalQuestions: any;
}>;
/**
 * Get available question count by category
 */
export declare function getAvailableQuestionCount(categoryId?: string): Promise<any>;
/**
 * Answer question (alias for recordFlowAnswer)
 */
export declare function answerQuestion(answer: FlowAnswer): Promise<boolean>;
/**
 * Get next question for user (alias for getNextFlowQuestion)
 */
export declare function getNextQuestionForUser(userId: string, categoryId?: string, localization?: LocalizationFilter): Promise<FlowQuestion | null>;
/**
 * Skip question (records a skipped answer)
 */
export declare function skipQuestion(userId: string, questionId: string): Promise<boolean>;
