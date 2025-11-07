/**
 * Karma Scoring System
 * 
 * Karma represents moral alignment and consistency.
 * Range: -∞ to +∞ (negative = chaotic, positive = aligned)
 * 
 * Factors:
 * - Answer sentiment (truth vs dare, consistency)
 * - Challenge acceptance (+1) vs decline (-1)
 * - Social interactions (helping others +1, ignoring -0.5)
 * - Admin adjustments (optional manual override)
 */

import { prisma } from "@/lib/db";

/**
 * Calculate karma delta from answer sentiment
 * @param answer User's answer text
 * @param questionType Question category/type
 * @returns Karma change (-5 to +5)
 */
export function calculateAnswerKarma(answer: string, _questionType?: string): number {
  const lowerAnswer = answer.toLowerCase();
  
  // Positive indicators
  const positiveWords = ['yes', 'always', 'often', 'definitely', 'agree', 'help', 'support'];
  const negativeWords = ['no', 'never', 'rarely', 'disagree', 'ignore', 'avoid'];
  
  let karma = 0;
  
  // Check for positive alignment
  if (positiveWords.some(word => lowerAnswer.includes(word))) {
    karma += 1;
  }
  
  // Check for negative alignment
  if (negativeWords.some(word => lowerAnswer.includes(word))) {
    karma -= 1;
  }
  
  // Bonus for truth-telling (longer, detailed answers)
  if (answer.length > 100) {
    karma += 1; // Thoughtful responses
  }
  
  // Penalty for very short answers (low effort)
  if (answer.length < 10) {
    karma -= 1;
  }
  
  return Math.max(-5, Math.min(5, karma)); // Cap to -5/+5 per answer
}

/**
 * Calculate karma from challenge interaction
 * @param action 'accepted' | 'declined'
 * @returns Karma change
 */
export function calculateChallengeKarma(action: 'accepted' | 'declined'): number {
  return action === 'accepted' ? 1 : -1;
}

/**
 * Calculate karma from social interaction
 * @param action 'helped' | 'ignored' | 'responded' | 'reacted'
 * @returns Karma change
 */
export function calculateSocialKarma(action: string): number {
  const karmaMap: Record<string, number> = {
    helped: 2,
    responded: 1,
    reacted: 0.5,
    ignored: -0.5,
    reported: -2,
  };
  
  return karmaMap[action] || 0;
}

/**
 * Get karma tier label
 * @param karma Current karma score
 * @returns Karma tier description
 */
export function getKarmaTier(karma: number): { tier: string; label: string; color: string } {
  if (karma >= 100) return { tier: 'saint', label: '😇 Saint', color: 'text-blue-400' };
  if (karma >= 50) return { tier: 'virtuous', label: '✨ Virtuous', color: 'text-green-400' };
  if (karma >= 20) return { tier: 'good', label: '😊 Good', color: 'text-green-300' };
  if (karma >= 5) return { tier: 'neutral_good', label: '🙂 Neutral+', color: 'text-gray-300' };
  if (karma >= -5) return { tier: 'neutral', label: '😐 Neutral', color: 'text-gray-400' };
  if (karma >= -20) return { tier: 'neutral_bad', label: '😕 Neutral-', color: 'text-gray-500' };
  if (karma >= -50) return { tier: 'chaotic', label: '😈 Chaotic', color: 'text-red-300' };
  return { tier: 'villain', label: '👿 Villain', color: 'text-red-500' };
}

/**
 * Update user's karma score
 * @param userId User ID
 * @param delta Karma change amount
 * @returns Updated karma score
 */
export async function updateKarma(userId: string, delta: number): Promise<number> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      karmaScore: { increment: Math.round(delta) },
    },
    select: { karmaScore: true },
  });

  return user.karmaScore;
}

/**
 * Set karma score (admin override)
 * @param userId User ID
 * @param score New karma score
 */
export async function setKarma(userId: string, score: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { karmaScore: Math.round(score) },
  });
}













