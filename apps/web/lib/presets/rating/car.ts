/**
 * Car Rating Preset
 * v0.38.5 - Category-Adaptive Rating Templates
 */

export const carPreset = {
  category: 'car',
  name: 'Car',
  metrics: [
    { id: 'style', label: 'Style', description: 'How stylish is this car?' },
    { id: 'coolness', label: 'Coolness', description: 'How cool does this car look?' },
    { id: 'vibeScore', label: 'Vibe Score', description: "What's the overall vibe?" },
    { id: 'uniqueness', label: 'Uniqueness', description: 'How unique is this car?' },
    { id: 'aesthetics', label: 'Aesthetics', description: 'How aesthetically pleasing is this car?' },
  ],
  promptTemplate: 'Evaluate this {category}. Rate {metrics} (0-100). Give a 1-2 sentence summary and a playful roast or compliment.',
  adaptiveRules: {
    conditionQuality: 'If the car appears well-maintained or pristine, boost aesthetics and style scores.',
    visualClarity: 'If the image is blurry or low-light, consider lowering visual appeal.',
    uniquenessLevel: 'If the car is rare or has unique modifications, boost uniqueness and coolness.',
    presentationQuality: 'If the photo is well-composed with good lighting, boost aesthetics.',
    eraAppropriate: 'Consider the car\'s era and how well it represents its time period.',
  },
};

