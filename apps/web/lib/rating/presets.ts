/**
 * Category Presets Loader for AI Universal Rating Engine
 * Loads presets from modular preset files
 * v0.38.2 - Category Preset Packs
 * v0.38.14 - Template Marketplace (user-created templates support)
 */

import { PRESETS, type CategoryPreset } from '@/lib/presets/rating';
import { getTemplate } from './templateService';

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
export async function loadPreset(categoryOrTemplateId: string): Promise<CategoryPreset | null> {
  // Check if it's a template ID (format: "template:xyz")
  if (categoryOrTemplateId.startsWith('template:')) {
    const templateId = categoryOrTemplateId.replace('template:', '');
    const template = await getTemplate(templateId);
    
    if (!template) {
      return null;
    }

    // Convert template to preset format
    return {
      category: `template:${template.id}`,
      name: template.categoryLabel,
      metrics: template.metrics.map(m => ({
        id: m.id,
        label: m.label,
        description: m.description || '',
      })),
      promptTemplate: template.promptTemplate,
      adaptiveRules: {}, // Templates don't have adaptive rules
    };
  }

  // Built-in preset
  return PRESETS[categoryOrTemplateId as keyof typeof PRESETS] || null;
}

/**
 * Get category preset (alias for loadPreset for backward compatibility)
 * Note: Now async due to template support
 */
export async function getCategoryPreset(category: string): Promise<CategoryPreset | null> {
  return loadPreset(category);
}

/**
 * Get all available categories (built-in only)
 * User templates are loaded separately via API
 */
export function getAllCategories(): string[] {
  return Object.keys(PRESETS).sort();
}

/**
 * Build AI prompt from preset
 * 
 * @param preset - Category preset (built-in or template)
 * @param flavor - Optional flavor (funny, serious, cute)
 * @param adaptiveHints - Optional adaptive hints from adaptive template
 * @returns Formatted prompt string
 */
export function buildPromptFromPreset(
  preset: CategoryPreset,
  flavor?: 'funny' | 'serious' | 'cute',
  adaptiveHints?: string[]
): string {
  const metricNames = preset.metrics.map((m) => m.label.toLowerCase()).join(', ');
  
  let prompt = preset.promptTemplate
    .replace('{category}', preset.name.toLowerCase())
    .replace('{metrics}', metricNames);

  // Add flavor modifier if specified (only for built-in presets with adaptive rules)
  if (flavor && preset.adaptiveRules && Object.keys(preset.adaptiveRules).length > 0) {
    const flavorModifiers = {
      funny: 'Be playful and humorous in your evaluation.',
      serious: 'Be professional and detailed in your evaluation.',
      cute: 'Be warm and endearing in your evaluation.',
    };
    prompt += ` ${flavorModifiers[flavor]}`;
  }

  // Add adaptive hints if provided (only for built-in presets)
  if (adaptiveHints && adaptiveHints.length > 0 && preset.adaptiveRules && Object.keys(preset.adaptiveRules).length > 0) {
    const hintsText = adaptiveHints.join(' ');
    prompt += `\n\nAdditional considerations: ${hintsText}`;
  }

  // Keep prompt under safe length (rough check)
  if (prompt.length > 2000) {
    // Truncate adaptive hints if too long
    const baseLength = prompt.length - (adaptiveHints?.join(' ').length || 0);
    if (baseLength < 1500 && adaptiveHints) {
      const maxHintLength = 1500 - baseLength;
      const truncatedHints = adaptiveHints.join(' ').substring(0, maxHintLength);
      prompt = prompt.replace(adaptiveHints.join(' '), truncatedHints);
    }
  }

  return prompt;
}
