/**
 * Combat Log Service
 * Handles combat event logging and retrieval
 * v0.36.27 - Combat Log 1.0
 */
export interface LogEventParams {
    userId: string;
    enemyId?: string;
    fightId: string;
    round: number;
    actor: 'player' | 'enemy';
    action: 'attack' | 'block' | 'crit' | 'miss' | 'skill' | 'heal';
    value?: number;
    hpAfter?: number;
}
/**
 * Log a combat event
 */
export declare function logEvent(params: LogEventParams): Promise<void>;
/**
 * Get paginated fight logs for a user
 * Returns last 20 fights with their entries
 */
export declare function getFightLogs(userId: string, options?: {
    limit?: number;
    cursor?: string;
}): Promise<{
    fights: Array<{
        fightId: string;
        enemyId: string | null;
        enemyName?: string;
        rounds: number;
        result?: 'WIN' | 'LOSE' | 'DRAW';
        createdAt: Date;
        entries: Array<{
            id: string;
            round: number;
            actor: string;
            action: string;
            value: number | null;
            hpAfter: number | null;
            createdAt: Date;
        }>;
    }>;
    nextCursor: string | null;
}>;
/**
 * Get full log for a single fight
 */
export declare function getSingleFight(fightId: string, userId: string): Promise<{
    fightId: string;
    enemyId: any;
    rounds: number;
    result: "WIN" | "LOSE" | "DRAW" | undefined;
    createdAt: any;
    entries: any;
} | null>;
/**
 * Trim old fights - keep max 30 fights per user
 */
export declare function trimOldFights(userId: string): Promise<number>;
