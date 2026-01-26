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
  colorHint: string; // For UI theming
}

/**
 * Archetype Catalog
 * Stable list of archetypes users can be assigned
 */
export const ARCHETYPE_CATALOG: Archetype[] = [
  {
    id: 'cozy-gremlin',
    label: 'Cozy Gremlin',
    shortDescription: 'You gravitate toward warm, comfortable aesthetics with a playful edge.',
    emoji: '🦎',
    primaryTraits: ['cozy', 'comfortable', 'playful', 'warm'],
    typicalCategories: ['room', 'snack', 'outfit'],
    colorHint: '#8B5CF6', // Purple
  },
  {
    id: 'minimalist-monk',
    label: 'Minimalist Monk',
    shortDescription: 'You value simplicity, order, and clean aesthetics above all.',
    emoji: '🧘',
    primaryTraits: ['minimal', 'organized', 'clean', 'simple'],
    typicalCategories: ['room', 'desk', 'outfit'],
    colorHint: '#10B981', // Green
  },
  {
    id: 'chaos-goblin',
    label: 'Chaos Goblin',
    shortDescription: 'You embrace the beautiful chaos and unexpected combinations.',
    emoji: '👹',
    primaryTraits: ['chaotic', 'creative', 'unpredictable', 'bold'],
    typicalCategories: ['snack', 'outfit', 'room'],
    colorHint: '#EF4444', // Red
  },
  {
    id: 'snack-wizard',
    label: 'Snack Wizard',
    shortDescription: 'You have an almost magical ability to find and rate amazing snacks.',
    emoji: '🧙',
    primaryTraits: ['snack-focused', 'curious', 'adventurous', 'foodie'],
    typicalCategories: ['snack'],
    colorHint: '#F59E0B', // Amber
  },
  {
    id: 'aesthetic-architect',
    label: 'Aesthetic Architect',
    shortDescription: 'You build and curate spaces with precision and vision.',
    emoji: '🏗️',
    primaryTraits: ['organized', 'visionary', 'precise', 'curated'],
    typicalCategories: ['room', 'desk'],
    colorHint: '#3B82F6', // Blue
  },
  {
    id: 'vibe-curator',
    label: 'Vibe Curator',
    shortDescription: 'You have an eye for creating the perfect mood and atmosphere.',
    emoji: '🎨',
    primaryTraits: ['curated', 'atmospheric', 'mood-focused', 'artistic'],
    typicalCategories: ['room', 'outfit'],
    colorHint: '#EC4899', // Pink
  },
  {
    id: 'comfort-seeker',
    label: 'Comfort Seeker',
    shortDescription: 'You prioritize comfort and coziness in everything you rate.',
    emoji: '🛋️',
    primaryTraits: ['comfortable', 'cozy', 'relaxed', 'soft'],
    typicalCategories: ['room', 'snack', 'outfit'],
    colorHint: '#F97316', // Orange
  },
  {
    id: 'adventurer',
    label: 'Adventurer',
    shortDescription: 'You explore diverse categories and embrace new experiences.',
    emoji: '🗺️',
    primaryTraits: ['exploratory', 'diverse', 'adventurous', 'balanced'],
    typicalCategories: ['snack', 'outfit', 'room', 'pet'],
    colorHint: '#06B6D4', // Cyan
  },
];

/**
 * Get archetype by ID
 */
export function getArchetypeById(id: string): Archetype | null {
  return ARCHETYPE_CATALOG.find((a) => a.id === id) || null;
}

/**
 * Get all archetype IDs
 */
export function getAllArchetypeIds(): string[] {
  return ARCHETYPE_CATALOG.map((a) => a.id);
}

/**
 * Get faction mapping for battles (stub)
 * Maps archetypes to factions for faction battles
 */
export function getFactionForArchetype(archetypeId: string): string {
  // Simple mapping: group similar archetypes
  const cozyGroup = ['cozy-gremlin', 'comfort-seeker'];
  const orderGroup = ['minimalist-monk', 'aesthetic-architect'];
  const chaosGroup = ['chaos-goblin', 'vibe-curator'];
  const explorerGroup = ['snack-wizard', 'adventurer'];

  if (cozyGroup.includes(archetypeId)) return 'cozy-faction';
  if (orderGroup.includes(archetypeId)) return 'order-faction';
  if (chaosGroup.includes(archetypeId)) return 'chaos-faction';
  if (explorerGroup.includes(archetypeId)) return 'explorer-faction';

  return 'neutral-faction';
}
