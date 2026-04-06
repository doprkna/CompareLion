/**
 * Economy Modifiers Seed Helper
 * v0.34.2 - Seeds default economy gamification modifiers
 */
export interface EconomyModifier {
    key: string;
    value: number;
    description: string;
}
export declare const DEFAULT_MODIFIERS: EconomyModifier[];
/**
 * Seeds default economy modifiers
 * Safe to call multiple times - uses upsert
 */
export declare function seedEconomyModifiers(): Promise<void>;
/**
 * Get all economy modifiers
 */
export declare function getEconomyModifiers(): Promise<Record<string, number>>;
