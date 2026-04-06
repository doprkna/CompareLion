/**
 * Hybrid Enemy Generator
 * Procedural enemy generation with archetypes, variants, scaling, and tiers
 * v0.36.12 - Hybrid Enemy System
 */
import { ComputedStats } from './stats';
export interface VariantModifier {
    name: string;
    type: 'elemental' | 'trait';
    modifiers: {
        hpMult?: number;
        atkMult?: number;
        defMult?: number;
        critAdd?: number;
        speedMult?: number;
        speedAdd?: number;
    };
}
export interface GeneratedEnemy {
    name: string;
    level: number;
    tier: string;
    variant?: string;
    stats: {
        hp: number;
        atk: number;
        def: number;
        speed: number;
        crit: number;
    };
    fullDescription: string;
    archetypeCode: string;
}
export interface EnemyArchetype {
    id: string;
    code: string;
    name: string;
    baseHp: number;
    baseAtk: number;
    baseDef: number;
    baseCrit: number;
    baseSpeed: number;
}
/**
 * Generate a procedural enemy
 * @param playerStats - Player's computed stats (for level reference)
 * @param options - Optional generation options
 */
export declare function generateEnemy(playerStats: ComputedStats, options?: {
    tier?: string;
    variant?: string | null;
    archetypeCode?: string;
}): Promise<GeneratedEnemy>;
