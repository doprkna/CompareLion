'use client';

import { Badge } from '@/hooks/useBadges';
import { cn } from '@/lib/utils';

interface BadgeCardProps {
  badge: Badge;
  onClick?: () => void;
}

const rarityColors = {
  common: 'border-gray-400 bg-gray-50',
  rare: 'border-blue-400 bg-blue-50',
  epic: 'border-purple-400 bg-purple-50',
  legendary: 'border-yellow-400 bg-yellow-50',
  mythic: 'border-pink-400 bg-pink-50',
  eternal: 'border-indigo-400 bg-indigo-50',
};

const rarityGlow = {
  common: '',
  rare: 'shadow-blue-500/20',
  epic: 'shadow-purple-500/30',
  legendary: 'shadow-yellow-500/40',
  mythic: 'shadow-pink-500/50',
  eternal: 'shadow-indigo-500/60',
};

export function BadgeCard({ badge, onClick }: BadgeCardProps) {
  const isUnlocked = badge.isUnlocked ?? false;
  const rarity = badge.rarity || 'common';
  const colorClass = rarityColors[rarity] || rarityColors.common;
  const glowClass = rarityGlow[rarity] || '';

  return (
    <div
      className={cn(
        'relative aspect-square rounded-lg border-2 p-4 transition-all cursor-pointer',
        'hover:scale-105 hover:shadow-lg',
        colorClass,
        glowClass,
        !isUnlocked && 'opacity-50 grayscale',
        isUnlocked && 'ring-2 ring-accent/50'
      )}
      onClick={onClick}
    >
      {/* Badge Icon */}
      <div className="flex items-center justify-center h-full">
        <span className="text-4xl md:text-5xl">{badge.icon}</span>
      </div>

      {/* Claim Indicator */}
      {isUnlocked && !badge.isClaimed && badge.canClaim && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      )}

      {/* Locked Overlay */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
          <span className="text-2xl">🔒</span>
        </div>
      )}

      {/* Rarity Badge */}
      <div className="absolute bottom-2 left-2 right-2">
        <div className={cn(
          'text-xs font-semibold text-center px-2 py-1 rounded',
          `bg-${rarity}-500/20 text-${rarity}-700`
        )}>
          {rarity}
        </div>
      </div>
    </div>
  );
}

