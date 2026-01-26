/**
 * Social Feed List Component
 * Displays social feed from followed users
 * v0.36.42 - Social Systems 1.0
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { SocialFeedItem, ActivityType, getActivityTypeDisplayName } from '@/lib/social/types';

interface SocialFeedListProps {
  className?: string;
  limit?: number;
}

export function SocialFeedList({ className, limit = 20 }: SocialFeedListProps) {
  const [feed, setFeed] = useState<SocialFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  async function loadFeed(cursor?: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', limit.toString());
      if (cursor) params.set('cursor', cursor);

      const res = await apiFetch(`/api/social/feed?${params.toString()}`);
      if ((res as any).ok && (res as any).data) {
        const data = (res as any).data;
        if (cursor) {
          setFeed(prev => [...prev, ...data.feed]);
        } else {
          setFeed(data.feed);
        }
        setNextCursor(data.nextCursor || null);
        setHasMore(data.hasMore || false);
      }
    } catch (error) {
      console.error('Failed to load feed', error);
    } finally {
      setLoading(false);
    }
  }

  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  function getActivityIcon(type: ActivityType): string {
    switch (type) {
      case ActivityType.MISSION_COMPLETED:
        return '✅';
      case ActivityType.LEVEL_UP:
        return '⬆️';
      case ActivityType.MOUNT_UPGRADED:
        return '🐴';
      case ActivityType.ITEM_CRAFTED:
        return '🔨';
      case ActivityType.ACHIEVEMENT_UNLOCKED:
        return '🏆';
      case ActivityType.QUESTION_ANSWERED:
        return '❓';
      case ActivityType.FIGHT_WON:
        return '⚔️';
      case ActivityType.MARKETPLACE_SALE:
        return '💰';
      default:
        return '📝';
    }
  }

  if (loading && feed.length === 0) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-gray-400">
          <p>No activity yet. Follow users to see their activities!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Social Feed</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadFeed()}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {feed.map((item) => (
          <Card key={item.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getActivityIcon(item.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{item.name || item.username || 'Unknown'}</span>
                    <span className="text-xs text-gray-400">
                      {getActivityTypeDisplayName(item.type)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{item.displayText}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTimestamp(item.timestamp)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasMore && nextCursor && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={() => loadFeed(nextCursor)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

