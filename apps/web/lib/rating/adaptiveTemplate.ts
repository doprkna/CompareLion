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
export function applyAdaptiveTemplate(
  entryData: EntryData,
  preset: CategoryPreset
): AdaptiveContext {
  const appliedRules: string[] = [];
  const hints: string[] = [];

  // Check if preset has adaptiveRules
  if (!preset.adaptiveRules) {
    return { appliedRules, hints };
  }

  const rules = preset.adaptiveRules as Record<string, string>;

  // Evaluate heuristics (text-based, will be enhanced by AI)
  // These are lightweight checks that can be done before AI call

  // Visual clarity check (can be inferred from image URL or text description)
  if (entryData.imageUrl) {
    // If image exists, we can ask AI to check clarity
    if (rules.visualClarity) {
      appliedRules.push('visualClarity');
      hints.push(rules.visualClarity);
    }
  }

  // Category-specific heuristics
  switch (preset.category) {
    case 'snack':
      if (rules.highCreativityHint) {
        appliedRules.push('highCreativityHint');
        hints.push(rules.highCreativityHint);
      }
      if (rules.lowHealthHint) {
        appliedRules.push('lowHealthHint');
        hints.push(rules.lowHealthHint);
      }
      if (rules.presentationQuality) {
        appliedRules.push('presentationQuality');
        hints.push(rules.presentationQuality);
      }
      if (rules.homemadeVsStore) {
        appliedRules.push('homemadeVsStore');
        hints.push(rules.homemadeVsStore);
      }
      break;

    case 'outfit':
      if (rules.colorCoordination) {
        appliedRules.push('colorCoordination');
        hints.push(rules.colorCoordination);
      }
      if (rules.styleConsistency) {
        appliedRules.push('styleConsistency');
        hints.push(rules.styleConsistency);
      }
      if (rules.uniquenessLevel) {
        appliedRules.push('uniquenessLevel');
        hints.push(rules.uniquenessLevel);
      }
      if (rules.occasionAppropriate) {
        appliedRules.push('occasionAppropriate');
        hints.push(rules.occasionAppropriate);
      }
      break;

    case 'car':
      if (rules.conditionQuality) {
        appliedRules.push('conditionQuality');
        hints.push(rules.conditionQuality);
      }
      if (rules.uniquenessLevel) {
        appliedRules.push('uniquenessLevel');
        hints.push(rules.uniquenessLevel);
      }
      if (rules.presentationQuality) {
        appliedRules.push('presentationQuality');
        hints.push(rules.presentationQuality);
      }
      if (rules.eraAppropriate) {
        appliedRules.push('eraAppropriate');
        hints.push(rules.eraAppropriate);
      }
      break;

    case 'room':
      if (rules.clutterLevel) {
        appliedRules.push('clutterLevel');
        hints.push(rules.clutterLevel);
      }
      if (rules.lightingQuality) {
        appliedRules.push('lightingQuality');
        hints.push(rules.lightingQuality);
      }
      if (rules.designCoherence) {
        appliedRules.push('designCoherence');
        hints.push(rules.designCoherence);
      }
      if (rules.functionality) {
        appliedRules.push('functionality');
        hints.push(rules.functionality);
      }
      break;

    case 'gift':
      if (rules.presentationQuality) {
        appliedRules.push('presentationQuality');
        hints.push(rules.presentationQuality);
      }
      if (rules.personalizationLevel) {
        appliedRules.push('personalizationLevel');
        hints.push(rules.personalizationLevel);
      }
      if (rules.uniquenessLevel) {
        appliedRules.push('uniquenessLevel');
        hints.push(rules.uniquenessLevel);
      }
      if (rules.appropriateness) {
        appliedRules.push('appropriateness');
        hints.push(rules.appropriateness);
      }
      break;

    case 'pet':
      if (rules.expressionQuality) {
        appliedRules.push('expressionQuality');
        hints.push(rules.expressionQuality);
      }
      if (rules.poseQuality) {
        appliedRules.push('poseQuality');
        hints.push(rules.poseQuality);
      }
      if (rules.uniquenessLevel) {
        appliedRules.push('uniquenessLevel');
        hints.push(rules.uniquenessLevel);
      }
      if (rules.photoComposition) {
        appliedRules.push('photoComposition');
        hints.push(rules.photoComposition);
      }
      break;
  }

  return {
    appliedRules,
    hints,
  };
}

/**
 * Build adaptive prompt with hints
 * Combines base prompt with adaptive rule hints
 * 
 * @param basePrompt - Base prompt from preset
 * @param adaptiveContext - Adaptive context with hints
 * @returns Enhanced prompt with adaptive hints
 */
export function buildAdaptivePrompt(
  basePrompt: string,
  adaptiveContext: AdaptiveContext
): string {
  if (adaptiveContext.hints.length === 0) {
    return basePrompt;
  }

  // Add adaptive hints to prompt
  const hintsText = adaptiveContext.hints.join(' ');
  return `${basePrompt}\n\nAdditional considerations: ${hintsText}`;
}

