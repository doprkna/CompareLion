/**
 * Combat Service - Idle Reflection Combat System
 * Handles hero vs shadow battles, damage calculation, and rewards
 * v0.25.0 - Phase J-Lite
 */
export interface CombatResult {
    session: {
        id: string;
        heroHp: number;
        heroMaxHp: number;
        enemyHp: number;
        enemyMaxHp: number;
        enemyName: string;
        enemyType: string;
        xpGained: number;
        goldGained: number;
        kills: number;
        currentStreak: number;
    };
    combatLog: CombatLogEntry[];
    rewards?: RewardResult;
    levelUp?: LevelUpResult;
    gameOver?: boolean;
    state?: 'resting' | 'active';
}
export interface CombatLogEntry {
    type: 'attack' | 'enemyHit' | 'kill' | 'respawn' | 'gameOver' | 'rest' | 'heal' | 'skill';
    damage?: number;
    heal?: number;
    isCrit?: boolean;
    message: string;
    timestamp: Date;
    icon?: string;
}
export interface RewardResult {
    xp: number;
    gold: number;
    killBonus: boolean;
}
export interface LevelUpResult {
    newLevel: number;
    oldLevel: number;
    xpNeeded: number;
}
export interface DamageResult {
    damage: number;
    isCrit: boolean;
    total: number;
}
export declare function getOrCreateSession(userId: string, applyArchetypeHPBonus?: boolean): Promise<CombatResult>;
export declare function getActiveSession(userId: string): Promise<any>;
export declare function attack(userId: string, powerBonus?: number): Promise<CombatResult>;
export declare function enemyAttack(userId: string): Promise<CombatResult>;
export declare function handleKill(userId: string, session: any, powerBonus?: number): Promise<CombatResult>;
export declare function forfeit(userId: string): Promise<CombatResult>;
/**
 * Check rest state and auto-heal hero based on time elapsed
 * Returns CombatResult with updated HP or same state if still resting
 */
export declare function checkAndHealFromRest(userId: string, session: any): Promise<CombatResult>;
export declare function calculateDamage(baseMin: number, baseMax: number, powerBonus?: number, effects?: {
    damageMult?: number;
    critChance?: number;
}): DamageResult;
export declare function generateEnemyName(killCount?: number): string;
export declare function formatSession(session: any): {
    id: any;
    heroHp: any;
    heroMaxHp: any;
    enemyHp: any;
    enemyMaxHp: any;
    enemyName: any;
    enemyType: any;
    xpGained: any;
    goldGained: any;
    kills: any;
    currentStreak: any;
};
export declare function getPowerBonus(userId: string): Promise<number>;
