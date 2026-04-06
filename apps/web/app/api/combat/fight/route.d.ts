/**
 * Combat Fight API 2.0
 * POST /api/combat/fight
 * Deterministic turn-based combat system
 * v0.36.35 - Combat Engine 2.0
 */
export declare const runtime = "nodejs";
/**
 * POST /api/combat/fight
 * Body: { enemyId: string }
 *
 * Flow:
 * 1. Load user stats (base + items + pet + buffs)
 * 2. Load enemy template
 * 3. Simulate turn-based fight (user always starts)
 * 4. Return fight result with rewards
 */
export declare const POST: any;
