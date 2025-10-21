/**
 * Prestige Scoring System
 * 
 * Prestige represents capability, status, and accomplishment.
 * Range: 0 to 100 (capped for MVP)
 * 
 * Formula: log10(level * achievements * 10 + 1)
 * 
 * Factors:
 * - User level (higher = more prestige)
 * - Total achievements unlocked
 * - Total XP earned
 * - Duel victories
 * - Friend count
 */

import { prisma } from "@/lib/db";

const PRESTIGE_CAP = 100;

/**
 * Calculate prestige score from user data
 * @param level User level
 * @param achievementCount Number of achievements
 * @param xp Total XP
 * @param duelWins Number of duel victories
 * @param friendCount Number of friends
 * @returns Calculated prestige score (0-100)
 */
export function calculatePrestige(
  level: number,
  achievementCount: number,
  xp: number = 0,
  duelWins: number = 0,
  friendCount: number = 0
): number {
  // Base formula: log10(level * achievements * 10 + 1)
  const base = Math.log10(level * achievementCount * 10 + 1);
  
  // XP bonus (diminishing returns)
  const xpBonus = Math.log10(xp / 100 + 1) * 2;
  
  // Social bonuses
  const duelBonus = duelWins * 0.5;
  const friendBonus = Math.min(friendCount * 0.2, 5); // Cap at 5
  
  // Total prestige
  const total = base + xpBonus + duelBonus + friendBonus;
  
  // Scale to 0-100 range
  const scaled = Math.min(total * 10, PRESTIGE_CAP);
  
  return Math.max(0, Math.round(scaled));
}

/**
 * Get prestige tier label
 * @param prestige Current prestige score
 * @returns Prestige tier description
 */
export function getPrestigeTier(prestige: number): { tier: string; label: string; color: string } {
  if (prestige >= 90) return { tier: 'legendary', label: '👑 Legendary', color: 'text-yellow-400' };
  if (prestige >= 75) return { tier: 'renowned', label: '🌟 Renowned', color: 'text-purple-400' };
  if (prestige >= 60) return { tier: 'distinguished', label: '💫 Distinguished', color: 'text-blue-400' };
  if (prestige >= 40) return { tier: 'respected', label: '⭐ Respected', color: 'text-green-400' };
  if (prestige >= 20) return { tier: 'known', label: '✨ Known', color: 'text-gray-300' };
  if (prestige >= 5) return { tier: 'emerging', label: '🌱 Emerging', color: 'text-gray-400' };
  return { tier: 'novice', label: '🆕 Novice', color: 'text-gray-500' };
}

/**
 * Recalculate and update user's prestige score
 * @param userId User ID
 * @returns Updated prestige score
 */
export async function recalculatePrestige(userId: string): Promise<number> {
  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      level: true,
      xp: true,
      userAchievements: { select: { id: true } },
      friends: { where: { status: 'accepted' }, select: { id: true } },
      duelsInitiated: { 
        where: { status: 'completed', winnerId: userId },
        select: { id: true }
      },
      duelsReceived: {
        where: { status: 'completed', winnerId: userId },
        select: { id: true }
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const achievementCount = user.userAchievements.length;
  const friendCount = user.friends.length;
  const duelWins = user.duelsInitiated.length + user.duelsReceived.length;

  const prestige = calculatePrestige(
    user.level || 1,
    achievementCount,
    user.xp || 0,
    duelWins,
    friendCount
  );

  // Update in database
  await prisma.user.update({
    where: { id: userId },
    data: { prestigeScore: prestige },
  });

  return prestige;
}

/**
 * Set prestige score (admin override)
 * @param userId User ID
 * @param score New prestige score
 */
export async function setPrestige(userId: string, score: number): Promise<void> {
  const capped = Math.max(0, Math.min(PRESTIGE_CAP, Math.round(score)));
  await prisma.user.update({
    where: { id: userId },
    data: { prestigeScore: capped },
  });
}











