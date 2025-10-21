import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { getTodayQuests, getUserQuestProgress, generateDailyQuests } from "@/lib/quests";

export async function GET(req: NextRequest) {
  try {
    // Ensure quests exist for today
    await generateDailyQuests();

    const quests = await getTodayQuests();

    let userProgress: any[] = [];
    let completedCount = 0;

    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user) {
        userProgress = await getUserQuestProgress(user.id);
        completedCount = userProgress.filter((p) => p.completed).length;
      }
    }

    // Get total completions across all users
    const totalCompletions = await prisma.questCompletion.count({
      where: {
        questId: { in: quests.map((q) => q.id) },
        completed: true,
      },
    });

    return NextResponse.json({
      success: true,
      quests: userProgress.length > 0 ? userProgress : quests.map((q) => ({ quest: q, progress: 0, completed: false })),
      completedCount,
      totalQuests: quests.length,
      communityCompletions: totalCompletions,
    });
  } catch (error) {
    console.error("[API Error][quests/today]", error);
    return NextResponse.json(
      { error: "Failed to fetch today's quests" },
      { status: 500 }
    );
  }
}



