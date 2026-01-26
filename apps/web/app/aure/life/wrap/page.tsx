/**
 * AURE Life Engine - Yearly Wrap Page
 * Display yearly personal recap
 * v0.39.4 - AURE Yearly Wrap
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Share2, TrendingUp, Award, Sparkles } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';

interface YearlyWrap {
  timelineStats: {
    totalEvents: number;
    eventsByType: Record<string, number>;
  };
  categoryBreakdown: Record<string, number>;
  archetypeHistory: {
    firstArchetype: string | null;
    lastArchetype: string | null;
    evolution: string;
  };
  topItems: Array<{
    requestId: string;
    category: string;
    totalScore: number;
    imageUrl: string | null;
  }>;
  worstItems: Array<{
    requestId: string;
    category: string;
    totalScore: number;
    imageUrl: string | null;
  }>;
  vibeStory: string;
  recommendation: string;
  shareableId: string;
}

export default function YearlyWrapPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [wrap, setWrap] = useState<YearlyWrap | null>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadWrap();
    }
  }, [status, router, year]);

  async function loadWrap() {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/aure/life/yearly-wrap?year=${year}`);
      if ((res as any).ok && (res as any).data) {
        setWrap((res as any).data);
      } else {
        console.error('Failed to load wrap', (res as any).error);
      }
    } catch (error) {
      console.error('Failed to load wrap', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    if (!wrap) return;

    setSharing(true);
    try {
      const imageUrl = `/api/aure/life/yearly-wrap/share?wrapId=${wrap.shareableId}`;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `parel-wrap-${year}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to share wrap', error);
      alert('Failed to generate share card');
    } finally {
      setSharing(false);
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

  if (!wrap) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-500">No wrap data available for {year}</p>
      </div>
    );
  }

  const topCategory = Object.entries(wrap.categoryBreakdown)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your {year} Wrap</h1>
        <div className="flex items-center gap-4">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <Button onClick={handleShare} disabled={sharing}>
            {sharing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                Share my Wrap
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Category Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(wrap.categoryBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([category, count]) => (
                  <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{category}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Archetype Evolution */}
        {wrap.archetypeHistory.lastArchetype && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Archetype Evolution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <p className="text-lg capitalize">
                  {wrap.archetypeHistory.evolution}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Items */}
        {wrap.topItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Top Items of {year}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {wrap.topItems.slice(0, 10).map((item, idx) => (
                  <div
                    key={item.requestId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                      <span className="capitalize">{item.category}</span>
                    </div>
                    <span className="font-semibold text-blue-600">{item.totalScore}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vibe Story */}
        <Card>
          <CardHeader>
            <CardTitle>Your Year in Vibes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {wrap.vibeStory}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recommendation */}
        {wrap.recommendation && (
          <Card>
            <CardHeader>
              <CardTitle>Looking Ahead</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-700 italic">{wrap.recommendation}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Year Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{wrap.timelineStats.totalEvents}</div>
                <div className="text-sm text-gray-600">Total Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Object.keys(wrap.categoryBreakdown).length}</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold capitalize">{topCategory}</div>
                <div className="text-sm text-gray-600">Top Category</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{wrap.topItems.length}</div>
                <div className="text-sm text-gray-600">Top Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

