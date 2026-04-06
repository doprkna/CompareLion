/**
 * Post-flow bonus roll (dev-safe, production-ready)
 * Server decides bonus; no gambling animations.
 * Env: BONUS_ENABLED, BONUS_PROB_MULTIPLIER
 */

import { prisma } from '@/lib/db';
import { addXP } from '@/lib/services/progressionService';

export interface FlowBonusResult {
  type: 'xp' | 'gold' | 'xpBoost';
  amount?: number;
  message: string;
}

function isBonusEnabled(): boolean {
  const v = process.env.BONUS_ENABLED?.toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

function getProbMultiplier(): number {
  const v = process.env.BONUS_PROB_MULTIPLIER;
  if (!v) return 1;
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? n : 1;
}

/**
 * Run bonus roll after flow completion. Applies reward in DB, returns bonus object or null.
 */
export async function runFlowBonusRoll(userId: string): Promise<FlowBonusResult | null> {
  if (!isBonusEnabled()) return null;

  const mult = getProbMultiplier();
  const pBoost = Math.min(1, 0.01 * mult);
  const pGold = Math.min(1, 0.03 * mult);
  const pXp = Math.min(1, 0.1 * mult);

  const r = Math.random();

  if (r < pBoost) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true }
    });
    const settings = (user?.settings as Record<string, unknown>) ?? {};
    const until = Date.now() + 60 * 60 * 1000; // 1 hour
    await prisma.user.update({
      where: { id: userId },
      data: { settings: { ...settings, flowXpBoostUntil: until } }
    });
    return { type: 'xpBoost', message: 'XP boost active for 1 hour' };
  }

  if (r < pBoost + pGold) {
    await prisma.user.update({
      where: { id: userId },
      data: { funds: { increment: 20 } }
    });
    return { type: 'gold', amount: 20, message: '+20 gold' };
  }

  if (r < pBoost + pGold + pXp) {
    await addXP(userId, 10, 'flow_bonus');
    return { type: 'xp', amount: 10, message: '+10 XP' };
  }

  return null;
}
