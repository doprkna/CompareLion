'use client';

/**
 * Compare to Last Week Widget
 * v0.19.5 - Show weekly stat comparisons
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';

interface StatComparison {
  label: string;
  current: number;
  change: number;
  percentChange: number;
  icon: string;
}

export function CompareToLastWeek() {
  const [stats, setStats] = useState<StatComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparisonStats();
  }, []);

  const fetchComparisonStats = async () => {
    setLoading(true);
    try {
      // Fetch user's current stats and calculate comparison
      // This would ideally come from a dedicated endpoint
      // For now, we'll mock some data
      const response = await fetch('/api/reflection/latest?type=WEEKLY');
      
      if (response.ok) {
        const data = await response.json();
        const reflection = data.reflection;
        
        // Extract stats from reflection if available
        if (reflection?.stats) {
          const mockStats: StatComparison[] = [
            {
              label: 'XP',
              current: reflection.stats.currentXP || 0,
              change: reflection.stats.xpChange || 0,
              percentChange: reflection.stats.xpPercentChange || 0,
              icon: '⭐',
            },
            {
              label: 'Coins',
              current: reflection.stats.currentCoins || 0,
              change: reflection.stats.coinsChange || 0,
              percentChange: reflection.stats.coinsPercentChange || 0,
              icon: '🪙',
            },
            {
              label: 'Karma',
              current: reflection.stats.currentKarma || 0,
              change: reflection.stats.karmaChange || 0,
              percentChange: reflection.stats.karmaPercentChange || 0,
              icon: '✨',
            },
          ];
          setStats(mockStats);
        }
      }
    } catch (error) {
      logger.error('Failed to fetch comparison stats', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return '↑';
    if (change < 0) return '↓';
    return '≈';
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTooltip = (label: string, percentChange: number) => {
    if (percentChange > 20) {
      return `🔥 ${label} is soaring! Keep climbing!`;
    } else if (percentChange > 0) {
      return `📈 ${label} is growing steadily!`;
    } else if (percentChange < -10) {
      return `💪 Time to bounce back on ${label}!`;
    } else if (percentChange < 0) {
      return `📉 ${label} dipped slightly`;
    }
    return `${label} holding steady`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compare to Last Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compare to Last Week</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Complete a week of activity to see comparisons!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Compare to Last Week</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center group relative cursor-help"
              title={getTooltip(stat.label, stat.percentChange)}
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
              <div className="font-bold text-lg">{stat.current.toLocaleString()}</div>
              <div className={`text-sm font-medium ${getTrendColor(stat.change)}`}>
                {getTrendIcon(stat.change)} {Math.abs(Math.round(stat.percentChange))}%
              </div>
              
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {getTooltip(stat.label, stat.percentChange)}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

