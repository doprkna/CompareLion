/**
 * Rating Card Component
 * Display AI rating results
 * v0.38.1 - AI Universal Rating Engine
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Share2, Sparkles, Lock } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { getCategoryPreset } from '@/lib/rating/presets';
import { MiniBar } from './MiniBar';

interface RatingMetrics {
  [key: string]: number;
}

interface RatingCardProps {
  requestId: string;
  category: string;
  className?: string;
}

interface DeepDiveAnalysis {
  extendedMetrics: RatingMetrics;
  longSummary: string;
  improvementTips: string[];
  cohortComparisons: {
    top10: RatingMetrics;
    median: RatingMetrics;
  };
}

export function RatingCard({ requestId, category, className = '' }: RatingCardProps) {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState<RatingMetrics | null>(null);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [roastText, setRoastText] = useState<string | null>(null);
  const [flavorCompliment, setFlavorCompliment] = useState<string | null>(null);
  const [flavorRoast, setFlavorRoast] = useState<string | null>(null);
  const [flavorNeutral, setFlavorNeutral] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);
  const [deepDiveAnalysis, setDeepDiveAnalysis] = useState<DeepDiveAnalysis | null>(null);
  const [deepDiveError, setDeepDiveError] = useState<string | null>(null);

  const isPremium = session?.user?.isPremium || false;

  useEffect(() => {
    loadRating();
  }, [requestId]);

  const loadRating = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/api/rating/result?requestId=${requestId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load rating');
      }

      setMetrics(data.metrics || {});
      setSummaryText(data.summaryText || '');
      setRoastText(data.roastText || '');

      // Load flavor text
      loadFlavor();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rating');
    } finally {
      setLoading(false);
    }
  };

  const loadFlavor = async () => {
    try {
      const response = await apiFetch(`/api/rating/flavor?requestId=${requestId}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setFlavorCompliment(data.compliment || null);
        setFlavorRoast(data.roast || null);
        setFlavorNeutral(data.neutral || null);
      }
    } catch (err) {
      // Silently fail - flavor is optional
    }
  };

  const handleShareCard = async () => {
    if (isGeneratingShare) return;

    setIsGeneratingShare(true);
    try {
      const response = await apiFetch('/api/rating/share-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate share card');
      }

      // Get blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `parel-rating-${requestId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate share card');
    } finally {
      setIsGeneratingShare(false);
    }
  };

  const handleDeepDive = async () => {
    if (!isPremium) {
      setDeepDiveOpen(true);
      return;
    }

    setDeepDiveOpen(true);
    setDeepDiveLoading(true);
    setDeepDiveError(null);

    try {
      const response = await apiFetch(`/api/rating/deep-dive?requestId=${requestId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 403) {
          throw new Error('Premium subscription required');
        }
        throw new Error(data.error || 'Failed to load deep dive analysis');
      }

      setDeepDiveAnalysis(data.analysis);
    } catch (err) {
      setDeepDiveError(err instanceof Error ? err.message : 'Failed to load deep dive analysis');
    } finally {
      setDeepDiveLoading(false);
    }
  };

  const preset = getCategoryPreset(category);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading rating...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-600">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Rating Results</CardTitle>
            {preset && (
              <p className="text-sm text-gray-500">{preset.name} Evaluation</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeepDive}
              className={`flex items-center gap-2 ${isPremium ? 'text-purple-700 border-purple-300 hover:bg-purple-50' : ''}`}
            >
              {isPremium ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Deep Dive
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Deep Dive
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareCard}
              disabled={isGeneratingShare}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              {isGeneratingShare ? 'Generating...' : 'Share as Image'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics */}
        {metrics && preset && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Scores:</div>
            <div className="space-y-3">
              {preset.metrics.map((metric) => {
                const score = metrics[metric.id] || 0;
                return (
                  <div key={metric.id} className="space-y-1">
                    <MiniBar label={metric.label} value={score} />
                    <div className="text-xs text-gray-500 ml-0">{metric.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary */}
        {summaryText && (
          <div className="pt-2 border-t">
            <div className="text-sm font-medium text-gray-700 mb-1">Summary:</div>
            <div className="text-sm text-gray-600">{summaryText}</div>
          </div>
        )}

        {/* Roast */}
        {roastText && (
          <div className="pt-2 border-t">
            <div className="text-sm font-medium text-gray-700 mb-1">Verdict:</div>
            <div className="text-sm text-blue-600 font-medium">{roastText}</div>
          </div>
        )}

        {/* Parel's Take - Flavor Text */}
        {(flavorCompliment || flavorRoast) && (
          <div className="pt-2 border-t">
            <div className="text-sm font-medium text-gray-700 mb-2">Parel's Take</div>
            {flavorCompliment && (
              <div className="text-sm text-green-600 mb-1">{flavorCompliment}</div>
            )}
            {flavorRoast && (
              <div className="text-sm text-orange-600">{flavorRoast}</div>
            )}
            {flavorNeutral && (
              <div className="text-sm text-gray-500 mt-1 italic">{flavorNeutral}</div>
            )}
          </div>
        )}
      </CardContent>

      {/* Deep Dive Modal */}
      <Dialog open={deepDiveOpen} onOpenChange={setDeepDiveOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Deep Dive Analysis
            </DialogTitle>
            <DialogDescription>
              Premium extended insights and recommendations
            </DialogDescription>
          </DialogHeader>

          {!isPremium ? (
            <div className="py-8 text-center space-y-4">
              <Lock className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Unlock Premium to access Deep Dive</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get extended AI insights, multi-paragraph analysis, extra metrics, improvement suggestions, and cohort comparisons.
                </p>
                <Button
                  onClick={() => {
                    // TODO: Link to premium subscription page
                    window.location.href = '/subscription';
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Upgrade to Premium
                </Button>
              </div>
            </div>
          ) : deepDiveLoading ? (
            <div className="text-center py-8">Generating deep dive analysis...</div>
          ) : deepDiveError ? (
            <div className="text-center py-8 text-red-600">{deepDiveError}</div>
          ) : deepDiveAnalysis ? (
            <div className="space-y-6">
              {/* Extended Metrics */}
              {Object.keys(deepDiveAnalysis.extendedMetrics).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Extended Metrics</h3>
                  <div className="space-y-3">
                    {Object.entries(deepDiveAnalysis.extendedMetrics).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <MiniBar label={key.replace(/([A-Z])/g, ' $1').trim()} value={value} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Long Summary */}
              {deepDiveAnalysis.longSummary && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold mb-2">Detailed Analysis</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {deepDiveAnalysis.longSummary}
                  </div>
                </div>
              )}

              {/* Improvement Tips */}
              {deepDiveAnalysis.improvementTips.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold mb-2">Improvement Tips</h3>
                  <ul className="space-y-2">
                    {deepDiveAnalysis.improvementTips.map((tip, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cohort Comparisons */}
              {(Object.keys(deepDiveAnalysis.cohortComparisons.top10).length > 0 ||
                Object.keys(deepDiveAnalysis.cohortComparisons.median).length > 0) && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold mb-3">Cohort Comparisons</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-medium text-gray-600 mb-2">Top 10%</h4>
                      <div className="space-y-2">
                        {Object.entries(deepDiveAnalysis.cohortComparisons.top10).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span className="ml-2 font-medium">{Math.round(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-600 mb-2">Median</h4>
                      <div className="space-y-2">
                        {Object.entries(deepDiveAnalysis.cohortComparisons.median).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span className="ml-2 font-medium">{Math.round(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

