/**
 * Flow Skeleton - Simple Question Flow
 * Login → Pick Category → Sequential Questions → Result
 * 
 * This is a minimal implementation focusing on core flow mechanics.
 */

import { prisma } from '@/lib/db';

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
  difficulty: string;
  categoryName: string;
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
  // Verify category exists
  const category = await prisma.category.findUnique({
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
 * Get next question in the flow
 */
export async function getNextQuestion(
  userId: string,
  categoryId: string
): Promise<FlowQuestion | null> {
  // Get all questions for category
  const questions = await prisma.question.findMany({
    where: {
      categoryId,
      approved: true
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      text: true,
      difficulty: true
    }
  });
  
  if (questions.length === 0) {
    return null;
  }
  
  // Get questions user has already answered
  const answeredQuestions = await prisma.userQuestion.findMany({
    where: { userId },
    select: { questionId: true }
  });
  
  const answeredIds = new Set(answeredQuestions.map(q => q.questionId));
  
  // Find first unanswered question
  const nextQuestion = questions.find(q => !answeredIds.has(q.id));
  
  if (!nextQuestion) {
    return null; // All questions answered
  }
  
  // Get category name for display
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { name: true }
  });
  
  return {
    id: nextQuestion.id,
    text: nextQuestion.text,
    difficulty: nextQuestion.difficulty || 'medium',
    categoryName: category?.name || 'Unknown'
  };
}

/**
 * Submit an answer to a question
 */
export async function answerQuestion(
  userId: string,
  questionId: string
): Promise<void> {
  // Get question details
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { difficulty: true }
  });
  
  if (!question) {
    throw new Error('Question not found');
  }
  
  // Calculate XP based on difficulty
  const xpGain = {
    easy: 10,
    medium: 20,
    hard: 30
  }[question.difficulty || 'medium'] || 20;
  
  // Record the answer and update user stats in a transaction
  await prisma.$transaction([
    // Mark question as answered
    prisma.userQuestion.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId
        }
      },
      create: {
        userId,
        questionId,
        status: 'answered'
      },
      update: {
        status: 'answered'
      }
    }),
    
    // Update user stats
    prisma.user.update({
      where: { id: userId },
      data: {
        questionsAnswered: { increment: 1 },
        xp: { increment: xpGain },
        lastAnsweredAt: new Date(),
        streakCount: { increment: 1 } // Increment streak
      }
    })
  ]);
}

/**
 * Skip a question
 */
export async function skipQuestion(
  userId: string,
  questionId: string
): Promise<void> {
  // Mark question as skipped
  await prisma.userQuestion.upsert({
    where: {
      userId_questionId: {
        userId,
        questionId
      }
    },
    create: {
      userId,
      questionId,
      status: 'skipped'
    },
    update: {
      status: 'skipped'
    }
  });
  
  // Reset streak when skipping
  await prisma.user.update({
    where: { id: userId },
    data: {
      streakCount: 0 // Break streak on skip
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
  // Get all questions in category
  const totalQuestions = await prisma.question.count({
    where: {
      categoryId,
      approved: true
    }
  });
  
  // Get user's responses
  const userQuestions = await prisma.userQuestion.findMany({
    where: {
      userId,
      question: { categoryId }
    },
    select: { status: true }
  });
  
  const questionsAnswered = userQuestions.filter(q => q.status === 'answered').length;
  const questionsSkipped = userQuestions.filter(q => q.status === 'skipped').length;
  
  // Get user's current stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, streakCount: true }
  });
  
  const xpGained = user?.xp || 0;
  const streakCount = user?.streakCount || 0;
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
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: { questions: true }
      }
    },
    orderBy: { name: 'asc' }
  });
  
  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    questionCount: cat._count.questions
  }));
}

/**
 * Check if user is authenticated (helper)
 */
export function isUserAuthenticated(userId?: string): boolean {
  return !!userId && userId.length > 0;
}


