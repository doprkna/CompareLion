'use client';

import { cn } from '@/lib/utils';

interface QuestProgressBarProps {
  progress: number;
  max: number;
  requirementType: 'xp' | 'reflections' | 'gold' | 'missions' | 'custom';
}

const requirementLabels = {
  xp: 'XP',
  reflections: 'Reflections',
  gold: 'Gold',
  missions: 'Missions',
  custom: 'Progress',
};

export function QuestProgressBar({ progress, max, requirementType }: QuestProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.floor((progress / max) * 100)) : 0;
  const isCompleted = progress >= max;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-subtle">{requirementLabels[requirementType]}</span>
        <span className={cn(
          'font-semibold',
          isCompleted ? 'text-green-500' : 'text-text'
        )}>
          {progress} / {max}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className={cn(
            'h-2.5 rounded-full transition-all',
            isCompleted
              ? 'bg-green-500'
              : percent > 50
              ? 'bg-yellow-500'
              : 'bg-accent'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

