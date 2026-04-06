/**
 * AURE Life Engine - Archetype Catalog
 * Static catalog of archetypes with traits and characteristics
 * v0.39.5 - Archetype Engine 2.0
 */
export interface Archetype {
    id: string;
    label: string;
    shortDescription: string;
    emoji: string;
    primaryTraits: string[];
    typicalCategories: string[];
    colorHint: string;
}
/**
 * Archetype Catalog
 * Stable list of archetypes users can be assigned
 */
export declare const ARCHETYPE_CATALOG: Archetype[];
/**
 * Get archetype by ID
 */
export declare function getArchetypeById(id: string): Archetype | null;
/**
 * Get all archetype IDs
 */
export declare function getAllArchetypeIds(): string[];
/**
 * Get faction mapping for battles (stub)
 * Maps archetypes to factions for faction battles
 */
export declare function getFactionForArchetype(archetypeId: string): string;
