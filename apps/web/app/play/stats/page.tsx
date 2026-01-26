"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { apiFetch } from '@/lib/apiClient';
import { 
  Heart, 
  Sword, 
  Shield, 
  Zap, 
  Gauge, 
  Package,
  TrendingUp,
  ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';

interface ComputedStats {
  level: number;
  xp: number;
  maxHp: number;
  attackPower: number;
  defense: number;
  critChance: number;
  speed: number;
  equipment: Array<{
    id: string;
    name: string;
    type: string;
    rarity: string;
    power: number;
    defense: number | null;
  }>;
}

export default function StatsPage() {
  const [stats, setStats] = useState<ComputedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ success: boolean; data: ComputedStats }>('/api/rpg/stats');
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError('Failed to load stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const getXPProgress = (xp: number, level: number) => {
    // Simple XP calculation (can be improved with actual XP table)
    const xpForCurrentLevel = level * 100;
    const xpForNextLevel = (level + 1) * 100;
    const currentXP = xp - xpForCurrentLevel;
    const requiredXP = xpForNextLevel - xpForCurrentLevel;
    const progress = Math.min(1, Math.max(0, currentXP / requiredXP));
    return { currentXP, requiredXP, progress };
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'text-gray-400',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-yellow-400',
      alpha: 'text-red-400',
    };
    return colors[rarity.toLowerCase()] || 'text-gray-400';
  };

  const getRarityBgColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'bg-gray-800 border-gray-700',
      uncommon: 'bg-green-900/30 border-green-700',
      rare: 'bg-blue-900/30 border-blue-700',
      epic: 'bg-purple-900/30 border-purple-700',
      legendary: 'bg-yellow-900/30 border-yellow-700',
      alpha: 'bg-red-900/30 border-red-700',
    };
    return colors[rarity.toLowerCase()] || 'bg-gray-800 border-gray-700';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Link href="/play" className="text-accent hover:underline mb-2 inline-block">
            <ArrowLeft className="h-4 w-4 inline mr-2" />
            Back to Play
          </Link>
          <h1 className="text-4xl font-bold text-text">Character Sheet</h1>
        </div>
        <SkeletonLoader variant="card" count={3} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="bg-card border border-destructive">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Error: {error || 'Failed to load stats'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const xpProgress = getXPProgress(stats.xp, stats.level);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/play" className="text-accent hover:underline mb-2 inline-block">
          <ArrowLeft className="h-4 w-4 inline mr-2" />
          Back to Play
        </Link>
        <h1 className="text-4xl font-bold text-text">Character Sheet</h1>
        <p className="text-subtle mt-2">Your hero's complete stat breakdown</p>
      </div>

      {/* Level + XP Bar */}
      <Card className="mb-6 bg-card border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-2xl">Level {stats.level}</span>
            <span className="text-sm text-subtle">
              {xpProgress.currentXP.toFixed(0)} / {xpProgress.requiredXP} XP
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
            <div
              className="bg-accent h-full transition-all duration-300"
              style={{ width: `${xpProgress.progress * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Core Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-6 w-6 text-red-400" />
              <span className="text-sm text-subtle">Max HP</span>
            </div>
            <div className="text-3xl font-bold text-text">{stats.maxHp}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Sword className="h-6 w-6 text-orange-400" />
              <span className="text-sm text-subtle">Attack Power</span>
            </div>
            <div className="text-3xl font-bold text-text">{stats.attackPower}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="text-sm text-subtle">Defense</span>
            </div>
            <div className="text-3xl font-bold text-text">{stats.defense}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-6 w-6 text-yellow-400" />
              <span className="text-sm text-subtle">Crit Chance</span>
            </div>
            <div className="text-3xl font-bold text-text">{stats.critChance.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Gauge className="h-6 w-6 text-green-400" />
              <span className="text-sm text-subtle">Speed</span>
            </div>
            <div className="text-3xl font-bold text-text">{stats.speed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Section */}
      <Card className="bg-card border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Equipped Items ({stats.equipment.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.equipment.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.equipment.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border ${getRarityBgColor(item.rarity)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-text">{item.name}</h3>
                    <span className={`text-xs font-bold ${getRarityColor(item.rarity)}`}>
                      {item.rarity.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-subtle mb-2">{item.type}</div>
                  <div className="flex items-center gap-4 text-sm">
                    {item.power > 0 && (
                      <div className="flex items-center gap-1">
                        <Sword className="h-4 w-4 text-orange-400" />
                        <span className="text-text">+{item.power}</span>
                      </div>
                    )}
                    {item.defense && item.defense > 0 && (
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-blue-400" />
                        <span className="text-text">+{item.defense}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-subtle">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items equipped</p>
              <Link href="/inventory" className="text-accent hover:underline mt-2 inline-block">
                View Inventory
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

