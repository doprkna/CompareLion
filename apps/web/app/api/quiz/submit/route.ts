import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { addHearts, getUserEnergy } from "@/lib/energy";
import { publishEvent } from "@/lib/realtime";
import { logQuizToFeed } from "@/lib/feed";
import { notify } from "@/lib/notify";
import { safeAsync, successResponse, unauthorizedError, notFoundError, validationError } from "@/lib/api-handler";
import { attack, getPowerBonus } from "@/lib/services/combatService";
import { logger } from '@parel/core/utils/debug';

/**
 * POST /api/quiz/submit
 * Submit daily quiz answers
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return notFoundError('User');
  }

  const body = await req.json();
  const { quizId, answers } = body; // answers: { questionId: optionId }

  if (!quizId || !answers) {
    return validationError('quizId and answers required');
  }

  // Get quiz
  const quiz = await prisma.dailyQuiz.findUnique({
    where: { id: quizId },
  });

  if (!quiz) {
    return notFoundError('Quiz');
  }

  // Check if already completed
  const existing = await prisma.dailyQuizCompletion.findUnique({
    where: {
      userId_quizId: {
        userId: user.id,
        quizId: quiz.id,
      },
    },
  });

  if (existing) {
    return validationError('Quiz already completed');
  }

    // Get questions and check answers
    const questions = await prisma.flowQuestion.findMany({
      where: {
        id: {
          in: quiz.questionIds,
        },
      },
      include: {
        options: true,
      },
    });

    let correctCount = 0;

    for (const question of questions) {
      const userAnswerId = answers[question.id];
      if (!userAnswerId) continue;

      // For now, we don't have a "correct" field in options
      // So we'll just count if they answered (could be enhanced later)
      // In a real scenario, you'd check: option.isCorrect === true
      const option = question.options.find((opt) => opt.id === userAnswerId);
      if (option) {
        correctCount++; // Placeholder: all answers count as correct for now
      }
    }

    const score = correctCount;
    const totalQuestions = questions.length;

    // Create completion record
    await prisma.dailyQuizCompletion.create({
      data: {
        userId: user.id,
        quizId: quiz.id,
        score,
      },
    });

    // Update quiz completions count
    await prisma.dailyQuiz.update({
      where: { id: quiz.id },
      data: {
        completions: { increment: 1 },
      },
    });

    // Award rewards
    const xpAwarded = quiz.rewardXp;
    const heartsAwarded = quiz.rewardHearts;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        xp: { increment: xpAwarded },
      },
    });

    await addHearts(user.id, heartsAwarded);

    // 🎮 Trigger combat attack on quiz completion (fire-and-forget)
    getPowerBonus(user.id)
      .then(powerBonus => attack(user.id, powerBonus))
      .catch(err => logger.debug('[QUIZ] Combat trigger failed', err));

    // Send notification
    await notify(
      user.id,
      "quiz_complete",
      "Daily Quiz Completed!",
      `You scored ${score}/${totalQuestions}! Earned +${xpAwarded} XP and +${heartsAwarded} ❤️`
    );

    // Log to feed
    await logQuizToFeed(user.id, "Daily Quiz", score, totalQuestions);

    // Publish real-time event
    await publishEvent("quiz:completed", {
      userId: user.id,
      userName: user.name || user.email,
      score,
      totalQuestions,
    });

  // Get updated energy status
  const energyStatus = await getUserEnergy(user.id);

  return successResponse({
    results: {
      score,
      totalQuestions,
      xpAwarded,
      heartsAwarded,
    },
    energy: energyStatus,
  }, 'Quiz completed!');
});













