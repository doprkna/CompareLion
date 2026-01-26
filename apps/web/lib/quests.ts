/**
 * Daily Quest System
 * 
 * Dynamic rotating missions with rewards.
 */

import { prisma } from "@/lib/db";
import { publishEvent } from "@/lib/realtime";
import { createFeedItem } from "@/lib/feed";
import { logActivity } from "@/lib/activity";
import { notify } from "@/lib/notify";
import { logger } from "@/lib/logger";
import { checkAndUnlockAchievements } from "./services/achievementChecker";

export interface QuestTemplate {
  type: string;
  title: string;
  objective: string;
  targetCount: number;
  rewardXp: number;
  rewardGold: number;
  dropChance?: number;
}

const QUEST_TEMPLATES: QuestTemplate[] = [
  { type: "answer_questions", title: "Question Master", objective: "Answer 5 questions", targetCount: 5, rewardXp: 75, rewardGold: 50 },
  { type: "answer_questions", title: "Quiz Enthusiast", objective: "Answer 10 questions", targetCount: 10, rewardXp: 150, rewardGold: 100, dropChance: 10 },
  { type: "complete_challenge", title: "Challenge Accepted", objective: "Complete 1 challenge", targetCount: 1, rewardXp: 100, rewardGold: 75 },
  { type: "complete_challenge", title: "Challenge Seeker", objective: "Complete 3 challenges", targetCount: 3, rewardXp: 250, rewardGold: 150, dropChance: 20 },
  { type: "trade_item", title: "Merchant", objective: "Buy or sell 1 item", targetCount: 1, rewardXp: 50, rewardGold: 30 },
  { type: "trade_item", title: "Trader", objective: "Buy or sell 3 items", targetCount: 3, rewardXp: 120, rewardGold: 80, dropChance: 15 },
  { type: "send_messages", title: "Social", objective: "Send 3 messages", targetCount: 3, rewardXp: 40, rewardGold: 20 },
  { type: "send_messages", title: "Chatterbox", objective: "Send 10 messages", targetCount: 10, rewardXp: 100, rewardGold: 50, dropChance: 5 },
  { type: "win_duel", title: "Duelist", objective: "Win 1 duel", targetCount: 1, rewardXp: 150, rewardGold: 100, dropChance: 25 },
  { type: "craft_item", title: "Craftsman", objective: "Craft 1 item", targetCount: 1, rewardXp: 80, rewardGold: 60, dropChance: 15 },
];

/**
 * Generate daily quests (run via cron)
 */
