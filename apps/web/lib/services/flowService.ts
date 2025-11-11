/**
 * Flow Service - Core Gameplay Logic
 * Connects QuestionGeneration to flow runner
 * v0.23.0 - Added localization support
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/utils/debug';
import { matchesLanguage, matchesRegion, type Question } from '@/lib/types/question';

export interface FlowQuestion {
  id: string;
  question: string;
  options?: Array<{ id: string; label: string; value: string }>;
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
export async function getNextFlowQuestion(
  userId: string,
  categoryId?: string,
  localization?: LocalizationFilter
): Promise<FlowQuestion | null> {
  try {
    // Find questions that are:
    // 1. Active
    // 2. Not answered by this user
    // 3. Optionally in specific category
    const answeredQuestionIds = await prisma.userResponse.findMany({
      where: { userId },
      select: { questionId: true },
    });

    const answeredIds = answeredQuestionIds.map(r => r.questionId);

    // Try to get FlowQuestion first (preferred)
    const flowQuestion = await prisma.flowQuestion.findFirst({
      where: {
        isActive: true,
        id: answeredIds.length > 0 ? { notIn: answeredIds } : undefined,
        categoryId: categoryId || undefined,
      },
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
        category: {
          select: { name: true },
        },
      },
    });

    if (flowQuestion) {
      // Check localization match if filters provided (v0.23.0)
      if (localization) {
        const q = flowQuestion as any;
        const langMatch = !localization.lang || matchesLanguage(q, localization.lang);
        const regionMatch = !localization.region || matchesRegion(q, localization.region);
        
        // If doesn't match, try to find another question
        if (!langMatch || !regionMatch) {
          // Could implement recursive search here, but for now just skip to fallback
          // Future: Implement proper filtering in Prisma query
        } else {
          return {
            id: flowQuestion.id,
            question: flowQuestion.text,
            options: flowQuestion.options.map(opt => ({
              id: opt.id,
              label: opt.label,
              value: opt.value,
            })),
            category: flowQuestion.category?.name || 'General',
            difficulty: 'medium',
            type: flowQuestion.type,
          };
        }
      } else {
        return {
          id: flowQuestion.id,
          question: flowQuestion.text,
          options: flowQuestion.options.map(opt => ({
            id: opt.id,
            label: opt.label,
            value: opt.value,
          })),
          category: flowQuestion.category?.name || 'General',
          difficulty: 'medium',
          type: flowQuestion.type,
        };
      }
    }

    // Fallback to Question table from QuestionGeneration
    const question = await prisma.question.findFirst({
      where: {
        id: answeredIds.length > 0 ? { notIn: answeredIds } : undefined,
        approved: true,
        ssscId: categoryId || undefined,
      },
      include: {
        sssc: {
          select: { name: true },
        },
      },
    });

    if (question) {
      // Check localization match if filters provided (v0.23.0)
      if (localization) {
        const q = question as any;
        const langMatch = !localization.lang || matchesLanguage(q, localization.lang);
        const regionMatch = !localization.region || matchesRegion(q, localization.region);
        
        // If doesn't match, return null (no more questions)
        if (!langMatch || !regionMatch) {
          return null;
        }
      }
      
      return {
        id: question.id,
        question: question.text,
        options: undefined, // Question table uses versions for options
        category: question.sssc?.name || 'General',
        difficulty: question.difficulty || 'medium',
        type: 'TEXT', // Default for Question table
        metadata: question.metadata,
      };
    }

    return null;
  } catch (error) {
    logger.error('Error fetching next flow question', error);
    throw error;
  }
}

/**
 * Record user's answer to a flow question
 */
export async function recordFlowAnswer(answer: FlowAnswer): Promise<boolean> {
  try {
    // Check if already answered
    const existing = await prisma.userResponse.findFirst({
      where: {
        userId: answer.userId,
        questionId: answer.questionId,
      },
    });

    if (existing) {
      // Update existing answer
      await prisma.userResponse.update({
        where: { id: existing.id },
        data: {
          optionIds: answer.optionIds || [],
          textVal: answer.textValue || null,
          numericVal: answer.numericValue || null,
          skipped: answer.skipped,
        },
      });
    } else {
      // Create new answer
      await prisma.userResponse.create({
        data: {
          userId: answer.userId,
          questionId: answer.questionId,
          optionIds: answer.optionIds || [],
          textVal: answer.textValue || null,
          numericVal: answer.numericValue || null,
          skipped: answer.skipped,
        },
      });
    }

    // Update user stats
    if (!answer.skipped) {
      await prisma.user.update({
        where: { id: answer.userId },
        data: {
          questionsAnswered: { increment: 1 },
          xp: { increment: 10 }, // Award XP for answering
          lastAnsweredAt: new Date(),
        },
      });
    }

    return true;
  } catch (error) {
    logger.error('Error recording flow answer', error);
    throw error;
  }
}

/**
 * Get flow statistics for a user
 */
export async function getUserFlowStats(userId: string) {
  try {
    const [totalAnswered, totalSkipped, todayAnswered] = await Promise.all([
      prisma.userResponse.count({
        where: { userId, skipped: false },
      }),
      prisma.userResponse.count({
        where: { userId, skipped: true },
      }),
      prisma.userResponse.count({
        where: {
          userId,
          skipped: false,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      totalAnswered,
      totalSkipped,
      todayAnswered,
      totalQuestions: totalAnswered + totalSkipped,
    };
  } catch (error) {
    logger.error('Error fetching user flow stats', error);
    throw error;
  }
}

/**
 * Get available question count by category
 */
export async function getAvailableQuestionCount(categoryId?: string) {
  try {
    const flowCount = await prisma.flowQuestion.count({
      where: {
        isActive: true,
        categoryId: categoryId || undefined,
      },
    });

    const questionCount = await prisma.question.count({
      where: {
        approved: true,
        ssscId: categoryId || undefined,
      },
    });

    return flowCount + questionCount;
  } catch (error) {
    logger.error('Error counting available questions', error);
    throw error;
  }
}

/**
 * Answer question (alias for recordFlowAnswer)
 */
export async function answerQuestion(answer: FlowAnswer): Promise<boolean> {
  return recordFlowAnswer(answer);
}

/**
 * Get next question for user (alias for getNextFlowQuestion)
 */
export async function getNextQuestionForUser(
  userId: string,
  categoryId?: string,
  localization?: LocalizationFilter
): Promise<FlowQuestion | null> {
  return getNextFlowQuestion(userId, categoryId, localization);
}

/**
 * Skip question (records a skipped answer)
 */
export async function skipQuestion(userId: string, questionId: string): Promise<boolean> {
  return recordFlowAnswer({
    questionId,
    userId,
    skipped: true,
  });
}
