/**
 * Question Insights Types
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
