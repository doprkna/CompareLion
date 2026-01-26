/**
 * VS Comparison Component
 * Side-by-side comparison of two items
 * v0.38.16 - VS Mode
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { MiniBar } from './MiniBar';

interface MetricComparison {
  id: string;
  label: string;
  left: number;
  right: number;
  winner: 'left' | 'right' | 'tie';
}

interface VsComparison {
  vsId: string;
  winner: 'left' | 'right' | 'tie';
  metrics: MetricComparison[];
  leftResult: {
    requestId: string;
    metrics: { [key: string]: number };
    summary: string;
    roast: string;
    imageUrl: string | null;
  };
  rightResult: {
    requestId: string;
    metrics: { [key: string]: number };
    summary: string;
    roast: string;
    imageUrl: string | null;
  };
  userVote?: 'left' | 'right';
  voteCounts: {
    left: number;
    right: number;
  };
}

interface VsComparisonProps {
  vsId: string;
  className?: string;
}

export function VsComparison({ vsId, className = '' }: VsComparisonProps) {
  const [comparison, setComparison] = useState<VsComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    loadComparison();
  }, [vsId]);

  const loadComparison = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/api/vs/result?vsId=${vsId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load comparison');
      }

      setComparison(data.comparison);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comparison');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (choice: 'left' | 'right') => {
    if (voting || comparison?.userVote) return;

    setVoting(true);

    try {
      const response = await apiFetch('/api/vs/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vsId, choice }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to vote');
      }

      // Reload comparison to get updated vote counts
      await loadComparison();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="text-center">Loading comparison...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !comparison) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="text-center text-red-600">{error || 'Comparison not found'}</div>
        </CardContent>
      </Card>
    );
  }

  const leftIsWinner = comparison.winner === 'left';
  const rightIsWinner = comparison.winner === 'right';

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center">VS Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Side-by-side comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Item */}
            <div className={`relative border-2 rounded-lg p-4 ${leftIsWinner ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
              {leftIsWinner && (
                <div className="absolute top-2 right-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
              )}
              <div className="space-y-3">
                {comparison.leftResult.imageUrl && (
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={comparison.leftResult.imageUrl}
                      alt="Left item"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  {comparison.metrics.slice(0, 3).map((metric) => (
                    <MiniBar
                      key={metric.id}
                      label={metric.label}
                      value={metric.left}
                      className={metric.winner === 'left' ? 'text-green-600' : ''}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600">{comparison.leftResult.roast}</div>
              </div>
            </div>

            {/* Right Item */}
            <div className={`relative border-2 rounded-lg p-4 ${rightIsWinner ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
              {rightIsWinner && (
                <div className="absolute top-2 right-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
              )}
              <div className="space-y-3">
                {comparison.rightResult.imageUrl && (
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={comparison.rightResult.imageUrl}
                      alt="Right item"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  {comparison.metrics.slice(0, 3).map((metric) => (
                    <MiniBar
                      key={metric.id}
                      label={metric.label}
                      value={metric.right}
                      className={metric.winner === 'right' ? 'text-green-600' : ''}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600">{comparison.rightResult.roast}</div>
              </div>
            </div>
          </div>

          {/* User Vote Section */}
          <div className="pt-4 border-t">
            <div className="text-sm font-medium text-gray-700 mb-3 text-center">
              Which do YOU pick?
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                variant={comparison.userVote === 'left' ? 'default' : 'outline'}
                onClick={() => handleVote('left')}
                disabled={voting || !!comparison.userVote}
                className="flex-1"
              >
                {voting && !comparison.userVote ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Left {comparison.voteCounts.left > 0 && `(${comparison.voteCounts.left})`}
                  </>
                )}
              </Button>
              <Button
                variant={comparison.userVote === 'right' ? 'default' : 'outline'}
                onClick={() => handleVote('right')}
                disabled={voting || !!comparison.userVote}
                className="flex-1"
              >
                {voting && !comparison.userVote ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Right {comparison.voteCounts.right > 0 && `(${comparison.voteCounts.right})`}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

