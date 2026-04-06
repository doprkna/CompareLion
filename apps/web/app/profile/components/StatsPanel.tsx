'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { getArchetype } from '@parel/core/config/archetypeConfig';
import { useUserSummary } from '@/lib/hooks';
import { getXpProgressDetail } from '@/lib/xp';
import Link from 'next/link';
import { Sparkles, TrendingUp } from 'lucide-react';

interface Stats {
  str: number;
  int: number;
  cha: number;
  luck: number;
}

export default function StatsPanel() {
  const { data: summary, isLoading: summaryLoading } = useUserSummary();
  const [stats, setStats] = useState<Stats | null>(null);
  const [archetype, setArchetype] = useState<string | null>(null);
  const [loadingArchetype, setLoadingArchetype] = useState(true);

  useEffect(() => {
    loadArchetypeAndStats();
  }, []);

  async function loadArchetypeAndStats() {
    try {
      const res = await fetch('/api/progression/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setArchetype(data.archetype);
      }
    } catch (error) {
      console.error('[StatsPanel] Load error:', error);
    } finally {
      setLoadingArchetype(false);
    }
  }

  const archetypeDef = archetype ? getArchetype(archetype) : null;
  const loading = summaryLoading || loadingArchetype;

  const xpDetail = summary ? getXpProgressDetail(summary.xp) : null;

  if (loading && !summary && !xpDetail) {
    return (
      <Card className="bg-card border-2 border-border">
        <CardContent className="p-6">
          <div className="text-center text-subtle">Loading stats...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-2 border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          Character Stats & Progression
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level & XP Progress - canonical from useUserSummary */}
        {summary && xpDetail && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-text">
                Level {summary.level}
              </span>
              {archetypeDef && (
                <Link
                  href="/profile/archetype"
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  {archetypeDef.emoji} {archetypeDef.name}
                </Link>
              )}
              {!archetype && !loadingArchetype && (
                <Link
                  href="/profile/archetype"
                  className="text-xs text-accent hover:underline"
                >
                  Select Archetype →
                </Link>
              )}
            </div>

            <div className="w-full bg-bg rounded-full h-3 mb-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all duration-300"
                style={{ width: `${xpDetail.progress * 100}%` }}
              />
            </div>
            <div className="text-xs text-subtle text-center">
              {xpDetail.currentXP} / {xpDetail.requiredXP} XP
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {stats ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-bg/50 rounded-lg border border-border">
              <div className="text-xs uppercase text-subtle mb-1">Strength</div>
              <div className="text-2xl font-bold text-red-400">{stats.str}</div>
              <div className="text-xs text-subtle">Physical Power</div>
            </div>
            <div className="p-3 bg-bg/50 rounded-lg border border-border">
              <div className="text-xs uppercase text-subtle mb-1">Intelligence</div>
              <div className="text-2xl font-bold text-blue-400">{stats.int}</div>
              <div className="text-xs text-subtle">XP & Reflection</div>
            </div>
            <div className="p-3 bg-bg/50 rounded-lg border border-border">
              <div className="text-xs uppercase text-subtle mb-1">Charisma</div>
              <div className="text-2xl font-bold text-purple-400">{stats.cha}</div>
              <div className="text-xs text-subtle">Social & Shop</div>
            </div>
            <div className="p-3 bg-bg/50 rounded-lg border border-border">
              <div className="text-xs uppercase text-subtle mb-1">Luck</div>
              <div className="text-2xl font-bold text-yellow-400">{stats.luck}</div>
              <div className="text-xs text-subtle">Crit & Drops</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-subtle">
            <p>No stats available</p>
            {!archetype && !loadingArchetype && (
              <Link
                href="/profile/archetype"
                className="text-accent hover:underline text-sm mt-2 inline-block"
              >
                Select an archetype to begin →
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
