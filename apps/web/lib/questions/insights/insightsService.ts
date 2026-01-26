/**
 * Question Insights Service
 * Compute basic analytics for questions
 * v0.37.6 - Question Insights (Basic)
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface QuestionInsights {
  answerCount: number;
  avgAnswerLength: number;
  avgResponseTime: number; // milliseconds
  skipRate: number; // percentage (0-100)
  maxAnswerLength?: number;
  minAnswerLength?: number;
}

/**
 * Get insights for a question template
 * 
 * @param questionTemplateId - Question template ID
 * @returns Question insights
 */
export async function getQuestionInsights(
  questionTemplateId: string
): Promise<QuestionInsights> {
  try {
    // Get all answers (reflections) for this question template
    // Query reflections where metadata.questionTemplateId matches
    // Using PostgreSQL JSONB query syntax
    const reflections = await prisma.$queryRaw<Array<{ content: string; createdAt: Date }>>`
      SELECT content, "createdAt"
      FROM "UserReflection"
      WHERE metadata->>'questionTemplateId' = ${questionTemplateId}
    `;

    // Get userQuestions for response time calculation
    const userQuestions = await prisma.userQuestion.findMany({
      where: {
        questionTemplateId,
      },
      select: {
        id: true,
        servedAt: true,
        answeredAt: true,
        userId: true,
      },
    });

    // Count skips for this question template
    // SkipQuestion.questionId might match questionTemplateId directly
    // Or we need to count skips by users who were served this question template
    const skipCount = await prisma.skipQuestion.count({
      where: {
        questionId: questionTemplateId,
      },
    });

    // Calculate answer count
    const answerCount = reflections.length;

    // Calculate average answer length
    const totalLength = reflections.reduce((sum, r) => sum + (r.content?.length || 0), 0);
    const avgAnswerLength = answerCount > 0 ? totalLength / answerCount : 0;

    // Calculate max/min answer length
    const answerLengths = reflections.map(r => r.content?.length || 0).filter(len => len > 0);
    const maxAnswerLength = answerLengths.length > 0 ? Math.max(...answerLengths) : undefined;
    const minAnswerLength = answerLengths.length > 0 ? Math.min(...answerLengths) : undefined;

    // Calculate average response time (answeredAt - servedAt from userQuestion)
    const answeredQuestions = userQuestions.filter(uq => uq.answeredAt && uq.servedAt);
    const responseTimes = answeredQuestions.map(uq => {
      const served = uq.servedAt?.getTime() || 0;
      const answered = uq.answeredAt?.getTime() || 0;
      return answered - served;
    }).filter(rt => rt > 0);

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length
      : 0;

    // Calculate skip rate
    // Skip rate = skips / (skips + answers)
    const totalInteractions = skipCount + answerCount;
    const skipRate = totalInteractions > 0 ? (skipCount / totalInteractions) * 100 : 0;

    return {
      answerCount,
      avgAnswerLength: Math.round(avgAnswerLength * 100) / 100, // Round to 2 decimals
      avgResponseTime: Math.round(avgResponseTime), // Round to milliseconds
      skipRate: Math.round(skipRate * 100) / 100, // Round to 2 decimals
      maxAnswerLength,
      minAnswerLength,
    };
  } catch (error) {
    logger.error('[QuestionInsights] Failed to get insights', {
      questionTemplateId,
      error,
    });
    
    // Return default values on error
    return {
      answerCount: 0,
      avgAnswerLength: 0,
      avgResponseTime: 0,
      skipRate: 0,
    };
  }
}

