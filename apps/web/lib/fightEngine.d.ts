/**
 * Fight Engine - Deterministic turn-based combat system
 * v0.36.0 - Full Fighting System MVP
 */
export interface Combatant {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    str: number;
    def: number;
    speed: number;
}
export interface RoundLog {
    round: number;
    attacker: string;
    defender: string;
    damage: number;
    attackerHpAfter: number;
    defenderHpAfter: number;
}
export interface FightResult {
    winner: string;
    rounds: RoundLog[];
    totalRounds: number;
}
/**
 * Simulate a turn-based fight between hero and enemy
 */
export declare function simulateFight(hero: Combatant, enemy: Combatant): FightResult;
