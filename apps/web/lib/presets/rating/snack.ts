/**
 * Snack Rating Preset
 * v0.38.5 - Category-Adaptive Rating Templates
 */

export const snackPreset = {
  category: 'snack',
  name: 'Snack',
  metrics: [
    { id: 'creativity', label: 'Creativity', description: 'How creative is this snack?' },
    { id: 'visualAppeal', label: 'Visual Appeal', description: 'How appetizing does it look?' },
    { id: 'vibeScore', label: 'Vibe Score', description: "What's the overall vibe?" },
    { id: 'healthiness', label: 'Healthiness', description: 'How healthy is this snack?' },
    { id: 'uniqueness', label: 'Uniqueness', description: 'How unique is this snack?' },
  ],
  promptTemplate: 'Evaluate this {category}. Rate {metrics} (0-100). Give a 1-2 sentence summary and a playful roast or compliment.',
  adaptiveRules: {
    highCreativityHint: 'If the snack looks unique or unusual, consider boosting creativity and uniqueness scores.',
    lowHealthHint: 'If it appears greasy, sugary, or heavily processed, adjust healthiness score accordingly.',
    visualClarity: 'If the image is blurry or low-light, consider lowering visual appeal score.',
    presentationQuality: 'If the snack is well-presented with good lighting and composition, boost visual appeal.',
    homemadeVsStore: 'If it appears homemade vs store-bought, adjust creativity and uniqueness accordingly.',
  },
};

