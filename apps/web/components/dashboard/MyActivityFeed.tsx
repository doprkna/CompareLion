'use client';

/**
 * My Activity Feed
 * v0.19.6 - Display recent user activities
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string | null;
  metadata: any;
  createdAt: string;
}

export function MyActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/activity/recent');
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      } else {
        setError('Failed to load activities');
      }
    } catch (err) {
      logger.error('Failed to fetch activities', err);
      setError('Error loading activities');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string): string => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('reflection')) return '📝';
    if (lowerType.includes('quote')) return '💬';
    if (lowerType.includes('summary')) return '📊';
    if (lowerType.includes('badge') || lowerType.includes('achievement')) return '🏆';
    if (lowerType.includes('level')) return '⬆️';
    if (lowerType.includes('friend')) return '👥';
    if (lowerType.includes('quest') || lowerType.includes('challenge')) return '⚔️';
    return '✨';
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={fetchActivities} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🌱</div>
            <p className="text-muted-foreground">No activities yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start exploring to see your activities here!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions</CardDescription>
        </div>
        <Button
          onClick={fetchActivities}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Refresh activities"
        >
          <span className="text-lg">🔄</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xl">
                {getActivityIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm leading-tight mb-1">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                    {activity.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {getTimeAgo(activity.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View More Link (optional) */}
        {activities.length >= 10 && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" className="text-xs">
              View All Activities →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

