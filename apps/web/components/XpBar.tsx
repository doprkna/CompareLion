'use client';

import { useSession } from 'next-auth/react';
import { Sparkles } from 'lucide-react';
import { useUserSummary } from '@/lib/hooks';

interface XpBarProps {
  variant?: 'header' | 'dropdown';
  userId?: string;
}

export function XpBar({ variant = 'header' }: XpBarProps) {
  const { data: session, status } = useSession();
  const { data, isLoading } = useUserSummary();

  if (status === 'loading' || !session?.user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 bg-border rounded animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { level, xp, progress } = data;

  if (variant === 'dropdown') {
    return (
      <div className="space-y-2 p-3 bg-bg rounded-lg">
        <div className="flex items-center justify-between text-xs">
          <span className="text-subtle">Level {level}</span>
          <span className="text-accent font-bold">{xp} XP</span>
        </div>
        <div className="relative w-full h-2 bg-border rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-[10px] text-subtle text-center">
          {Math.round(progress)}% to Level {level + 1}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-bg/50 px-3 py-1.5 rounded-full border border-border">
      <Sparkles className="h-3.5 w-3.5 text-accent" />
      <div className="flex items-center gap-2 text-xs">
        <span className="text-text font-bold">Lv.{level}</span>
        <div className="relative w-16 h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-blue-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-subtle">{xp}</span>
      </div>
    </div>
  );
}

export default XpBar;
