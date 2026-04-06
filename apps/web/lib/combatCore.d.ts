/**
 * Combat Core - Pure function for resolving fights
 * v0.36.5 - Combat core + fight UI
 */
export interface HeroStats {
    str: number;
    int: number;
    cha: number;
    luck: number;
    hp: number;
    maxHp: number;
    weaponDamage?: number;
    attackPower?: number;
    defense?: number;
    critChance?: number;
    speed?: number;
}
export interface EnemyStats {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    str: number;
    def: number;
    speed: number;
}
export interface Round {
    roundIndex: number;
    heroHp: number;
    enemyHp: number;
    heroDamage: number;
    enemyDamage: number;
    heroCrit: boolean;
    enemyCrit: boolean;
    heroMiss: boolean;
    enemyMiss: boolean;
}
export interface FightResult {
    rounds: Round[];
    result: "WIN" | "LOSE" | "DRAW";
    rewards?: {
        xp?: number;
        gold?: number;
        itemId?: string;
    };
}
/**
 * Resolve a fight between hero and enemy
 * Pure function that returns rounds and result
 */
export declare function resolveFight(hero: HeroStats, enemy: EnemyStats): FightResult;
