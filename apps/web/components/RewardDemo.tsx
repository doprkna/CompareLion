'use client';

import { Button } from '@/components/ui/button';
import { useFlowRewardScreen } from '@/hooks/useFlowRewardScreen';
import { useLifeRewardScreen } from '@/hooks/useLifeRewardScreen';

/**
 * Demo component for testing reward screens
 * Remove in production or integrate into actual game logic
 */
export function RewardDemo() {
  const { triggerFlowReward, FlowRewardScreen } = useFlowRewardScreen();
  const { triggerLifeReward, LifeRewardScreen } = useLifeRewardScreen();

  const handleFlowReward = () => {
    triggerFlowReward({
      xp: 12,
      gold: 45,
      diamonds: 3,
      hearts: 2,
      food: 1,
      questionsAnswered: 5,
      accuracy: 80,
      time: 38,
      drops: [
        {
          id: '1',
          name: 'Rare Scroll',
          price: 15,
          currency: 'diamond',
          icon: '📜',
          rarity: 'rare',
        },
        {
          id: '2',
          name: 'Energy Drink',
          price: 10,
          currency: 'gold',
          icon: '⚡',
          rarity: 'common',
        },
        {
          id: '3',
          name: 'Wildcard',
          price: 3,
          currency: 'diamond',
          icon: '🃏',
          rarity: 'epic',
        },
      ],
      onNextFlow: () => console.log('Next Flow'),
      onReviewAnswers: () => console.log('Review Answers'),
      onBackToMain: () => console.log('Back to Main'),
    });
  };

  const handleLifeReward = () => {
    triggerLifeReward({
      hearts: 0,
      food: 0,
      xpLost: 5,
      goldLost: 10,
      questionsAttempted: 8,
      timeSpent: 120,
      drops: [
        {
          id: '1',
          name: 'Food Pack',
          price: 20,
          currency: 'gold',
          icon: '🍖',
          rarity: 'common',
        },
        {
          id: '2',
          name: 'Heart Potion',
          price: 2,
          currency: 'diamond',
          icon: '❤️',
          rarity: 'rare',
        },
        {
          id: '3',
          name: 'Energy Bundle',
          price: 5,
          currency: 'diamond',
          icon: '⚡',
          rarity: 'epic',
        },
      ],
      onBuyHearts: () => console.log('Buy Hearts'),
      onBuyFood: () => console.log('Buy Food'),
      onReturnHome: () => console.log('Return Home'),
    });
  };

  return (
    <>
      <div className="fixed bottom-60 left-6 z-40 space-y-2">
        <div className="bg-card border border-border rounded-lg p-4 space-y-2 shadow-lg backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-text mb-2">Reward Modals Demo</h3>
          
          <Button
            onClick={handleFlowReward}
            size="sm"
            variant="outline"
            className="w-full"
          >
            🎉 Flow Complete
          </Button>
          
          <Button
            onClick={handleLifeReward}
            size="sm"
            variant="outline"
            className="w-full"
          >
            💔 Out of Energy
          </Button>
          
          <p className="text-xs text-subtle mt-2">
            Click to test reward screens
          </p>
        </div>
      </div>

      {/* Render modal components */}
      <FlowRewardScreen />
      <LifeRewardScreen />
    </>
  );
}










