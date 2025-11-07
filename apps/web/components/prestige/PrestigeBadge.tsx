'use client';

import { Trophy, Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrestigeBadgeProps {
  prestigeCount: number;
  prestigeTitle?: string | null;
  prestigeColorTheme?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorThemeMap: Record<string, string> = {
  amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  cyan: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
};

export function PrestigeBadge({ prestigeCount, prestigeTitle, prestigeColorTheme, size = 'md', className }: PrestigeBadgeProps) {
  if (prestigeCount === 0) return null;

  const theme = prestigeColorTheme || 'amber';
  const themeClasses = colorThemeMap[theme] || colorThemeMap.amber;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        themeClasses,
        sizeClasses[size],
        className
      )}
    >
      <Trophy className={iconSize[size]} />
      <span className="font-bold">#{prestigeCount}</span>
      {prestigeTitle && (
        <>
          <span className="opacity-60">•</span>
          <span className="truncate">{prestigeTitle}</span>
        </>
      )}
    </div>
  );
}

