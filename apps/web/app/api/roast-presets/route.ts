import { NextRequest, NextResponse } from 'next/server';
import { safeAsync } from '@/lib/api-handler';

// Sample tone presets for each roast level
const roastPresets = {
  1: {
    level: 1,
    label: 'Gentle (Wholesome)',
    description: 'Empathetic, supportive, kind feedback',
    examples: [
      'You did great today! Keep up the wonderful work! 🌟',
      'Your progress is inspiring. Well done!',
      'Every step forward matters. You\'re doing beautifully!',
    ],
    badge: '🧁 Gentle Soul',
  },
  2: {
    level: 2,
    label: 'Mild',
    description: 'Positive with gentle encouragement',
    examples: [
      'Nice progress! A bit more focus could help you reach your goals.',
      'You\'re on the right track. Keep it up!',
      'Good effort! Small improvements will make a big difference.',
    ],
    badge: '😊 Mild',
  },
  3: {
    level: 3,
    label: 'Balanced',
    description: 'Neutral, constructive feedback (default)',
    examples: [
      'You\'re making steady progress. Keep pushing forward.',
      'Balanced approach. Time to level up your game.',
      'You\'ve got potential. Here\'s how to unlock it.',
    ],
    badge: '⚖️ Balanced',
  },
  4: {
    level: 4,
    label: 'Bold',
    description: 'Direct, honest with a hint of humor',
    examples: [
      'Okay, you\'re doing fine, but let\'s be real—you can do better. Time to step up!',
      'Decent effort, but your potential is screaming for more attention.',
      'Not bad, but not great either. Let\'s turn up the heat! 🔥',
    ],
    badge: '💪 Bold',
  },
  5: {
    level: 5,
    label: 'Savage (Full Roast Mode)',
    description: 'Sarcastic, unfiltered, humor-laced feedback',
    examples: [
      'Listen, champ—your consistency is as reliable as a broken clock. Time to get serious! ⏰',
      'Your progress graph looks like a flatline. Let\'s add some heartbeat! 💓',
      'Nice try, but we both know you\'re coasting. Time to unleash the beast mode! 🦁',
    ],
    badge: '🔥 Unfiltered',
  },
};

export const GET = safeAsync(async (req: NextRequest) => {
  return NextResponse.json({
    success: true,
    presets: Object.values(roastPresets),
  });
});

