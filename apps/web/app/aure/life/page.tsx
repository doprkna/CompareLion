/**
 * AURE Life Engine Page
 * Timeline, Archetype, and Weekly Vibe
 * v0.39.1 - AURE Life Engine
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, Sparkles, Calendar, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';

interface TimelineEvent {
  id: string;
  type: string;
  referenceId: string | null;
  category: string | null;
  createdAt: string;
}

interface Archetype {
  archetypeId: string;
  label: string;
  emoji: string;
  confidence: number;
  description: string | null;
  updatedAt: string;
  previousArchetypeId?: string | null;
  previousArchetypeLabel?: string | null;
  changeReason?: string | null;
}

interface NearbyArchetype {
  archetypeId: string;
  label: string;
  emoji: string;
  similarity: number;
}

interface WeeklyVibe {
  summary: string;
  categoryDistribution: Record<string, number>;
  avgScore: number;
  vibeChange: string | null;
  generatedAt: string;
}

export default function AureLifePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [nearbyArchetypes, setNearbyArchetypes] = useState<NearbyArchetype[]>([]);
  const [weeklyVibe, setWeeklyVibe] = useState<WeeklyVibe | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculatingArchetype, setRecalculatingArchetype] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadData();
    }
  }, [status, router]);

  async function loadData() {
    setLoading(true);
    try {
      await Promise.all([loadTimeline(), loadArchetype(), loadWeeklyVibe()]);
    } catch (error) {
      console.error('Failed to load AURE Life data', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTimeline() {
    try {
      const res = await apiFetch('/api/aure/life/timeline?limit=50');
      if ((res as any).ok && (res as any).data?.events) {
        setTimeline((res as any).data.events);
      }
    } catch (error) {
      console.error('Failed to load timeline', error);
    }
  }

  async function loadArchetype() {
    try {
      const res = await apiFetch('/api/aure/life/archetype');
      if ((res as any).ok && (res as any).data) {
        setArchetype((res as any).data.archetype);
        setNearbyArchetypes((res as any).data.nearbyArchetypes || []);
      }
    } catch (error) {
      console.error('Failed to load archetype', error);
    }
  }

  async function loadWeeklyVibe() {
    try {
      const res = await apiFetch('/api/aure/life/weekly-vibe');
      if ((res as any).ok && (res as any).data) {
        setWeeklyVibe((res as any).data);
      }
    } catch (error) {
      console.error('Failed to load weekly vibe', error);
    }
  }

  async function handleRecalculateArchetype() {
    setRecalculatingArchetype(true);
    try {
      const res = await apiFetch('/api/aure/life/archetype/recalculate', {
        method: 'POST',
      });
      if ((res as any).ok && (res as any).data) {
        setArchetype((res as any).data.archetype);
        setNearbyArchetypes((res as any).data.nearbyArchetypes || []);
      } else {
        alert((res as any).error || 'Failed to recalculate archetype');
      }
    } catch (error) {
      console.error('Failed to recalculate archetype', error);
      alert('Failed to recalculate archetype');
    } finally {
      setRecalculatingArchetype(false);
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(dateString);
  }

  function getEventIcon(type: string) {
    switch (type) {
      case 'rating':
        return '⭐';
      case 'challenge':
        return '🏆';
      case 'vs':
        return '⚔️';
      case 'quest':
        return '📜';
      case 'assist':
        return '🤖';
      default:
        return '📌';
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">AURE Life Engine</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Archetype Panel v2 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Your Archetype
            </CardTitle>
          </CardHeader>
          <CardContent>
            {archetype ? (
              <div>
                {/* Big Icon/Emoji + Label */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{archetype.emoji}</span>
                  <div>
                    <div className="text-2xl font-bold">{archetype.label}</div>
                    <div className="text-sm text-gray-500">
                      Confidence: {archetype.confidence}%
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-4">{archetype.description || 'Your unique taste profile.'}</p>

                {/* Evolution History */}
                {archetype.previousArchetypeId && archetype.previousArchetypeLabel && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-sm font-medium text-purple-900 mb-1">Evolution</div>
                    <div className="text-sm text-purple-700">
                      {archetype.previousArchetypeLabel} → {archetype.label}
                    </div>
                    {archetype.changeReason && (
                      <div className="text-xs text-purple-600 mt-1 italic">
                        {archetype.changeReason}
                      </div>
                    )}
                  </div>
                )}

                {/* Nearby Archetypes */}
                {nearbyArchetypes.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">You're also a bit:</div>
                    <div className="flex flex-wrap gap-2">
                      {nearbyArchetypes.map((nearby) => (
                        <span
                          key={nearby.archetypeId}
                          className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                        >
                          {nearby.emoji} {nearby.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Last Updated */}
                <div className="text-xs text-gray-500 mb-4">
                  Updated {formatRelativeTime(archetype.updatedAt)}
                </div>

                {/* Recalculate Button */}
                <Button
                  onClick={handleRecalculateArchetype}
                  disabled={recalculatingArchetype}
                  variant="outline"
                  size="sm"
                >
                  {recalculatingArchetype ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Recalculating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Recalculate
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-gray-500">Your archetype is being analyzed...</p>
            )}
          </CardContent>
        </Card>

        {/* Weekly Vibe Block */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Vibe
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyVibe ? (
              <div>
                <div className="text-sm text-gray-700 whitespace-pre-line mb-3">
                  {weeklyVibe.summary}
                </div>
                {weeklyVibe.vibeChange && (
                  <div className="text-sm text-gray-600 italic mb-3">
                    {weeklyVibe.vibeChange}
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  Avg Score: {weeklyVibe.avgScore.toFixed(1)} • Generated {formatRelativeTime(weeklyVibe.generatedAt)}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Your weekly vibe is being analyzed...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length > 0 ? (
            <div className="space-y-3">
              {timeline.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <span className="text-2xl">{getEventIcon(event.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{event.type}</span>
                      {event.category && (
                        <span className="text-sm text-gray-500">• {event.category}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(event.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No timeline events yet. Start rating to build your timeline!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

