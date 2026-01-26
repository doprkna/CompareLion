/**
 * AURE Interaction Engine - Faction Battles Page
 * Weekly archetype wars display
 * v0.39.7 - Faction Battle 2.0 (Archetype Wars)
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trophy, Sword } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';

interface ArchetypeScore {
  id: string;
  label: string;
  emoji: string;
  score: number;
  percentage: number;
}

interface BattleData {
  weekRange: {
    start: string;
    end: string;
  } | null;
  archetypes: ArchetypeScore[];
  winnerArchetypeId: string | null;
}

interface ContributionData {
  archetypeId: string | null;
  archetypeLabel: string | null;
  totalContribution: number;
  breakdown: Record<string, number>;
}

export default function FactionBattlesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [battle, setBattle] = useState<BattleData | null>(null);
  const [contribution, setContribution] = useState<ContributionData | null>(null);

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
      await Promise.all([loadBattle(), loadContribution()]);
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadBattle() {
    try {
      const res = await apiFetch('/api/aure/interaction/battles/current');
      if ((res as any).ok && (res as any).data) {
        setBattle((res as any).data);
      }
    } catch (error) {
      console.error('Failed to load battle', error);
    }
  }

  async function loadContribution() {
    try {
      const res = await apiFetch('/api/aure/interaction/battles/my-contribution');
      if ((res as any).ok && (res as any).data) {
        setContribution((res as any).data);
      }
    } catch (error) {
      console.error('Failed to load contribution', error);
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
          <Sword className="w-8 h-8" />
          Archetype Wars
        </h1>
        {battle?.weekRange && (
          <p className="text-gray-600">
            This Week • {formatDate(battle.weekRange.start)} - {formatDate(battle.weekRange.end)}
          </p>
        )}
      </div>

      {/* Winner Banner */}
      {battle?.winnerArchetypeId && (
        <Card className="mb-6 border-yellow-400 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-900">Winner of Last Week</p>
                <p className="text-yellow-700">
                  {battle.archetypes.find((a) => a.id === battle.winnerArchetypeId)?.emoji}{' '}
                  {battle.archetypes.find((a) => a.id === battle.winnerArchetypeId)?.label}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Faction Scores */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Faction Scores</CardTitle>
        </CardHeader>
        <CardContent>
          {battle && battle.archetypes.length > 0 ? (
            <div className="space-y-4">
              {battle.archetypes.map((archetype) => {
                const isWinner = battle.winnerArchetypeId === archetype.id;
                return (
                  <div key={archetype.id} className={isWinner ? 'p-3 bg-yellow-50 rounded-lg border border-yellow-200' : ''}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{archetype.emoji}</span>
                        <span className="font-medium">{archetype.label}</span>
                        {isWinner && <Trophy className="w-4 h-4 text-yellow-600" />}
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{archetype.score}</span>
                        <span className="text-sm text-gray-500 ml-2">({archetype.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${isWinner ? 'bg-yellow-500' : 'bg-blue-600'}`}
                        style={{ width: `${Math.min(archetype.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No active battle</p>
          )}
        </CardContent>
      </Card>

      {/* My Contribution */}
      <Card>
        <CardHeader>
          <CardTitle>My Contribution</CardTitle>
        </CardHeader>
        <CardContent>
          {contribution ? (
            <div className="space-y-4">
              {contribution.archetypeId ? (
                <>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">You fight for:</p>
                    <p className="text-lg font-semibold">
                      {ARCHETYPE_CATALOG.find((a) => a.id === contribution.archetypeId)?.emoji || '❓'}{' '}
                      {contribution.archetypeLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Your contribution:</p>
                    <p className="text-2xl font-bold">{contribution.totalContribution} points</p>
                  </div>
                  {Object.keys(contribution.breakdown).length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Breakdown by source:</p>
                      <div className="space-y-1">
                        {Object.entries(contribution.breakdown).map(([source, amount]) => (
                          <div key={source} className="flex justify-between text-sm">
                            <span className="capitalize">{source}</span>
                            <span className="font-medium">{amount} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-4">
                    Uploads, ratings, and quests boost your faction.
                  </p>
                </>
              ) : (
                <p className="text-gray-500">You don't have an archetype assigned yet.</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Loading contribution...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

