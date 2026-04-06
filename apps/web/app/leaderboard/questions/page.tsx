'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiBase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface LeaderboardItem {
  question: {
    id: string;
    text: string;
    categoryId?: string | null;
    categoryName?: string | null;
  };
  stats: {
    likeCount: number;
    dislikeCount: number;
    score: number;
    window: string;
  };
}

export default function QuestionLeaderboardPage() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'trending' | 'top'>('trending');
  const [window, setWindow] = useState<'48h' | '7d'>('48h');
  const [geo, setGeo] = useState<'global' | 'country'>('global');
  const [applied, setApplied] = useState<{
    mode: string;
    window: string;
    geo: string;
    country: string | null;
  } | null>(null);

  const load = async (cursor?: string | null) => {
    if (cursor === undefined) setLoading(true);
    try {
      const params = new URLSearchParams({
        mode,
        window: mode === 'top' ? 'all' : window,
        geo,
        limit: '20',
      });
      if (cursor) params.set('cursor', cursor);
      const res = await apiFetch(`/api/questions/leaderboard?${params}`);
      const d = (res as any).data?.data ?? (res as any).data;
      if (d?.items) {
        setItems((prev) => (cursor ? [...prev, ...d.items] : d.items));
        setNextCursor(d.nextCursor ?? null);
        setApplied(d.applied ?? null);
      } else {
        setItems([]);
        setNextCursor(null);
      }
    } catch {
      setItems([]);
      setNextCursor(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [mode, window, geo]);

  const loadMore = () => {
    if (nextCursor && !loading) load(nextCursor);
  };

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href="/leaderboard"
            className="text-sm text-subtle hover:text-accent"
          >
            ← Back to Leaderboard
          </Link>
          <h1 className="text-2xl font-bold text-text mt-2">
            Question Leaderboard
          </h1>
          <p className="text-sm text-subtle mt-1">
            Most liked and trending questions
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader className="py-3">
            <h2 className="text-sm font-medium text-text">Filters</h2>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div>
              <label className="text-xs text-subtle block mb-1">Mode</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={mode === 'trending' ? 'default' : 'outline'}
                  onClick={() => setMode('trending')}
                >
                  Trending
                </Button>
                <Button
                  size="sm"
                  variant={mode === 'top' ? 'default' : 'outline'}
                  onClick={() => setMode('top')}
                >
                  Top
                </Button>
              </div>
            </div>
            {mode === 'trending' && (
              <div>
                <label className="text-xs text-subtle block mb-1">Window</label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={window === '48h' ? 'default' : 'outline'}
                    onClick={() => setWindow('48h')}
                  >
                    48h
                  </Button>
                  <Button
                    size="sm"
                    variant={window === '7d' ? 'default' : 'outline'}
                    onClick={() => setWindow('7d')}
                  >
                    7d
                  </Button>
                </div>
              </div>
            )}
            <div>
              <label className="text-xs text-subtle block mb-1">Geo</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={geo === 'global' ? 'default' : 'outline'}
                  onClick={() => setGeo('global')}
                >
                  Global
                </Button>
                <Button
                  size="sm"
                  variant={geo === 'country' ? 'default' : 'outline'}
                  onClick={() => setGeo('country')}
                >
                  My Country
                </Button>
              </div>
              {geo === 'country' && applied?.country && (
                <p className="text-xs text-subtle mt-1">
                  Showing: {applied.country}
                </p>
              )}
              {geo === 'country' && !applied?.country && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  No country set — falling back to global
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* List */}
        <div className="space-y-2">
          {loading && items.length === 0 ? (
            <div className="py-12 text-center text-subtle">
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-subtle">
              No questions yet. Like some questions to see them here!
            </div>
          ) : (
            items.map((item, idx) => (
              <Link key={item.question.id} href={`/q/${item.question.id}`}>
                <Card className="bg-card border-border hover:border-accent/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text line-clamp-2">
                          {item.question.text}
                        </p>
                        {item.question.categoryName && (
                          <p className="text-xs text-subtle mt-1">
                            {item.question.categoryName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="flex items-center gap-1 text-sm">
                          <ThumbsUp className="h-4 w-4 text-accent" />
                          {item.stats.likeCount}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-subtle">
                          <ThumbsDown className="h-4 w-4" />
                          {item.stats.dislikeCount}
                        </span>
                        <span className="font-semibold text-accent">
                          {item.stats.score >= 0 ? '+' : ''}{item.stats.score}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        {nextCursor && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={loading}
              className="gap-2"
            >
              {loading ? 'Loading...' : 'Load more'}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
