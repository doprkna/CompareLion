'use client';

import { FeedItem as FeedItemType } from '@/hooks/useSocial';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Award, Target, Users } from 'lucide-react';
// Format time ago - simple implementation for MVP
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

interface FeedItemProps {
  item: FeedItemType;
}

const typeIcons = {
  badge: Award,
  duel: Trophy,
  quest: Target,
};

const typeColors = {
  badge: 'text-purple-500',
  duel: 'text-yellow-500',
  quest: 'text-blue-500',
};

export function FeedItem({ item }: FeedItemProps) {
  const Icon = typeIcons[item.type];
  const timeAgo = formatTimeAgo(new Date(item.timestamp));

  return (
    <Card className="bg-card border-border hover:border-accent/50 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={typeColors[item.type]}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            {item.type === 'badge' && (
              <p className="text-sm text-text">
                <span className="font-semibold">{item.username}</span> unlocked badge{' '}
                <span className="font-semibold">{item.data.badgeName}</span>
              </p>
            )}
            {item.type === 'duel' && (
              <p className="text-sm text-text">
                <span className="font-semibold">{item.data.winner}</span> won a duel against{' '}
                <span className="font-semibold">
                  {item.data.winner === item.data.challenger ? item.data.opponent : item.data.challenger}
                </span>
              </p>
            )}
            {item.type === 'quest' && (
              <p className="text-sm text-text">
                <span className="font-semibold">{item.username}</span> completed quest{' '}
                <span className="font-semibold">{item.data.questTitle}</span>
              </p>
            )}
            <p className="text-xs text-subtle mt-1">{timeAgo}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

