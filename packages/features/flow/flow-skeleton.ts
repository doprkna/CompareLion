/**
 * Flow Skeleton - Simple Question Flow
 * v0.35.13 - Rebuilt to use FlowQuestion & UserResponse models
 * Login â†’ Pick Category â†’ Sequential Questions â†’ Result
 */

import { prisma } from '@parel/db';

export interface FlowSession {
  id: string;
  userId: string;
  categoryId: string;
  currentQuestionIndex: number;
  questionsAnswered: number;
  questionsSkipped: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface FlowQuestion {
  id: string;
  text: string;
  type: string;
  difficulty: string;
  categoryName: string;
  options?: Array<{
    id: string;
    label: string;
    value: string;
    order: number;
  }>;
}

export interface FlowResult {
  questionsAnswered: number;
  questionsSkipped: number;
  totalQuestions: number;
  xpGained: number;
  streakCount: number;
  completionRate: number;
}

/**
 * Start a new flow session
 */
export async function startFlow(userId: string, categoryId: string): Promise<FlowSession> {
  // Input validation: guard against empty strings
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  
  if (!categoryId || typeof categoryId !== 'string' || categoryId.trim().length === 0) {
    throw new Error('Invalid categoryId: must be a non-empty string');
  }

  // Verify category exists
  const category = await prisma.sssCategory.findUnique({
    where: { id: categoryId }
  });
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  // Create flow session (using existing session model or in-memory)
  const session: FlowSession = {
    id: `flow_${Date.now()}_${userId.substring(0, 8)}`,
    userId,
    categoryId,
    currentQuestionIndex: 0,
    questionsAnswered: 0,
    questionsSkipped: 0,
    startedAt: new Date()
  };
  
  return session;
}

/**
 * Get next question in the flow using FlowQuestion model
 */
export async function getNextQuestion(
  userId: string,
  categoryId: string
): Promise<FlowQuestion | null> {
  // Input validation: guard against empty strings
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  
  if (!categoryId || typeof categoryId !== 'string' || categoryId.trim().length === 0) {
    throw new Error('Invalid categoryId: must be a non-empty string');
  }

  // Get questions user has already answered
  const answeredQuestions = await prisma.userResponse.findMany({
    where: { userId },
    select: { questionId: true }
  });
  
  const answeredIds = answeredQuestions.map(q => q.questionId);
  
  // Get next unanswered FlowQuestion
  const flowQuestion = await prisma.flowQuestion.findFirst({
    where: {
      categoryId,
      isActive: true,
      id: answeredIds.length > 0 ? { notIn: answeredIds } : undefined,
    },
    include: {
      options: {
        orderBy: { order: 'asc' }
      },
      category: {
        select: { name: true }
      }
    }
  });
  
  if (!flowQuestion) {
    return null; // All questions answered
  }
  
  return {
    id: flowQuestion.id,
    text: flowQuestion.text,
    type: flowQuestion.type,
    difficulty: 'medium',
    categoryName: flowQuestion.category?.name || 'Unknown',
    options: flowQuestion.options.map(opt => ({
      id: opt.id,
      label: opt.label,
      value: opt.value,
      order: opt.order
    }))
  };
}

/**
 * Submit an answer to a question using UserResponse model
 */
export async function answerQuestion(
  userId: string,
  questionId: string,
  optionIds?: string[],
  textValue?: string,
  numericValue?: number
): Promise<void> {
  // Input validation: guard against empty strings
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  
  if (!questionId || typeof questionId !== 'string' || questionId.trim().length === 0) {
    throw new Error('Invalid questionId: must be a non-empty string');
  }

  // Calculate XP gain
  const xpGain = 10; // Base XP for answering
  
  // Record the answer and update user stats in a transaction
  try {
    await prisma.$transaction([
    // Create user response
    prisma.userResponse.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId
        }
      },
      create: {
        userId,
        questionId,
        optionIds: optionIds || [],
        textVal: textValue || null,
        numericVal: numericValue || null,
        skipped: false
      },
      update: {
        optionIds: optionIds || [],
        textVal: textValue || null,
        numericVal: numericValue || null,
        skipped: false
      }
    }),
    
    // Update user stats
    prisma.user.update({
      where: { id: userId },
      data: {
        questionsAnswered: { increment: 1 },
        xp: { increment: xpGain },
        lastAnsweredAt: new Date(),
        streakCount: { increment: 1 }
      })
    ]);
  } catch (error) {
    // Transaction error handling with clearer message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to record answer: ${errorMessage}`);
  }
}

/**
 * Skip a question using UserResponse model
 */
export async function skipQuestion(
  userId: string,
  questionId: string
): Promise<void> {
  // Input validation: guard against empty strings
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  
  if (!questionId || typeof questionId !== 'string' || questionId.trim().length === 0) {
    throw new Error('Invalid questionId: must be a non-empty string');
  }

  // Mark question as skipped
  await prisma.userResponse.upsert({
    where: {
      userId_questionId: {
        userId,
        questionId
      }
    },
    create: {
      userId,
      questionId,
      skipped: true,
      optionIds: []
    },
    update: {
      skipped: true
    }
  });
  
  // Reset streak when skipping
  await prisma.user.update({
    where: { id: userId },
    data: {
      streakCount: 0
    }
  });
}

/**
 * Get flow completion result
 */
export async function getFlowResult(
  userId: string,
  categoryId: string
): Promise<FlowResult> {
  // Input validation: guard against empty strings
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  
  if (!categoryId || typeof categoryId !== 'string' || categoryId.trim().length === 0) {
    throw new Error('Invalid categoryId: must be a non-empty string');
  }

  // Get all active questions in category
  const totalQuestions = await prisma.flowQuestion.count({
    where: {
      categoryId,
      isActive: true
    }
  });
  
  // Get user's responses for this category's questions
  const responses = await prisma.userResponse.findMany({
    where: {
      userId,
      question: { categoryId }
    },
    select: { skipped: true }
  });
  
  const questionsAnswered = responses.filter(r => !r.skipped).length;
  const questionsSkipped = responses.filter(r => r.skipped).length;
  
  // Get user's current stats (optimized: select only needed fields)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, streakCount: true }
  });
  
  // Null check: defensive default if user not found
  if (!user) {
    // Return default result if user doesn't exist (defensive default)
    return {
      questionsAnswered,
      questionsSkipped,
      totalQuestions,
      xpGained: 0,
      streakCount: 0,
      completionRate: totalQuestions > 0 
        ? Math.round((questionsAnswered / totalQuestions) * 100) 
        : 0,
    };
  }
  
  const xpGained = questionsAnswered * 10; // Estimate based on answered questions
  const streakCount = user.streakCount || 0;
  const completionRate = totalQuestions > 0 
    ? Math.round((questionsAnswered / totalQuestions) * 100) 
    : 0;
  
  return {
    questionsAnswered,
    questionsSkipped,
    totalQuestions,
    xpGained,
    streakCount,
    completionRate
  };
}

/**
 * Get available categories for flow
 */
export async function getAvailableCategories(): Promise<Array<{
  id: string;
  name: string;
  questionCount: number;
}>> {
  const categories = await prisma.sssCategory.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: { flowQuestions: true }
      }
    },
    where: {
      flowQuestions: {
        some: {
          isActive: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });
  
  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    questionCount: cat._count.flowQuestions
  }));
}

/**
 * Check if user is authenticated (helper)
 */
export function isUserAuthenticated(userId?: string): boolean {
  return !!userId && userId.length > 0;
}
