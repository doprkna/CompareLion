import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { addHearts, getUserEnergy } from "@/lib/energy";
import { publishEvent } from "@/lib/realtime";
import { logQuizToFeed } from "@/lib/feed";
import { notify } from "@/lib/notify";

/**
 * POST /api/quiz/submit
 * Submit daily quiz answers
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { quizId, answers } = body; // answers: { questionId: optionId }

    if (!quizId || !answers) {
      return NextResponse.json(
        { error: "quizId and answers required" },
        { status: 400 }
      );
    }

    // Get quiz
    const quiz = await prisma.dailyQuiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
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
      return NextResponse.json(
        { error: "Quiz already completed" },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      message: "Quiz completed!",
      results: {
        score,
        totalQuestions,
        xpAwarded,
        heartsAwarded,
      },
      energy: energyStatus,
    });
  } catch (error) {
    console.error("[API] Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}











