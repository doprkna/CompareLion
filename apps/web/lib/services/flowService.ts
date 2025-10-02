import { prisma } from '@parel/db/src/client';

/**
 * Get first unanswered question for a user in a leaf (ssscId).
 */
export async function getNextQuestionForUser(ssscId: string, userId: string) {
  const answered = await prisma.userQuestion.findMany({
    where: { userId },
    select: { questionId: true },
  });
  const answeredIds = answered.map(a => a.questionId);
  const [question] = await prisma.question.findMany({
    where: { ssscId, id: { notIn: answeredIds } },
    orderBy: { createdAt: 'asc' },
    take: 1,
  });
  return question;
}

// difficulty -> score mapping
const DIFFICULTY_SCORE: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

/**
 * Mark a question as answered for a user, updating stats atomically.
 */
export async function answerQuestion(userId: string, questionId: string) {
  // Load question difficulty to compute score
  const q = await prisma.question.findUnique({ where: { id: questionId }, select: { difficulty: true } });
  const difficulty = q?.difficulty ?? 'medium';
  const scoreDelta = DIFFICULTY_SCORE[difficulty] ?? 1;

  // Use a transaction to upsert and update user stats safely
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.userQuestion.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });
    if (existing && existing.status === 'answered') {
      // no-op if already answered
      return existing;
    }
    // Upsert to answered
    const upserted = await tx.userQuestion.upsert({
      where: { userId_questionId: { userId, questionId } },
      update: { status: 'answered' },
      create: { userId, questionId, status: 'answered' },
    });
    // Increment user stats if transitioning to answered
    await tx.user.update({
      where: { id: userId },
      data: {
        questionsAnswered: { increment: 1 },
        score: { increment: scoreDelta },
      },
    });
    return upserted;
  });
}

/**
 * Mark a question as skipped for a user.
 */
export async function skipQuestion(userId: string, questionId: string) {
  return prisma.userQuestion.upsert({
    where: { userId_questionId: { userId, questionId } },
    update: { status: 'skipped' },
    create: { userId, questionId, status: 'skipped' },
  });
}

/**
 * Get user progress stats for a leaf: counts of answered, skipped, and current streak
 */
export async function getUserProgressStats(ssscId: string, userId: string): Promise<{ answered: number; skipped: number; streak: number }> {
  const [answered, skipped, history] = await Promise.all([
    prisma.userQuestion.count({ where: { userId, status: 'answered', question: { ssscId } } }),
    prisma.userQuestion.count({ where: { userId, status: 'skipped', question: { ssscId } } }),
    prisma.userQuestion.findMany({
      where: { userId, question: { ssscId } },
      orderBy: { updatedAt: 'desc' },
      select: { status: true }
    }),
  ]);
  let streak = 0;
  for (const h of history) {
    if (h.status === 'answered') streak++;
    else break;
  }
  return { answered, skipped, streak };
}

/**
 * Get first unanswered question for a user by category (hierarchical leaf mapping)
 */
export async function getNextQuestion(userId: string, categoryId: string) {
  return prisma.question.findFirst({
    where: {
      sssc: {
        subSubCategory: {
          subCategory: { categoryId }
        }
      },
      userQuestions: { none: { userId } }
    },
    orderBy: { createdAt: 'asc' }
  });
}
