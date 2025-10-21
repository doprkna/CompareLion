import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { getUserEnergy } from "@/lib/energy";

/**
 * GET /api/quiz/today
 * Get today's daily quiz
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create today's quiz
    let quiz = await prisma.dailyQuiz.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!quiz) {
      // Create today's quiz with 3 random questions
      const allQuestions = await prisma.flowQuestion.findMany({
        where: {
          locale: "en", // Could be made dynamic
        },
        select: {
          id: true,
        },
      });

      if (allQuestions.length < 3) {
        return NextResponse.json(
          { error: "Not enough questions available" },
          { status: 500 }
        );
      }

      // Shuffle and pick 3
      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      const selectedIds = shuffled.slice(0, 3).map((q) => q.id);

      quiz = await prisma.dailyQuiz.create({
        data: {
          date: today,
          questionIds: selectedIds,
          rewardXp: 50,
          rewardHearts: 1,
        },
      });
    }

    // Get the actual questions
    const questions = await prisma.flowQuestion.findMany({
      where: {
        id: {
          in: quiz.questionIds,
        },
      },
      include: {
        options: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    // Check if user has already completed today's quiz
    let hasCompleted = false;
    let userScore: number | null = null;
    let energyStatus = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user) {
        const completion = await prisma.dailyQuizCompletion.findUnique({
          where: {
            userId_quizId: {
              userId: user.id,
              quizId: quiz.id,
            },
          },
        });

        hasCompleted = !!completion;
        userScore = completion?.score || null;

        // Get energy status
        energyStatus = await getUserEnergy(user.id);
      }
    }

    return NextResponse.json({
      success: true,
      quiz: {
        id: quiz.id,
        date: quiz.date,
        rewardXp: quiz.rewardXp,
        rewardHearts: quiz.rewardHearts,
        completions: quiz.completions,
        hasCompleted,
        userScore,
      },
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options.map((opt) => ({
          id: opt.id,
          label: opt.label,
          value: opt.value,
        })),
      })),
      energy: energyStatus,
    });
  } catch (error) {
    console.error("[API] Error fetching today's quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}











