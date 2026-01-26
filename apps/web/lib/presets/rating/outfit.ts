/**
 * Outfit Rating Preset
 * v0.38.5 - Category-Adaptive Rating Templates
 */

export const outfitPreset = {
  category: 'outfit',
  name: 'Outfit',
  metrics: [
    { id: 'style', label: 'Style', description: 'How stylish is this outfit?' },
    { id: 'coordination', label: 'Coordination', description: 'How well do pieces work together?' },
    { id: 'vibeScore', label: 'Vibe Score', description: "What's the overall vibe?" },
    { id: 'confidence', label: 'Confidence', description: 'How confident does this look?' },
    { id: 'uniqueness', label: 'Uniqueness', description: 'How unique is this outfit?' },
  ],
  promptTemplate: 'Evaluate this {category}. Rate {metrics} (0-100). Give a 1-2 sentence summary and a playful roast or compliment.',
  adaptiveRules: {
    colorCoordination: 'If colors work well together, boost coordination score.',
    styleConsistency: 'If the outfit has a clear style theme, boost style and confidence scores.',
    visualClarity: 'If the image is blurry or poorly lit, consider lowering visual appeal.',
    uniquenessLevel: 'If the outfit is very unique or unconventional, boost uniqueness and creativity.',
    occasionAppropriate: 'Consider if the outfit fits its apparent occasion or context.',
  },
};

