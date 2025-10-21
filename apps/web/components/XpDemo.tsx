'use client';

import { Button } from '@/components/ui/button';
import { useXp } from '@/components/XpProvider';

/**
 * Demo component showing how to use the XP animation system
 * Remove this component or integrate into your actual game logic
 */
export function XpDemo() {
  const { triggerXp } = useXp();

  return (
    <div className="fixed bottom-40 left-6 z-40 space-y-2">
      <div className="bg-card border border-border rounded-lg p-4 space-y-2 shadow-lg backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-text mb-2">XP Demo</h3>
        
        <Button
          onClick={() => triggerXp(1)}
          size="sm"
          variant="outline"
          className="w-full"
        >
          +1 XP ✨
        </Button>
        
        <Button
          onClick={() => triggerXp(5)}
          size="sm"
          variant="outline"
          className="w-full"
        >
          +5 XP ✨
        </Button>
        
        <Button
          onClick={() => triggerXp(10, 'coins')}
          size="sm"
          variant="outline"
          className="w-full"
        >
          +10 Coins 🪙
        </Button>
        
        <Button
          onClick={() => triggerXp(3, 'diamonds')}
          size="sm"
          variant="outline"
          className="w-full"
        >
          +3 Gems 💎
        </Button>
        
        <Button
          onClick={() => triggerXp(1, 'streak')}
          size="sm"
          variant="outline"
          className="w-full"
        >
          +1 Streak 🔥
        </Button>
        
        <Button
          onClick={() => {
            // Multiple popups demo
            triggerXp(1);
            setTimeout(() => triggerXp(2), 200);
            setTimeout(() => triggerXp(5, 'coins'), 400);
          }}
          size="sm"
          variant="default"
          className="w-full"
        >
          Combo! 🎉
        </Button>
        
        <p className="text-xs text-subtle mt-2">
          Click to test XP animations
        </p>
      </div>
    </div>
  );
}










