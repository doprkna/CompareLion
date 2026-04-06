/**
 * Post-flow bonus roll (dev-safe, production-ready)
 * Server decides bonus; no gambling animations.
 * Env: BONUS_ENABLED, BONUS_PROB_MULTIPLIER
 */
export interface FlowBonusResult {
    type: 'xp' | 'gold' | 'xpBoost';
    amount?: number;
    message: string;
}
/**
 * Run bonus roll after flow completion. Applies reward in DB, returns bonus object or null.
 */
export declare function runFlowBonusRoll(userId: string): Promise<FlowBonusResult | null>;