export async function generateDailyQuests(): Promise<void> {
  if (!prisma) {
    logger.warn("[Quests] Prisma client not available - skipping quest generation");
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Check if quests already exist for today
  const existing = await prisma.dailyQuest.findFirst({
    where: {
      date: { gte: today },
      expiresAt: { gte: new Date() },
    },
  });

  if (existing) {
    return;
  }

  // Select 3 random quest templates
  const shuffled = [...QUEST_TEMPLATES].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  for (const template of selected) {
    await prisma.dailyQuest.create({
      data: {
        date: today,
        type: template.type,
        title: template.title,
        objective: template.objective,
        targetCount: template.targetCount,
        rewardXp: template.rewardXp,
        rewardGold: template.rewardGold,
        dropChance: template.dropChance || 0,
        expiresAt: tomorrow,
      },
    });
  }

}

/**
 * Get today's active quests
 */
export async function getTodayQuests() {
  if (!prisma) {
    logger.warn("[Quests] Prisma client not available - returning empty quests");
    return [];
  }

  const now = new Date();
  
  return await prisma.dailyQuest.findMany({
    where: {
      expiresAt: { gte: now },
    },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Get user's quest progress
 */
export async function getUserQuestProgress(userId: string) {
  const quests = await getTodayQuests();
  
  const progress = await Promise.all(
    quests.map(async (quest) => {
      const completion = await prisma.questCompletion.findUnique({
        where: {
          userId_questId: {
            userId,
            questId: quest.id,
          },
        },
      });

      return {
        quest,
        progress: completion?.progress || 0,
        completed: completion?.completed || false,
        itemDropped: completion?.itemDropped,
      };
    })
  );

  return progress;
}

/**
 * Update quest progress
 */
export async function updateQuestProgress(
  userId: string,
  questType: string,
  increment: number = 1
): Promise<void> {
  const quests = await prisma.dailyQuest.findMany({
    where: {
      type: questType,
      expiresAt: { gte: new Date() },
    },
  });

  for (const quest of quests) {
    const completion = await prisma.questCompletion.upsert({
      where: {
        userId_questId: { userId, questId: quest.id },
      },
      update: {
        progress: { increment },
      },
      create: {
        userId,
        questId: quest.id,
        progress: increment,
      },
    });

    // Check if quest is now complete
    if (completion.progress + increment >= quest.targetCount && !completion.completed) {
      await completeQuest(userId, quest.id);
    }
  }
}

/**
 * Complete a quest and award rewards
 */
export async function completeQuest(userId: string, questId: string): Promise<any> {
  const quest = await prisma.dailyQuest.findUnique({
    where: { id: questId },
  });

  if (!quest) {
    throw new Error("Quest not found");
  }

  const completion = await prisma.questCompletion.findUnique({
    where: {
      userId_questId: { userId, questId },
    },
  });

  if (completion?.completed) {
    throw new Error("Quest already completed");
  }

  // Award rewards
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: { increment: quest.rewardXp },
      funds: { increment: quest.rewardGold },
    },
  });

  // Roll for item drop (v0.36.34 - Use UserItem)
  let itemDropped: string | null = null;
  if (quest.rewardItem && quest.dropChance > 0) {
    const roll = Math.random() * 100;
    if (roll < quest.dropChance) {
      itemDropped = quest.rewardItem;
      
      // Add item to inventory using standardized function
      const { addItemToInventory } = await import('@/lib/services/itemService');
      await addItemToInventory(userId, quest.rewardItem, 1);
    }
  }

  // Mark as completed
  await prisma.questCompletion.update({
    where: {
      userId_questId: { userId, questId },
    },
    data: {
      completed: true,
      completedAt: new Date(),
      itemDropped,
    },
  });

  // Notify user
  await notify(
    userId,
    "quest_complete",
    `Quest Complete: ${quest.title}!`,
    `Earned +${quest.rewardXp} XP, +${quest.rewardGold} gold${itemDropped ? " + bonus item!" : ""}`
  );

  // Log activity
  await logActivity(userId, "quest_complete", `Completed: ${quest.title}`, quest.objective);

  // Check if all quests completed
  const allQuests = await getTodayQuests();
  const allCompletions = await prisma.questCompletion.findMany({
    where: { userId, completed: true },
  });

  if (allCompletions.length === allQuests.length) {
    // Bonus for completing all quests
    await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: 100 } },
    });

    await notify(userId, "all_quests_complete", "All Quests Complete! 🎯", "Bonus: +100 XP");

    // Log to feed
    await createFeedItem({
      type: "quest_complete_all",
      title: "Completed all daily quests!",
      description: "🎯 Perfect daily missions",
      userId,
      metadata: { bonusXp: 100 },
    });
  }

  // Publish event
  await publishEvent("quest:completed", {
    userId,
    questId,
    title: quest.title,
    rewards: { xp: quest.rewardXp, gold: quest.rewardGold, itemDropped },
  });

  // Check achievements for quest completion
  // Get user streak (approximate from lastAnsweredAt or streakCount)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streakCount: true },
  });

  await checkAndUnlockAchievements(userId, {
    questCompleted: true,
    streak: user?.streakCount || 0,
  });

  return {
    quest,
    rewards: {
      xp: quest.rewardXp,
      gold: quest.rewardGold,
      itemDropped,
    },
  };
}



