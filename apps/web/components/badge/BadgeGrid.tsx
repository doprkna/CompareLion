'use client';

import { Badge } from '@parel/core/hooks/useBadges';
import { BadgeCard } from './BadgeCard';

interface BadgeGridProps {
  badges: Badge[];
  onBadgeClick?: (badge: Badge) => void;
  loading?: boolean;
}

export function BadgeGrid({ badges, onBadgeClick, loading }: BadgeGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-card border border-border rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="text-center py-12 text-subtle">
        <p className="text-lg">No badges found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {badges.map((badge) => (
        <BadgeCard
          key={badge.id}
          badge={badge}
          onClick={() => onBadgeClick?.(badge)}
        />
      ))}
    </div>
  );
}

