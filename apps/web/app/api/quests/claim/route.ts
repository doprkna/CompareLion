import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError, validationError } from "@/lib/api-handler";
import { z } from "zod";

const ClaimQuestSchema = z.object({
  userQuestId: z.string().min(1),
});

/**
 * POST /api/quests/claim
 * Grants reward if completed and unclaimed
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
  const parsed = ClaimQuestSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid payload");
  }

  const { userQuestId } = parsed.data;

  // Get user quest
  const userQuest = await prisma.userQuest.findUnique({
    where: { id: userQuestId },
    include: {
      quest: true,
    },
  });

  if (!userQuest) {
    return notFoundError("User quest not found");
  }

  // Verify ownership
  if (userQuest.userId !== user.id) {
    return validationError("Not authorized to claim this quest");
  }

  // Check if completed
  if (!userQuest.isCompleted) {
    return validationError("Quest not completed yet");
  }

  // Check if already claimed
  if (userQuest.isClaimed) {
    return validationError("Reward already claimed");
  }

  const quest = userQuest.quest;

  // Get user details for lore generation
  const userWithDetails = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      username: true,
      name: true,
      settings: true,
      xp: true,
    },
  });

  // Claim rewards in transaction
  await prisma.$transaction(async (tx) => {
    // Mark as claimed
    await tx.userQuest.update({
      where: { id: userQuestId },
      data: {
        isClaimed: true,
      },
    });

    // Award XP (with optional 1% bonus for lore logging enabled)
    if (quest.rewardXP > 0) {
      const baseXP = quest.rewardXP;
      const userSettings = (userWithDetails?.settings as any) || {};
      const loreBonusEnabled = userSettings?.loreLogging !== false; // Default enabled
      const bonusXP = loreBonusEnabled ? Math.floor(baseXP * 0.01) : 0;
      const totalXP = baseXP + bonusXP;

      await tx.user.update({
        where: { id: user.id },
        data: {
          xp: { increment: totalXP },
        },
      });
    }

    // Award gold
    if (quest.rewardGold > 0) {
      await tx.user.update({
        where: { id: user.id },
        data: {
          funds: { increment: quest.rewardGold },
        },
      });
    }

    // Award karma
    if (quest.rewardKarma > 0) {
      await tx.user.update({
        where: { id: user.id },
        data: {
          karmaScore: { increment: quest.rewardKarma },
        },
      });
    }

    // Award badge if specified
    if (quest.rewardBadge) {
      // Find badge by key
      const badge = await tx.badge.findUnique({
        where: { key: quest.rewardBadge },
      });

      if (badge) {
        // Unlock badge if not already unlocked
        const existingBadge = await tx.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId: user.id,
              badgeId: badge.id,
            },
          },
        });

        if (!existingBadge) {
          await tx.userBadge.create({
            data: {
              userId: user.id,
              badgeId: badge.id,
              unlockedAt: new Date(),
              isClaimed: false,
            },
          });
        }
      }
    }
  });

  // Generate lore entry asynchronously (non-blocking)
  let loreEntry = null;
  try {
    // Check if extended lore is needed (story quests)
    const isExtendedLore = quest.type === "story";
    
    // Get user's preferred tone from settings, default to comedic
    const userSettings = (userWithDetails?.settings as any) || {};
    const preferredTone = userSettings?.loreTone || "comedic";
    const displayName = userWithDetails?.username || userWithDetails?.name || "The Traveler";

    // Generate lore text (extended for story/seasonal quests)
    const loreText = generateLoreForQuest(
      quest.title,
      preferredTone as "serious" | "comedic" | "poetic",
      displayName,
      isExtendedLore
    );

    // Create lore entry
    const entryCount = await prisma.userLoreEntry.count({
      where: { userId: user.id },
    });

    if (entryCount >= 50) {
      // Delete oldest entry
      const oldestEntry = await prisma.userLoreEntry.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      });

      if (oldestEntry) {
        await prisma.userLoreEntry.delete({
          where: { id: oldestEntry.id },
        });
      }
    }

    loreEntry = await prisma.userLoreEntry.create({
      data: {
        userId: user.id,
        sourceType: "quest",
        sourceId: quest.id,
        tone: preferredTone as any,
        text: loreText.substring(0, 300),
      },
    });
  } catch (error) {
    // Lore generation failed, but don't block the claim response
    console.error("Failed to generate lore entry:", error);
  }

  return successResponse({
    success: true,
    message: "Reward claimed!",
    rewards: {
      xp: quest.rewardXP,
      gold: quest.rewardGold,
      karma: quest.rewardKarma,
      badge: quest.rewardBadge,
      item: quest.rewardItem,
    },
    lore: loreEntry ? {
      id: loreEntry.id,
      text: loreEntry.text,
      tone: loreEntry.tone,
    } : null,
  });
});

/**
 * Generate lore text for quest completion
 */
function generateLoreForQuest(
  questTitle: string,
  tone: "serious" | "comedic" | "poetic",
  username: string,
  extended: boolean = false
): string {
  const templates = {
    serious: [
      extended 
        ? `The path was long, but ${username} claimed victory. ${questTitle} marked another step forward.`
        : `The path was long, but ${username} claimed victory.`,
      extended
        ? `${username} completed ${questTitle} with resolve. The journey continues.`
        : `${username} completed ${questTitle} with resolve.`,
    ],
    comedic: [
      extended
        ? `${username} finished ${questTitle} without dying of boredom. Impressive. The quest log sighed in relief.`
        : `${username} finished ${questTitle} without dying of boredom. Impressive.`,
      extended
        ? `Somehow, ${username} completed ${questTitle}. The universe shrugged and continued spinning.`
        : `Somehow, ${username} completed ${questTitle}. The universe shrugged.`,
    ],
    poetic: [
      extended
        ? `Dust rose as ${username} marked another step toward eternity. ${questTitle} became part of the legend.`
        : `Dust rose as ${username} marked another step toward eternity.`,
      extended
        ? `Like a phoenix rising, ${username} emerged from ${questTitle}. The story unfolds.`
        : `Like a phoenix rising, ${username} emerged from ${questTitle}.`,
    ],
  };

  const toneTemplates = templates[tone] || templates.comedic;
  return toneTemplates[Math.floor(Math.random() * toneTemplates.length)];
}

