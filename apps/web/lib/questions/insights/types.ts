/**
 * Question Insights Types
 * v0.37.6 - Question Insights (Basic)
 */

export interface QuestionInsights {
  answerCount: number;
  avgAnswerLength: number;
  avgResponseTime: number; // milliseconds
  skipRate: number; // percentage (0-100)
  maxAnswerLength?: number;
  minAnswerLength?: number;
}

