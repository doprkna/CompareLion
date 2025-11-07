'use client';

import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegionBuffBadgeProps {
  buffType: 'xp' | 'gold' | 'mood' | 'reflection';
  buffValue: number;
}

const buffIcons = {
  xp: '💫',
  gold: '🪙',
  mood: '😊',
  reflection: '💭',
};

const buffLabels = {
  xp: 'XP Gain',
  gold: 'Gold Gain',
  mood: 'Mood',
  reflection: 'Reflections',
};

export function RegionBuffBadge({ buffType, buffValue }: RegionBuffBadgeProps) {
  const percentage = (buffValue * 100).toFixed(1);
  const isPositive = buffValue > 0;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
      <span className="text-lg">{buffIcons[buffType]}</span>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-text">{buffLabels[buffType]}</span>
        <span className={cn(
          'text-sm font-bold',
          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        )}>
          {isPositive ? '+' : ''}{percentage}%
        </span>
      </div>
    </div>
  );
}

