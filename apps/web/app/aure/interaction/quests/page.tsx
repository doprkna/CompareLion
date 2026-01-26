/**
 * AURE Interaction Engine - Quests Page
 * Display daily and weekly quests with progress tracking
 * v0.39.6 - Intelligent Quests
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Progress component - using simple div-based progress bar
import { Loader2, RefreshCw, CheckCircle2, Award } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';

interface Quest {
  questId: string;
  type: string;
  description: string;
  rewardXp: number;
  frequency: 'daily' | 'weekly';
  progress: number;
  required: number;
  completedAt: string | null;
}

export default function QuestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [weeklyQuests, setWeeklyQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadQuests();
    }
  }, [status, router]);

  async function loadQuests() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/aure/interaction/quests/active');
      if ((res as any).ok && (res as any).data) {
        setDailyQuests((res as any).data.daily || []);
        setWeeklyQuests((res as any).data.weekly || []);
      } else {
        console.error('Failed to load quests', (res as any).error);
      }
    } catch (error) {
      console.error('Failed to load quests', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkProgress(questId: string) {
    setUpdating(questId);
    try {
      const res = await apiFetch('/api/aure/interaction/quests/progress', {
        method: 'POST',
        body: JSON.stringify({ questId, amount: 1 }),
      });
      if ((res as any).ok && (res as any).data) {
        if ((res as any).data.completed) {
          alert(`Quest completed! +${(res as any).data.message}`);
        }
        await loadQuests(); // Reload to update progress
      } else {
        alert((res as any).error || 'Failed to update progress');
      }
    } catch (error) {
      console.error('Failed to update progress', error);
      alert('Failed to update progress');
    } finally {
      setUpdating(null);
    }
  }

  async function handleRefresh(frequency: 'daily' | 'weekly') {
    setUpdating(`refresh-${frequency}`);
    try {
      const res = await apiFetch(`/api/aure/interaction/quests/refresh?frequency=${frequency}`, {
        method: 'POST',
      });
      if ((res as any).ok) {
        await loadQuests();
      } else {
        alert((res as any).error || 'Failed to refresh quests');
      }
    } catch (error) {
      console.error('Failed to refresh quests', error);
      alert('Failed to refresh quests');
    } finally {
      setUpdating(null);
    }
  }

  function getQuestIcon(type: string) {
    switch (type) {
      case 'upload':
        return '📤';
      case 'rate':
        return '⭐';
      case 'vs':
        return '⚔️';
      case 'mix':
        return '🎨';
      case 'assist':
        return '🤖';
      case 'vibe':
        return '✨';
      default:
        return '📋';
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Quests</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => handleRefresh('daily')}
            disabled={updating === 'refresh-daily'}
            variant="outline"
            size="sm"
          >
            {updating === 'refresh-daily' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Daily
              </>
            )}
          </Button>
          <Button
            onClick={() => handleRefresh('weekly')}
            disabled={updating === 'refresh-weekly'}
            variant="outline"
            size="sm"
          >
            {updating === 'refresh-weekly' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Weekly
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Daily Quests */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Daily Quests</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dailyQuests.length > 0 ? (
            dailyQuests.map((quest) => (
              <Card key={quest.questId} className={quest.completedAt ? 'opacity-75' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="text-2xl">{getQuestIcon(quest.type)}</span>
                    <span className="flex-1">{quest.description}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">
                        {quest.progress} / {quest.required}
                      </span>
                      <span className="flex items-center gap-1 text-blue-600 font-semibold">
                        <Award className="w-4 h-4" />
                        {quest.rewardXp} XP
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (quest.progress / quest.required) * 100)}%` }}
                      />
                    </div>
                  </div>
                  {quest.completedAt ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Completed!
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleMarkProgress(quest.questId)}
                      disabled={updating === quest.questId}
                      size="sm"
                      className="w-full"
                    >
                      {updating === quest.questId ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Mark Progress'
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 col-span-3">No daily quests available</p>
          )}
        </div>
      </div>

      {/* Weekly Quests */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Weekly Quests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weeklyQuests.length > 0 ? (
            weeklyQuests.map((quest) => (
              <Card key={quest.questId} className={quest.completedAt ? 'opacity-75' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="text-2xl">{getQuestIcon(quest.type)}</span>
                    <span className="flex-1">{quest.description}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">
                        {quest.progress} / {quest.required}
                      </span>
                      <span className="flex items-center gap-1 text-blue-600 font-semibold">
                        <Award className="w-4 h-4" />
                        {quest.rewardXp} XP
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (quest.progress / quest.required) * 100)}%` }}
                      />
                    </div>
                  </div>
                  {quest.completedAt ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Completed!
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleMarkProgress(quest.questId)}
                      disabled={updating === quest.questId}
                      size="sm"
                      className="w-full"
                    >
                      {updating === quest.questId ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Mark Progress'
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 col-span-2">No weekly quests available</p>
          )}
        </div>
      </div>
    </div>
  );
}

