import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError } from "@/lib/api-handler";

/**
 * GET /api/quests/active
 * Returns user's current quests grouped by type
 * Optional query param: ?includeLore=true to include associated lore snippets
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const searchParams = req.nextUrl.searchParams;
  const includeLore = searchParams.get("includeLore") === "true";
  if (!session?.user?.email) {
    return authError("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return notFoundError("User");
  }

  // Get user's active quests (not completed or repeatable)
  const userQuests = await prisma.userQuest.findMany({
    where: {
      userId: user.id,
      OR: [
        { isCompleted: false },
        { 
          isCompleted: true,
          quest: {
            isRepeatable: true,
          },
        },
      ],
    },
    include: {
      quest: true,
    },
    orderBy: [
      { quest: { type: "asc" } },
      { startedAt: "desc" },
    ],
  });

  // Get lore entries if requested
  let loreByQuestId: Record<string, { text: string; tone: string }> = {};
  if (includeLore) {
    const loreEntries = await prisma.userLoreEntry.findMany({
      where: {
        userId: user.id,
        sourceType: "quest",
        sourceId: { in: userQuests.map(uq => uq.questId) },
      },
      select: {
        sourceId: true,
        text: true,
        tone: true,
      },
    });

    loreByQuestId = loreEntries.reduce((acc, entry) => {
      if (entry.sourceId) {
        acc[entry.sourceId] = {
          text: entry.text,
          tone: entry.tone,
        };
      }
      return acc;
    }, {} as Record<string, { text: string; tone: string }>);
  }

  // Group by type
  const grouped: Record<string, any[]> = {
    daily: [],
    weekly: [],
    story: [],
    side: [],
  };

  userQuests.forEach((uq) => {
    const quest = uq.quest;
    const progressPercent = quest.requirementValue > 0
      ? Math.min(100, Math.floor((uq.progress / quest.requirementValue) * 100))
      : 0;

    grouped[quest.type].push({
      id: uq.id,
      questId: quest.id,
      key: quest.key,
      title: quest.title,
      description: quest.description,
      type: quest.type,
      requirementType: quest.requirementType,
      requirementValue: quest.requirementValue,
      rewardXP: quest.rewardXP,
      rewardGold: quest.rewardGold,
      rewardItem: quest.rewardItem,
      rewardBadge: quest.rewardBadge,
      rewardKarma: quest.rewardKarma,
      progress: uq.progress,
      progressPercent,
      isCompleted: uq.isCompleted,
      isClaimed: uq.isClaimed,
      canClaim: uq.isCompleted && !uq.isClaimed,
      startedAt: uq.startedAt,
      completedAt: uq.completedAt,
      lore: includeLore ? loreByQuestId[quest.id] || null : null,
    });
  });

  return successResponse({
    success: true,
    quests: grouped,
    totals: {
      daily: grouped.daily.length,
      weekly: grouped.weekly.length,
      story: grouped.story.length,
      side: grouped.side.length,
    },
  });
});

