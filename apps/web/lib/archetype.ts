/**
 * Archetype Evolution System
 * 
 * Determines user archetype based on stat distribution.
 * Passive bonuses for specialized builds.
 */

import { prisma } from "@/lib/db";
import { publishEvent } from "@/lib/realtime";
import { notify } from "@/lib/notify";

export interface Archetype {
  id: string;
  name: string;
  emoji: string;
  description: string;
  primaryStat: string; // Which stat triggers this
  condition: string; // Human-readable condition
  xpBonus: number; // % bonus on related actions
  bonusActions: string[]; // Which actions get the bonus
}

// ============================================================================
// ARCHETYPE DEFINITIONS
// ============================================================================

export const ARCHETYPES: Archetype[] = [
  // Specialized Archetypes (based on highest stat)
  {
    id: "scholar",
    name: "The Scholar",
    emoji: "📚",
    description: "Master of knowledge and wisdom",
    primaryStat: "knowledge",
    condition: "Highest Knowledge stat",
    xpBonus: 5,
    bonusActions: ["question_answer", "flow_complete", "achievement_unlock"],
  },
  {
    id: "bard",
    name: "The Bard",
    emoji: "🎭",
    description: "Charismatic social butterfly",
    primaryStat: "social",
    condition: "Highest Social stat",
    xpBonus: 5,
    bonusActions: ["message_send", "friend_add", "challenge_complete"],
  },
  {
    id: "artist",
    name: "The Artist",
    emoji: "🎨",
    description: "Creative visionary",
    primaryStat: "creativity",
    condition: "Highest Creativity stat",
    xpBonus: 5,
    bonusActions: ["challenge_create", "unique_answer", "item_craft"],
  },
  {
    id: "warrior",
    name: "The Warrior",
    emoji: "⚔️",
    description: "Physically strong and resilient",
    primaryStat: "health",
    condition: "Highest Health stat",
    xpBonus: 5,
    bonusActions: ["duel_win", "challenge_accept", "streak_maintain"],
  },
  {
    id: "dreamer",
    name: "The Dreamer",
    emoji: "💤",
    description: "Rested and contemplative",
    primaryStat: "sleep",
    condition: "Highest Sleep stat",
    xpBonus: 5,
    bonusActions: ["daily_login", "reflection_complete", "meditation"],
  },

  // Balanced Archetypes
  {
    id: "adventurer",
    name: "The Adventurer",
    emoji: "🧙",
    description: "Balanced explorer of all paths",
    primaryStat: "balanced",
    condition: "All stats within 10 points of each other",
    xpBonus: 3,
    bonusActions: ["any"],
  },
  {
    id: "polymath",
    name: "The Polymath",
    emoji: "🌟",
    description: "Renaissance individual, master of many",
    primaryStat: "balanced_high",
    condition: "All stats above 50, balanced",
    xpBonus: 7,
    bonusActions: ["any"],
  },

  // Specialized Combinations
  {
    id: "sage",
    name: "The Sage",
    emoji: "🧙‍♂️",
    description: "Wise and creative thinker",
    primaryStat: "knowledge_creativity",
    condition: "High Knowledge + Creativity",
    xpBonus: 6,
    bonusActions: ["question_answer", "challenge_create", "unique_answer"],
  },
  {
    id: "diplomat",
    name: "The Diplomat",
    emoji: "🤝",
    description: "Social and knowledgeable peacemaker",
    primaryStat: "social_knowledge",
    condition: "High Social + Knowledge",
    xpBonus: 6,
    bonusActions: ["message_send", "friend_add", "conflict_resolve"],
  },
];

// ============================================================================
// ARCHETYPE DETECTION
// ============================================================================

export interface UserStats {
  sleep: number;
  health: number;
  social: number;
  knowledge: number;
  creativity: number;
}

/**
 * Detect archetype based on stat distribution
 */
