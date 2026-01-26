/**
 * Chronicle Page
 * Displays weekly world recap with stats, leaders, and AI story
 * v0.36.43 - World Chronicle 2.0
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trophy, MessageSquare, Gem, Calendar, TrendingUp } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { ChronicleStatsSnapshot } from '@/lib/chronicle/types';

export default function ChroniclePage() {
  const [chronicle, setChronicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChronicle();
  }, []);

  async function loadChronicle() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/chronicle/latest');
      if ((res as any).ok && (res as any).data) {
        setChronicle((res as any).data.chronicle);
      } else {
        setError((res as any).error || 'Failed to load chronicle');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load chronicle');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function formatNumber(num: number): string {
    return num.toLocaleString();
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !chronicle) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <Card className="border-red-500">
          <CardContent className="p-6 text-center text-red-500">
            <p>{error || 'No chronicle entries found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = chronicle.summaryJSON as ChronicleStatsSnapshot;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">World Chronicle</h1>
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Week {chronicle.weekNumber}</span>
          {chronicle.season && (
            <>
              <span>•</span>
              <span>{chronicle.season.name}</span>
            </>
          )}
          <span>•</span>
          <span>{formatDate(chronicle.createdAt)}</span>
        </div>
      </div>

      {/* Global Stats */}
      {stats.globalStats && (
        <Card className="mb-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Global Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-sm text-gray-400">Total XP</div>
                <div className="text-xl font-bold">{formatNumber(stats.globalStats.totalXP)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Total Gold</div>
                <div className="text-xl font-bold">{formatNumber(stats.globalStats.totalGold)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Missions</div>
                <div className="text-xl font-bold">{formatNumber(stats.globalStats.totalMissionsCompleted)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Fights Won</div>
                <div className="text-xl font-bold">{formatNumber(stats.globalStats.totalFightsWon)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Active Users</div>
                <div className="text-xl font-bold">{formatNumber(stats.globalStats.activeUsers)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* XP Leaders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.xpLeaders.length > 0 ? (
              <div className="space-y-3">
                {stats.xpLeaders.slice(0, 5).map((leader: any, index: number) => (
                  <div key={leader.userId} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{leader.name || leader.username || 'Unknown'}</div>
                        <div className="text-xs text-gray-400">Level {leader.level}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(leader.xp)} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No leaders this week</p>
            )}
          </CardContent>
        </Card>

        {/* Rare Drops */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gem className="w-5 h-5" />
              Rare Drops
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.rareDrops.length > 0 ? (
              <div className="space-y-3">
                {stats.rareDrops.slice(0, 5).map((drop: any) => (
                  <div key={`${drop.userId}-${drop.itemId}`} className="p-2 bg-gray-800 rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{drop.itemName}</div>
                        <div className="text-xs text-gray-400">
                          {drop.name || drop.username || 'Unknown'} • {drop.rarity}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(drop.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No rare drops this week</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Funniest Answers */}
      {stats.funniestAnswers.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Community Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.funniestAnswers.map((answer: any, index: number) => (
                <div key={index} className="p-3 bg-gray-800 rounded">
                  <div className="text-sm mb-1">
                    <span className="font-semibold">{answer.name || answer.username || 'Someone'}</span>
                    <span className="text-gray-400"> said:</span>
                  </div>
                  <div className="text-gray-300">"{answer.answerText}"</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Highlight Events */}
      {stats.events.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.events.map((event: any) => (
                <div key={event.eventId} className="p-3 bg-gray-800 rounded">
                  <div className="font-semibold mb-1">{event.eventName}</div>
                  {event.description && (
                    <div className="text-sm text-gray-400 mb-2">{event.description}</div>
                  )}
                  <div className="text-xs text-gray-500">
                    {new Date(event.startAt).toLocaleDateString()} - {new Date(event.endAt).toLocaleDateString()}
                    {event.participantCount !== undefined && (
                      <span> • {formatNumber(event.participantCount)} participants</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Story */}
      {chronicle.aiStory && (
        <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-700">
          <CardHeader>
            <CardTitle>The Week's Story</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed">{chronicle.aiStory}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
