/**
 * AURE Assist Engine - Coach 2.0 Page
 * Personalized Lifestyle Improvement Engine
 * v0.39.9 - Coach 2.0 (Adaptive + Premium-ready)
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, TrendingUp, TrendingDown, Minus, Target, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';

type CoachType = 'snack' | 'desk' | 'outfit' | 'room' | 'generic';

interface CoachAnalysis {
  strengths: string[];
  weaknesses: string[];
  recentTrend: 'up' | 'down' | 'flat';
  avgMetrics: Record<string, number>;
}

interface CoachGoal {
  id: string;
  title: string;
  description: string;
  targetMetric: string;
  targetDelta: number;
  progress: number;
  createdAt: string;
  completedAt: string | null;
}

interface CoachSummary {
  id: string;
  coachType: string;
  weekOf: string;
  summaryText: string;
  createdAt: string;
}

export default function CoachPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coachType, setCoachType] = useState<CoachType>('snack');
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<CoachAnalysis | null>(null);
  const [goals, setGoals] = useState<CoachGoal[]>([]);
  const [summary, setSummary] = useState<CoachSummary | null>(null);
  const [generatingGoals, setGeneratingGoals] = useState(false);
  const [premiumError, setPremiumError] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadData();
    }
  }, [status, router, coachType]);

  async function loadData() {
    setLoading(true);
    setPremiumError(false);
    try {
      await Promise.all([loadAnalysis(), loadSummary()]);
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalysis() {
    try {
      const res = await apiFetch(`/api/aure/assist/coach/analysis?type=${coachType}`);
      if ((res as any).ok && (res as any).data) {
        setAnalysis((res as any).data);
      } else {
        const error = (res as any).error || '';
        if (error.includes('premium') || error.includes('Premium')) {
          setPremiumError(true);
        }
      }
    } catch (error) {
      console.error('Failed to load analysis', error);
    }
  }

  async function loadSummary() {
    try {
      const res = await apiFetch(`/api/aure/assist/coach/summary?type=${coachType}`);
      if ((res as any).ok && (res as any).data) {
        setSummary((res as any).data);
      }
    } catch (error) {
      console.error('Failed to load summary', error);
    }
  }

  async function handleGenerateGoals() {
    setGeneratingGoals(true);
    try {
      const res = await apiFetch('/api/aure/assist/coach/generate-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: coachType }),
      });
      if ((res as any).ok && (res as any).data?.goals) {
        setGoals((res as any).data.goals);
      } else {
        const error = (res as any).error || '';
        if (error.includes('premium') || error.includes('Premium')) {
          setPremiumError(true);
        }
      }
    } catch (error) {
      console.error('Failed to generate goals', error);
    } finally {
      setGeneratingGoals(false);
    }
  }

  function getTrendIcon(trend: 'up' | 'down' | 'flat') {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  }

  function getTrendText(trend: 'up' | 'down' | 'flat') {
    switch (trend) {
      case 'up':
        return 'Improving';
      case 'down':
        return 'Declining';
      default:
        return 'Stable';
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-8 h-8" />
          Coach 2.0
        </h1>
        <p className="text-gray-600">Personalized lifestyle improvement engine</p>
      </div>

      {/* Coach Type Selector */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div>
            <label className="block text-sm font-medium mb-2">Coach Type:</label>
            <select
              value={coachType}
              onChange={(e) => setCoachType(e.target.value as CoachType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="snack">Snack Coach</option>
              <option value="desk">Desk Coach</option>
              <option value="outfit">Style Coach</option>
              <option value="room">Room Coach</option>
              <option value="generic">Generic Coach</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Premium Error */}
      {premiumError && (
        <Card className="mb-6 border-yellow-400 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-800">
              Coach is a premium feature. Upgrade to access personalized coaching.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Analysis Card */}
      {analysis && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Recent Trend */}
              <div className="flex items-center gap-2">
                {getTrendIcon(analysis.recentTrend)}
                <span className="font-medium">Recent Trend: {getTrendText(analysis.recentTrend)}</span>
              </div>

              {/* Strengths */}
              {analysis.strengths.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2 text-green-700">Strengths</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.strengths.map((strength, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                      >
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Weaknesses */}
              {analysis.weaknesses.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2 text-red-700">Areas for Improvement</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.weaknesses.map((weakness, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                      >
                        {weakness}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Goals</CardTitle>
            <Button
              onClick={handleGenerateGoals}
              disabled={generatingGoals || premiumError}
              size="sm"
              variant="outline"
            >
              {generatingGoals ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate Goals
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <p className="text-gray-500">No active goals. Click "Generate Goals" to create improvement goals.</p>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        {goal.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Target: {goal.targetMetric} +{goal.targetDelta} points
                      </p>
                    </div>
                    {goal.completedAt && (
                      <span className="text-sm text-green-600 font-medium">Completed</span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{goal.progress}% complete</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-line">{summary.summaryText}</p>
            <p className="text-xs text-gray-500 mt-2">
              Week of {new Date(summary.weekOf).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

