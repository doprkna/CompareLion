/**
 * Post-flow reward roll (MVP). Pure RNG; no I/O.
 * v0.48.01 — Flow Reward reveal
 */

export type FlowReward = {
  type: 'coins' | 'xp' | 'diamond'
  amount: number
  rarity: 'common' | 'uncommon' | 'rare'
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Rolls rarity: common 70%, uncommon 25%, rare 5%.
 * Then picks reward table per rarity.
 */
export function generateFlowReward(): FlowReward {
  const r = Math.random()
  if (r < 0.05) {
    return {
      type: 'diamond',
      amount: randInt(1, 3),
      rarity: 'rare',
    }
  }
  if (r < 0.3) {
    // uncommon: 0.05–0.30 = 25%
    if (Math.random() < 0.5) {
      return {
        type: 'coins',
        amount: randInt(50, 120),
        rarity: 'uncommon',
      }
    }
    return {
      type: 'xp',
      amount: randInt(30, 80),
      rarity: 'uncommon',
    }
  }
  // common: remainder ~70%
  return {
    type: 'coins',
    amount: randInt(20, 50),
    rarity: 'common',
  }
}
