/**
 * Prediction Battles Service v1
 * Forecast outcomes, resolve later, track accuracy and streaks
 */

import { prisma } from '@/lib/db';

export interface PredictionQuestionDto {
  id: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  options: string[];
  correctOptionIdx: number | null;
  resolutionDate: Date | null;
  status: string;
  resolvedAt: Date | null;
  createdAt: Date;
}

export interface UserPredictionStats {
  accuracy: number;
  correctCount: number;
  resolvedCount: number;
  correctStreak: number;
  longestStreak: number;
}

/** Submit a prediction answer. Idempotent via upsert. */
export async function submitPredictionAnswer(
  userId: string,
  predictionId: string,
  selectedOptionIdx: number
): Promise<{ success: boolean; error?: string }> {
  const prediction = await prisma.predictionQuestion.findUnique({
    where: { id: predictionId },
    select: { id: true, status: true, options: true },
  });
  if (!prediction) return { success: false, error: 'Prediction not found' };
  if (prediction.status !== 'open') return { success: false, error: 'Prediction is no longer open' };
  const maxIdx = (prediction.options?.length ?? 1) - 1;
  if (selectedOptionIdx < 0 || selectedOptionIdx > maxIdx) return { success: false, error: 'Invalid option' };

  await prisma.predictionAnswer.upsert({
    where: { userId_predictionId: { userId, predictionId } },
    create: { userId, predictionId, selectedOptionIdx },
    update: { selectedOptionIdx },
  });
  return { success: true };
}

/** Resolve a prediction and update all user accuracy/streaks. */
export async function resolvePrediction(
  predictionId: string,
  correctOptionIdx: number,
  resolvedBy: string
): Promise<{ success: boolean; error?: string; updatedCount?: number }> {
  const prediction = await prisma.predictionQuestion.findUnique({
    where: { id: predictionId },
    include: { answers: true },
  });
  if (!prediction) return { success: false, error: 'Prediction not found' };
  if (prediction.status === 'resolved') return { success: false, error: 'Already resolved' };

  const maxIdx = (prediction.options?.length ?? 1) - 1;
  if (correctOptionIdx < 0 || correctOptionIdx > maxIdx) return { success: false, error: 'Invalid correct option' };

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.predictionQuestion.update({
      where: { id: predictionId },
      data: {
        status: 'resolved',
        correctOptionIdx,
        resolvedAt: now,
        resolvedBy,
      },
    });

    for (const ans of prediction.answers) {
      const isCorrect = ans.selectedOptionIdx === correctOptionIdx;
      const user = await tx.user.findUnique({
        where: { id: ans.userId },
        select: { predictionCorrectCount: true, predictionResolvedCount: true },
      });
      if (!user) continue;

      const newCorrect = user.predictionCorrectCount + (isCorrect ? 1 : 0);
      const newResolved = user.predictionResolvedCount + 1;

      await tx.user.update({
        where: { id: ans.userId },
        data: {
          predictionCorrectCount: newCorrect,
          predictionResolvedCount: newResolved,
        },
      });

      const streak = await tx.userStreak.findUnique({ where: { userId: ans.userId } });
      let newCorrectStreak = streak?.predictionCorrectStreak ?? 0;
      let newLongest = streak?.predictionLongestStreak ?? 0;
      if (isCorrect) {
        newCorrectStreak += 1;
        newLongest = Math.max(newLongest, newCorrectStreak);
      } else {
        newCorrectStreak = 0;
      }

      await tx.userStreak.upsert({
        where: { userId: ans.userId },
        create: {
          userId: ans.userId,
          predictionCorrectStreak: newCorrectStreak,
          predictionLongestStreak: newLongest,
        },
        update: {
          predictionCorrectStreak: newCorrectStreak,
          predictionLongestStreak: newLongest,
        },
      });
    }
  });

  return { success: true, updatedCount: prediction.answers.length };
}

/** Get prediction questions (open by default). */
export async function getPredictionQuestions(options?: {
  status?: 'open' | 'closed' | 'resolved';
  categoryId?: string;
  limit?: number;
}): Promise<PredictionQuestionDto[]> {
  const where: Record<string, unknown> = {};
  if (options?.status) where.status = options.status;
  else where.status = 'open';
  if (options?.categoryId) where.categoryId = options.categoryId;

  const items = await prisma.predictionQuestion.findMany({
    where,
    orderBy: [{ resolutionDate: 'asc' }, { createdAt: 'desc' }],
    take: options?.limit ?? 50,
  });

  return items.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    categoryId: q.categoryId,
    options: q.options ?? [],
    correctOptionIdx: q.correctOptionIdx,
    resolutionDate: q.resolutionDate,
    status: q.status,
    resolvedAt: q.resolvedAt,
    createdAt: q.createdAt,
  }));
}

/** Get user prediction stats. */
export async function getUserPredictionStats(userId: string): Promise<UserPredictionStats> {
  const [user, streak] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { predictionCorrectCount: true, predictionResolvedCount: true },
    }),
    prisma.userStreak.findUnique({
      where: { userId },
      select: { predictionCorrectStreak: true, predictionLongestStreak: true },
    }),
  ]);

  const resolved = user?.predictionResolvedCount ?? 0;
  const correct = user?.predictionCorrectCount ?? 0;
  return {
    accuracy: resolved > 0 ? correct / resolved : 0,
    correctCount: correct,
    resolvedCount: resolved,
    correctStreak: streak?.predictionCorrectStreak ?? 0,
    longestStreak: streak?.predictionLongestStreak ?? 0,
  };
}

/** Get leaderboard. Sort by accuracy (min 3 resolved), then by resolved count, then streak. */
export async function getPredictionLeaderboard(options?: {
  categoryId?: string;
  limit?: number;
}): Promise<Array<{ userId: string; accuracy: number; correctCount: number; resolvedCount: number; correctStreak: number; longestStreak: number }>> {
  const minResolved = 3;
  const limit = options?.limit ?? 20;

  const users = await prisma.user.findMany({
    where: { predictionResolvedCount: { gte: minResolved } },
    select: {
      id: true,
      predictionCorrectCount: true,
      predictionResolvedCount: true,
      userStreak: {
        select: { predictionCorrectStreak: true, predictionLongestStreak: true },
      },
    },
    orderBy: [
      { predictionResolvedCount: 'desc' },
      { predictionCorrectCount: 'desc' },
    ],
  });

  const scored = users
    .map((u) => ({
      userId: u.id,
      accuracy: u.predictionResolvedCount > 0 ? u.predictionCorrectCount / u.predictionResolvedCount : 0,
      correctCount: u.predictionCorrectCount,
      resolvedCount: u.predictionResolvedCount,
      correctStreak: u.userStreak?.predictionCorrectStreak ?? 0,
      longestStreak: u.userStreak?.predictionLongestStreak ?? 0,
    }))
    .sort((a, b) => {
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      if (b.resolvedCount !== a.resolvedCount) return b.resolvedCount - a.resolvedCount;
      return (b.correctStreak ?? 0) - (a.correctStreak ?? 0);
    });

  return scored.slice(0, limit);
}
