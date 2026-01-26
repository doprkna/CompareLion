/**
 * Comparison Panel Component
 * Display comparison data for rating results
 * v0.38.3 - Cross-Category Comparison View
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/apiBase';
import { getCategoryPreset } from '@/lib/rating/presets';
import { MiniBar } from './MiniBar';

interface RatingMetrics {
  [key: string]: number;
}

interface TopEntry {
  requestId: string;
  imageUrl: string | null;
  metrics: RatingMetrics;
  totalScore: number;
}

interface ComparisonData {
  userScore: RatingMetrics;
  avgScore: RatingMetrics;
  percentiles: RatingMetrics;
  topEntries: TopEntry[];
}

interface ComparisonPanelProps {
  requestId: string;
  category: string;
  className?: string;
}

export function ComparisonPanel({ requestId, category, className = '' }: ComparisonPanelProps) {
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComparison();
  }, [requestId]);

  const loadComparison = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/api/rating/comparison?requestId=${requestId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load comparison');
      }

      setComparison({
        userScore: data.userScore || {},
        avgScore: data.avgScore || {},
        percentiles: data.percentiles || {},
        topEntries: data.topEntries || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comparison');
    } finally {
      setLoading(false);
    }
  };

  const preset = getCategoryPreset(category);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading comparison...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-600">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!comparison || !preset) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>You vs Everyone</CardTitle>
        <p className="text-sm text-gray-500">Category Comparison</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics Comparison */}
        <div className="space-y-3">
          {preset.metrics.map((metric) => {
            const userValue = comparison.userScore[metric.id] || 0;
            const avgValue = comparison.avgScore[metric.id] || 0;
            const percentile = comparison.percentiles[metric.id] || 0;

            return (
              <div key={metric.id} className="space-y-2 pb-3 border-b last:border-0">
                <div className="text-sm font-medium text-gray-700">{metric.label}</div>
                <div className="space-y-2">
                  <MiniBar label="Your Score" value={userValue} />
                  <MiniBar label="Category Average" value={avgValue} />
                </div>
                <div className="text-xs text-gray-500">
                  Percentile: {percentile}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Top 3 Entries */}
        {comparison.topEntries.length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-sm font-medium text-gray-700 mb-2">Top Rated Entries</div>
            <div className="space-y-2">
              {comparison.topEntries.map((entry, index) => (
                <div
                  key={entry.requestId}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"
                >
                  <div className="flex-shrink-0 w-6 text-xs font-medium text-gray-500">
                    #{index + 1}
                  </div>
                  {entry.imageUrl && (
                    <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-gray-200">
                      <img
                        src={entry.imageUrl}
                        alt={`Top entry ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-700">
                      Total Score: {Math.round(entry.totalScore)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

