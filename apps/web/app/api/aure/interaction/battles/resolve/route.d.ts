/**
 * AURE Interaction Engine - Resolve Battle API
 * Manually resolve a battle and determine winner
 * v0.39.7 - Faction Battle 2.0 (Archetype Wars)
 */
/**
 * POST /api/aure/interaction/battles/resolve
 * Resolve current battle (dev/admin only - can be guarded by env)
 * Body: { battleId?: string } - if not provided, resolves current battle
 */
export declare const POST: any;
