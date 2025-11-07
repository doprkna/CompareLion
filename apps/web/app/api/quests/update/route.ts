import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError, validationError } from "@/lib/api-handler";
import { z } from "zod";
import { notify } from "@/lib/notify";

const UpdateQuestSchema = z.object({
  requirementType: z.enum(["xp", "reflections", "gold", "missions", "custom"]),
  amount: z.number().int().positive(),
});

/**
 * POST /api/quests/update
 * Increments progress based on triggered event (e.g., reflection added)
 * Called automatically by event hooks
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
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

  const body = await req.json().catch(() => ({}));
  const parsed = UpdateQuestSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid payload");
  }

  const { requirementType, amount } = parsed.data;

  // Find all active quests matching this requirement type
  const matchingQuests = await prisma.quest.findMany({
    where: {
      isActive: true,
      requirementType,
    },
  });

  if (matchingQuests.length === 0) {
    return successResponse({
      success: true,
      updated: 0,
      completed: [],
      message: "No matching quests found",
    });
  }

  const completedQuests: string[] = [];
  let updatedCount = 0;

  // Update progress for each matching quest
  for (const quest of matchingQuests) {
    // Get or create user quest
    let userQuest = await prisma.userQuest.findUnique({
      where: {
        userId_questId: {
          userId: user.id,
          questId: quest.id,
        },
      },
    });

    if (!userQuest) {
      // Create new user quest if not exists
      userQuest = await prisma.userQuest.create({
        data: {
          userId: user.id,
          questId: quest.id,
          progress: 0,
          isCompleted: false,
          isClaimed: false,
          startedAt: new Date(),
        },
      });
    }

    // Skip if already completed and not repeatable
    if (userQuest.isCompleted && !quest.isRepeatable) {
      continue;
    }

    // Update progress
    const newProgress = Math.min(
      quest.requirementValue,
      userQuest.progress + amount
    );

    const isNowCompleted = newProgress >= quest.requirementValue && !userQuest.isCompleted;

    await prisma.userQuest.update({
      where: {
        userId_questId: {
          userId: user.id,
          questId: quest.id,
        },
      },
      data: {
        progress: newProgress,
        isCompleted: isNowCompleted,
        completedAt: isNowCompleted ? new Date() : userQuest.completedAt,
      },
    });

    updatedCount++;

    // Send notification if completed
    if (isNowCompleted) {
      await notify(
        user.id,
        "quest_completed",
        `🎯 Quest completed: ${quest.title}`,
        `You've completed "${quest.title}"! Claim your reward.`
      );
      completedQuests.push(quest.id);
    }
  }

  return successResponse({
    success: true,
    updated: updatedCount,
    completed: completedQuests,
    message: "Quest progress updated",
  });
});

