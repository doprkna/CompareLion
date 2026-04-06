/**
 * Category Presets Loader for AI Universal Rating Engine
 * Loads presets from modular preset files
 * v0.38.2 - Category Preset Packs
 * v0.38.14 - Template Marketplace (user-created templates support)
 */
import { type CategoryPreset } from '@/lib/presets/rating';
export interface MetricDefinition {
    id: string;
    label: string;
    description: string;
}
export type { CategoryPreset };
/**
 * Load preset by category name or template ID
 * Supports both built-in presets and user-created templates
 *
 * @param categoryOrTemplateId - Category name or template ID (prefixed with "template:")
 * @returns Preset or null if not found
 */
export declare function loadPreset(categoryOrTemplateId: string): Promise<CategoryPreset | null>;
/**
 * Get category preset (alias for loadPreset for backward compatibility)
 * Note: Now async due to template support
 */
export declare function getCategoryPreset(category: string): Promise<CategoryPreset | null>;
/**
 * Get all available categories (built-in only)
 * User templates are loaded separately via API
 */
export declare function getAllCategories(): string[];
/**
 * Build AI prompt from preset
 *
 * @param preset - Category preset (built-in or template)
 * @param flavor - Optional flavor (funny, serious, cute)
 * @param adaptiveHints - Optional adaptive hints from adaptive template
 * @returns Formatted prompt string
 */
export declare function buildPromptFromPreset(preset: CategoryPreset, flavor?: 'funny' | 'serious' | 'cute', adaptiveHints?: string[]): string;
