/**
 * Question Insights Service
 * Compute basic analytics for questions
 * v0.37.6 - Question Insights (Basic)
 */
export interface QuestionInsights {
    answerCount: number;
    avgAnswerLength: number;
    avgResponseTime: number;
    skipRate: number;
    maxAnswerLength?: number;
    minAnswerLength?: number;
}
/**
 * Get insights for a question template
 *
 * @param questionTemplateId - Question template ID
 * @returns Question insights
 */
export declare function getQuestionInsights(questionTemplateId: string): Promise<QuestionInsights>;
