/**
 * Adaptive Template Service
 * Apply category-adaptive rules to rating prompts
 * v0.38.5 - Category-Adaptive Rating Templates
 */
import { CategoryPreset } from '@/lib/presets/rating';
export interface EntryData {
    imageUrl?: string | null;
    text?: string | null;
    category: string;
}
export interface AdaptiveContext {
    appliedRules: string[];
    hints: string[];
}
/**
 * Apply adaptive template rules based on entry data
 * Evaluates lightweight heuristics and returns applicable rules
 *
 * @param entryData - Entry data (imageUrl, text, category)
 * @param preset - Category preset with adaptiveRules
 * @returns Adaptive context with applied rules and hints
 */
export declare function applyAdaptiveTemplate(entryData: EntryData, preset: CategoryPreset): AdaptiveContext;
/**
 * Build adaptive prompt with hints
 * Combines base prompt with adaptive rule hints
 *
 * @param basePrompt - Base prompt from preset
 * @param adaptiveContext - Adaptive context with hints
 * @returns Enhanced prompt with adaptive hints
 */
export declare function buildAdaptivePrompt(basePrompt: string, adaptiveContext: AdaptiveContext): string;
