import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeAsync, unauthorizedError, successResponse } from "@/lib/api-handler";

/**
 * POST /api/cron/quests/reset
 * Resets daily/weekly quests automatically
 * Story quests are immune to resets
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get("x-cron-token");
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError("Invalid token");
  }

  const now = new Date();
  let resetCount = 0;

  // Get all users with active daily/weekly quests
  const usersWithQuests = await prisma.userQuest.findMany({
    where: {
      quest: {
        type: {
          in: ["daily", "weekly"],
        },
        isActive: true,
      },
    },
    select: {
      userId: true,
      questId: true,
      quest: {
        select: {
          type: true,
        },
      },
    },
    distinct: ["userId"],
  });

  const userIds = [...new Set(usersWithQuests.map((uq) => uq.userId))];

  for (const userId of userIds) {
    // Get user's daily/weekly quests
    const userQuests = await prisma.userQuest.findMany({
      where: {
        userId,
        quest: {
          type: {
            in: ["daily", "weekly"],
          },
          isActive: true,
        },
      },
      include: {
        quest: true,
      },
    });

    for (const userQuest of userQuests) {
      const quest = userQuest.quest;

      // Check if quest should be reset based on type
      let shouldReset = false;

      if (quest.type === "daily") {
        // Daily quests reset every day
        const lastReset = userQuest.startedAt;
        const daysSinceReset = Math.floor(
          (now.getTime() - lastReset.getTime()) / (24 * 60 * 60 * 1000)
        );
        shouldReset = daysSinceReset >= 1;
      } else if (quest.type === "weekly") {
        // Weekly quests reset every 7 days
        const lastReset = userQuest.startedAt;
        const daysSinceReset = Math.floor(
          (now.getTime() - lastReset.getTime()) / (24 * 60 * 60 * 1000)
        );
        shouldReset = daysSinceReset >= 7;
      }

      if (shouldReset) {
        // Reset quest progress
        await prisma.userQuest.update({
          where: {
            userId_questId: {
              userId,
              questId: quest.id,
            },
          },
          data: {
            progress: 0,
            isCompleted: false,
            isClaimed: false,
            startedAt: now,
            completedAt: null,
          },
        });

        resetCount++;
      }
    }
  }

  return successResponse({
    success: true,
    reset: resetCount,
    usersProcessed: userIds.length,
    message: "Quest reset completed",
  });
});

