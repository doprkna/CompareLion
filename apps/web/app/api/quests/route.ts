import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse } from "@/lib/api-handler";

/**
 * GET /api/quests
 * Lists active quests with progress + status for current user
 * Optional query param: ?includeLore=true to include associated lore snippets
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const searchParams = req.nextUrl.searchParams;
  const includeLore = searchParams.get("includeLore") === "true";
  
  // Get all active quests
  const quests = await prisma.quest.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      { type: "asc" },
      { createdAt: "asc" },
    ],
  });

  // If user is authenticated, include their progress
  let userQuests: Record<string, { progress: number; isCompleted: boolean; isClaimed: boolean }> = {};

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (user) {
      const       userQuestData = await prisma.userQuest.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          questId: true,
          progress: true,
          isCompleted: true,
          isClaimed: true,
        },
      });

      userQuests = userQuestData.reduce((acc, uq) => {
        acc[uq.questId] = {
          id: uq.id,
          progress: uq.progress,
          isCompleted: uq.isCompleted,
          isClaimed: uq.isClaimed,
        };
        return acc;
      }, {} as Record<string, { id: string; progress: number; isCompleted: boolean; isClaimed: boolean }>);
    }
  }

  // Get lore entries if requested
  let loreByQuestId: Record<string, { text: string; tone: string }> = {};
  if (includeLore && session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (user) {
      const loreEntries = await prisma.userLoreEntry.findMany({
        where: {
          userId: user.id,
          sourceType: "quest",
          sourceId: { in: quests.map(q => q.id) },
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
  }

  // Map quests with progress status
  const questsWithStatus = quests.map((quest) => {
    const userQuest = userQuests[quest.id];
    const progress = userQuest?.progress || 0;
    const isCompleted = userQuest?.isCompleted || false;
    const isClaimed = userQuest?.isClaimed || false;
    const progressPercent = quest.requirementValue > 0 
      ? Math.min(100, Math.floor((progress / quest.requirementValue) * 100))
      : 0;

    return {
      id: quest.id,
      questId: quest.id,
      userQuestId: userQuest?.id || null,
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
      isRepeatable: quest.isRepeatable,
      progress,
      progressPercent,
      isCompleted,
      isClaimed,
      canClaim: isCompleted && !isClaimed,
      lore: includeLore ? loreByQuestId[quest.id] || null : null,
    };
  });

  return successResponse({
    quests: questsWithStatus,
    total: questsWithStatus.length,
  });
});