export function detectArchetype(stats: UserStats): Archetype {
  const { sleep, health, social, knowledge, creativity } = stats;

  // Find highest stat
  const statValues = { sleep, health, social, knowledge, creativity };
  const entries = Object.entries(statValues);
  const maxValue = Math.max(...entries.map(([_, v]) => v));
  const highestStats = entries.filter(([_, v]) => v === maxValue).map(([k]) => k);

  // Check if all stats are high and balanced (Polymath)
  const allHigh = Object.values(statValues).every((v) => v >= 50);
  const isBalanced = Math.max(...Object.values(statValues)) - Math.min(...Object.values(statValues)) <= 10;

  if (allHigh && isBalanced) {
    return ARCHETYPES.find((a) => a.id === "polymath")!;
  }

  // Check for balanced stats (Adventurer)
  if (isBalanced) {
    return ARCHETYPES.find((a) => a.id === "adventurer")!;
  }

  // Check for specialized combinations
  if (knowledge >= 40 && creativity >= 40 && knowledge + creativity > social + health + sleep) {
    return ARCHETYPES.find((a) => a.id === "sage")!;
  }

  if (social >= 40 && knowledge >= 40 && social + knowledge > creativity + health + sleep) {
    return ARCHETYPES.find((a) => a.id === "diplomat")!;
  }

  // Check for single-stat specialization
  if (highestStats.length === 1) {
    const stat = highestStats[0];
    const archetypeMap: Record<string, string> = {
      knowledge: "scholar",
      social: "bard",
      creativity: "artist",
      health: "warrior",
      sleep: "dreamer",
    };

    const archetypeId = archetypeMap[stat];
    if (archetypeId) {
      return ARCHETYPES.find((a) => a.id === archetypeId)!;
    }
  }

  // Default: Adventurer
  return ARCHETYPES.find((a) => a.id === "adventurer")!;
}

/**
 * Check if user's archetype has changed and evolve if needed
 */
export async function checkAndEvolveArchetype(userId: string): Promise<{
  evolved: boolean;
  previousArchetype?: string;
  newArchetype?: Archetype;
  xpBonus?: number;
}> {
  // Get user with current stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      archetype: true,
      statSleep: true,
      statHealth: true,
      statSocial: true,
      statKnowledge: true,
      statCreativity: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    return { evolved: false };
  }

  const stats: UserStats = {
    sleep: user.statSleep || 0,
    health: user.statHealth || 0,
    social: user.statSocial || 0,
    knowledge: user.statKnowledge || 0,
    creativity: user.statCreativity || 0,
  };

  // Detect new archetype
  const newArchetype = detectArchetype(stats);
  const currentArchetype = user.archetype || "Adventurer";

  // Check if it changed
  if (newArchetype.name === currentArchetype) {
    return { evolved: false };
  }

  // Evolution detected!
  const xpBonus = 50; // Base evolution bonus

  // Update user archetype
  await prisma.user.update({
    where: { id: userId },
    data: {
      archetype: newArchetype.name,
      xp: { increment: xpBonus },
    },
  });

  // Log evolution history
  await prisma.userArchetypeHistory.create({
    data: {
      userId,
      previousType: currentArchetype,
      newType: newArchetype.name,
      reason: "stat_evolution",
      statSnapshot: stats,
      xpBonus,
    },
  });

  // Send notification
  await notify(
    userId,
    "archetype_evolution",
    `You evolved into ${newArchetype.emoji} ${newArchetype.name}!`,
    `${newArchetype.description} (+${xpBonus} XP)`
  );

  // Publish real-time event
  await publishEvent("archetype:evolved", {
    userId,
    userName: user.name || user.email,
    previousArchetype: currentArchetype,
    newArchetype: newArchetype.name,
    emoji: newArchetype.emoji,
    xpBonus,
  });

  return {
    evolved: true,
    previousArchetype: currentArchetype,
    newArchetype,
    xpBonus,
  };
}

/**
 * Get archetype by name
 */
export function getArchetypeByName(name: string): Archetype | undefined {
  return ARCHETYPES.find((a) => a.name === name);
}

/**
 * Calculate XP bonus for action based on archetype
 */
export function calculateArchetypeBonus(
  archetype: string,
  action: string,
  baseXp: number
): number {
  const archetypeData = ARCHETYPES.find((a) => a.name === archetype);

  if (!archetypeData) {
    return baseXp;
  }

  // Check if action qualifies for bonus
  const qualifies =
    archetypeData.bonusActions.includes("any") ||
    archetypeData.bonusActions.includes(action);

  if (!qualifies) {
    return baseXp;
  }

  // Apply bonus
  const bonus = Math.floor(baseXp * (archetypeData.xpBonus / 100));
  return baseXp + bonus;
}

/**
 * Get user's archetype evolution history
 */
export async function getArchetypeHistory(userId: string, limit: number = 10) {
  return await prisma.userArchetypeHistory.findMany({
    where: { userId },
    orderBy: { evolvedAt: "desc" },
    take: limit,
  });
}













