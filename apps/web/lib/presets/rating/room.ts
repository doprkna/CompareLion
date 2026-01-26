/**
 * Room / Desk Setup Rating Preset
 * v0.38.5 - Category-Adaptive Rating Templates
 */

export const roomPreset = {
  category: 'room',
  name: 'Room / Desk Setup',
  metrics: [
    { id: 'aesthetics', label: 'Aesthetics', description: 'How aesthetically pleasing is this room?' },
    { id: 'coziness', label: 'Coziness', description: 'How cozy does it feel?' },
    { id: 'organization', label: 'Organization', description: 'How organized is this space?' },
    { id: 'vibeScore', label: 'Vibe Score', description: "What's the overall vibe?" },
    { id: 'creativity', label: 'Creativity', description: 'How creative is the design?' },
  ],
  promptTemplate: 'Evaluate this {category}. Rate {metrics} (0-100). Give a 1-2 sentence summary and a playful roast or compliment.',
  adaptiveRules: {
    clutterLevel: 'If the space appears cluttered or messy, lower organization score.',
    lightingQuality: 'If the lighting is warm and inviting, boost coziness and aesthetics.',
    visualClarity: 'If the image is blurry or poorly lit, consider lowering visual appeal.',
    designCoherence: 'If the design has a clear theme or style, boost aesthetics and creativity.',
    functionality: 'Consider how functional and practical the space appears.',
  },
};

