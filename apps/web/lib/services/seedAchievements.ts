/**
 * Seed Core Achievements
 * Creates default achievements for the milestone system
 * v0.36.9 - Achievements & Milestone System
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const CORE_ACHIEVEMENTS = [
  // Combat
  {
    code: 'FIRST_FIGHT',
    key: 'first-fight',
    category: 'combat',
    title: 'First Fight',
    description: 'Win your first fight',
    points: 10,
    icon: '⚔️',
    xpReward: 50,
    rewardGold: 25,
  },
  {
    code: 'TEN_WINS',
    key: 'ten-wins',
    category: 'combat',
    title: 'Ten Wins',
    description: 'Win 10 fights',
    points: 25,
    icon: '🏆',
    xpReward: 150,
    rewardGold: 75,
  },
  {
    code: 'HUNDRED_WINS',
    key: 'hundred-wins',
    category: 'combat',
    title: 'Hundred Wins',
    description: 'Win 100 fights',
    points: 100,
    icon: '👑',
    xpReward: 500,
    rewardGold: 250,
  },
  {
    code: 'GLASS_CANNON',
    key: 'glass-cannon',
    category: 'combat',
    title: 'Glass Cannon',
    description: 'Win a fight with less than 20% HP remaining',
    points: 30,
    icon: '💀',
    xpReward: 100,
    rewardGold: 50,
  },
  {
    code: 'OVERKILL',
    key: 'overkill',
    category: 'combat',
    title: 'Overkill',
    description: 'Deal more than 50 damage in a single hit',
    points: 20,
    icon: '💥',
    xpReward: 75,
    rewardGold: 40,
  },
  // Progress
  {
    code: 'LEVEL_5',
    key: 'level-5',
    category: 'integration',
    title: 'Level 5',
    description: 'Reach level 5',
    points: 15,
    icon: '⭐',
    xpReward: 100,
    rewardGold: 50,
  },
  {
    code: 'LEVEL_10',
    key: 'level-10',
    category: 'integration',
    title: 'Level 10',
    description: 'Reach level 10',
    points: 50,
    icon: '🌟',
    xpReward: 300,
    rewardGold: 150,
  },
  // Economy
  {
    code: 'FIRST_PURCHASE',
    key: 'first-purchase',
    category: 'commerce',
    title: 'First Purchase',
    description: 'Buy your first item from the marketplace',
    points: 15,
    icon: '🛒',
    xpReward: 75,
    rewardGold: 25,
  },
  {
    code: 'THOUSAND_GOLD',
    key: 'thousand-gold',
    category: 'commerce',
    title: 'Thousand Gold',
    description: 'Reach 1000 total gold earned',
    points: 40,
    icon: '💰',
    xpReward: 200,
    rewardGold: 100,
  },
  // Quests
  {
    code: 'FIRST_QUEST',
    key: 'first-quest',
    category: 'integration',
    title: 'First Quest',
    description: 'Complete your first daily quest',
    points: 10,
    icon: '📋',
    xpReward: 50,
    rewardGold: 25,
  },
  {
    code: 'QUEST_STREAK_3',
    key: 'quest-streak-3',
    category: 'integration',
    title: 'Quest Streak 3',
    description: 'Complete daily quests for 3 days in a row',
    points: 25,
    icon: '🔥',
    xpReward: 150,
    rewardGold: 75,
  },
  {
    code: 'QUEST_STREAK_7',
    key: 'quest-streak-7',
    category: 'integration',
    title: 'Quest Streak 7',
    description: 'Complete daily quests for 7 days in a row',
    points: 75,
    icon: '🔥🔥',
    xpReward: 400,
    rewardGold: 200,
  },
  // Enemy System Achievements (v0.36.12)
  {
    code: 'HARD_WIN',
    key: 'hard-win',
    category: 'combat',
    title: 'Hard Victory',
    description: 'Defeat a HARD tier enemy',
    points: 50,
    icon: '⚔️',
    xpReward: 200,
    rewardGold: 100,
  },
  {
    code: 'ELITE_WIN',
    key: 'elite-win',
    category: 'combat',
    title: 'Elite Slayer',
    description: 'Defeat an ELITE tier enemy',
    points: 100,
    icon: '👑',
    xpReward: 500,
    rewardGold: 250,
  },
  {
    code: 'SLAYER',
    key: 'slayer',
    category: 'combat',
    title: 'Slayer',
    description: 'Defeat 50 procedural enemies',
    points: 75,
    icon: '🗡️',
    xpReward: 300,
    rewardGold: 150,
  },
  {
    code: 'ELEMENT_HUNTER',
    key: 'element-hunter',
    category: 'combat',
    title: 'Element Hunter',
    description: 'Defeat one enemy of each elemental variant (Fire, Ice, Shadow, Earth)',
    points: 80,
    icon: '🔥',
    xpReward: 350,
    rewardGold: 175,
  },
];

/**
 * Seed core achievements
 * Creates achievements if they don't already exist
 */
export async function seedCoreAchievements(): Promise<number> {
  let count = 0;

  try {
    for (const achievement of CORE_ACHIEVEMENTS) {
      const existing = await prisma.achievement.findUnique({
        where: { code: achievement.code },
      });

      if (!existing) {
        await prisma.achievement.create({
          data: {
            code: achievement.code,
            key: achievement.key,
            category: achievement.category,
            title: achievement.title,
            description: achievement.description,
            points: achievement.points,
            icon: achievement.icon,
            emoji: achievement.icon,
            xpReward: achievement.xpReward,
            rewardGold: achievement.rewardGold,
          },
        });
        count++;
      }
    }

    logger.info(`[SeedAchievements] Seeded ${count} core achievements`);
    return count;
  } catch (error) {
    logger.error('[SeedAchievements] Failed to seed achievements', error);
    throw error;
  }
}

