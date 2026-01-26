/**
 * Pet Rating Preset
 * v0.38.5 - Category-Adaptive Rating Templates
 */

export const petPreset = {
  category: 'pet',
  name: 'Pet',
  metrics: [
    { id: 'cuteness', label: 'Cuteness', description: 'How cute is this pet?' },
    { id: 'personality', label: 'Personality', description: 'How much personality does it show?' },
    { id: 'vibeScore', label: 'Vibe Score', description: "What's the overall vibe?" },
    { id: 'photogenic', label: 'Photogenic', description: 'How photogenic is this pet?' },
    { id: 'uniqueness', label: 'Uniqueness', description: 'How unique is this pet?' },
  ],
  promptTemplate: 'Evaluate this {category}. Rate {metrics} (0-100). Give a 1-2 sentence summary and a playful roast or compliment.',
  adaptiveRules: {
    expressionQuality: 'If the pet shows clear expression or personality, boost personality and photogenic scores.',
    visualClarity: 'If the image is blurry or poorly focused, consider lowering photogenic score.',
    poseQuality: 'If the pet is in a cute or interesting pose, boost cuteness and photogenic scores.',
    uniquenessLevel: 'If the pet has unique markings or features, boost uniqueness score.',
    photoComposition: 'If the photo is well-composed with good lighting, boost photogenic score.',
  },
};

