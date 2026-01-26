/**
 * Archetype Configuration
 * Defines character classes with base stats, growth rates, and bonuses
 * v0.26.6 - Archetypes & Leveling
 */
export interface ArchetypeDefinition {
    key: string;
    name: string;
    description: string;
    emoji: string;
    baseStats: {
        str: number;
        int: number;
        cha: number;
        luck: number;
    };
    growthRates: {
        str: number;
        int: number;
        cha: number;
        luck: number;
    };
    bonuses: {
        combat?: {
            damageMult?: number;
            critChance?: number;
            hpMult?: number;
        };
        xp?: {
            reflectionBonus?: number;
            generalBonus?: number;
        };
        social?: {
            shopDiscount?: number;
            socialBonus?: number;
        };
        passive?: {
            regen?: number;
            goldBonus?: number;
        };
    };
}
export declare const ARCHETYPES: Record<string, ArchetypeDefinition>;
export type ArchetypeKey = keyof typeof ARCHETYPES;
/**
 * Get archetype definition by key
 */
export declare function getArchetype(key: string): ArchetypeDefinition | null;
/**
 * Calculate stats for a given level based on archetype
 */
export declare function calculateStatsForLevel(archetype: ArchetypeDefinition, level: number): {
    str: number;
    int: number;
    cha: number;
    luck: number;
};
