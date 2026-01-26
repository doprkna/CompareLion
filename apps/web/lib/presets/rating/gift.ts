/**
 * Gift Rating Preset
 * v0.38.5 - Category-Adaptive Rating Templates
 */

export const giftPreset = {
  category: 'gift',
  name: 'Gift',
  metrics: [
    { id: 'thoughtfulness', label: 'Thoughtfulness', description: 'How thoughtful is this gift?' },
    { id: 'creativity', label: 'Creativity', description: 'How creative is this gift?' },
    { id: 'presentation', label: 'Presentation', description: 'How well is it presented?' },
    { id: 'vibeScore', label: 'Vibe Score', description: "What's the overall vibe?" },
    { id: 'uniqueness', label: 'Uniqueness', description: 'How unique is this gift?' },
  ],
  promptTemplate: 'Evaluate this {category}. Rate {metrics} (0-100). Give a 1-2 sentence summary and a playful roast or compliment.',
  adaptiveRules: {
    presentationQuality: 'If the gift is well-wrapped or beautifully presented, boost presentation score.',
    personalizationLevel: 'If the gift appears personalized or customized, boost thoughtfulness and creativity.',
    visualClarity: 'If the image is blurry or poorly lit, consider lowering visual appeal.',
    uniquenessLevel: 'If the gift is unique or unconventional, boost uniqueness and creativity.',
    appropriateness: 'Consider how appropriate the gift seems for its intended recipient or occasion.',
  },
};

