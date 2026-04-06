/**
 * Combat Engine 2.0
 * Deterministic, readable, expandable combat system
 * v0.36.35 - Combat Engine 2.0
 */
export interface PlayerStats {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    crit: number;
    luck: number;
}
export interface EnemyTemplate {
    id: string;
    name: string;
    level: number;
    power: number;
    defense: number;
    maxHp: number;
    rarity: 'common' | 'elite' | 'boss';
    lootTable: {
        common?: string[];
        rare?: string[];
        epic?: string[];
        gold: {
            min: number;
            max: number;
        };
    };
    icon?: string | null;
}
export interface FightLog {
    round: number;
    actor: 'user' | 'enemy';
    action: 'attack' | 'dodge' | 'crit';
    value: number;
    crit?: boolean;
    userHp?: number;
    enemyHp?: number;
}
export interface FightResult {
    result: 'win' | 'loss';
    rounds: number;
    logs: FightLog[];
    xpReward: number;
    goldReward: number;
    items: Array<{
        itemId: string;
        quantity: number;
    }>;
    petXpGained: number;
}
/**
 * Load player stats (base + equipment + pet + buffs)
 */
export declare function loadStats(userId: string): Promise<PlayerStats>;
/**
 * Simulate turn-based fight
 * User always starts first
 */
export declare function simulateFight(userId: string, enemyId: string): Promise<FightResult>;
/**
 * Grant fight rewards to user
 */
export declare function grantFightRewards(userId: string, fightResult: FightResult): Promise<void>;
