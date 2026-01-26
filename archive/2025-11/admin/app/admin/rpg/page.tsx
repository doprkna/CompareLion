/**
 * Admin RPG Debug Page
 * Enemy generator testing and debugging
 * v0.36.12 - Hybrid Enemy System
 */

"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Swords, Zap } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

interface GeneratedEnemy {
  name: string;
  level: number;
  tier: string;
  variant?: string;
  stats: {
    hp: number;
    atk: number;
    def: number;
    speed: number;
    crit: number;
  };
  fullDescription: string;
  archetypeCode: string;
}

export default function AdminRPGPage() {
  const [loading, setLoading] = useState(false);
  const [enemy, setEnemy] = useState<GeneratedEnemy | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [playerLevel, setPlayerLevel] = useState<number>(5);

  const generateEnemy = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ success: boolean; data: GeneratedEnemy }>('/api/admin/rpg/generate-enemy', {
        method: 'POST',
        body: JSON.stringify({
          playerLevel,
          tier: selectedTier || undefined,
        }),
      });

      if (response.success && response.data) {
        setEnemy(response.data);
      }
    } catch (error) {
      console.error('[AdminRPG] Failed to generate enemy:', error);
      alert('Failed to generate enemy. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'EASY':
        return 'text-green-400';
      case 'NORMAL':
        return 'text-blue-400';
      case 'HARD':
        return 'text-orange-400';
      case 'ELITE':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getVariantColor = (variant?: string) => {
    if (!variant) return 'text-gray-400';
    const elemental = ['Fire', 'Ice', 'Shadow', 'Earth'];
    if (elemental.includes(variant)) {
      return 'text-purple-400';
    }
    return 'text-yellow-400';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-text mb-2">RPG Debug Tools</h1>
        <p className="text-subtle">Test enemy generation and scaling</p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Generate Random Enemy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text mb-2 block">
                Player Level
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={playerLevel}
                onChange={(e) => setPlayerLevel(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-bg border border-border rounded-md text-text"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text mb-2 block">
                Tier (Optional)
              </label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full px-3 py-2 bg-bg border border-border rounded-md text-text"
              >
                <option value="">Random</option>
                <option value="EASY">Easy</option>
                <option value="NORMAL">Normal</option>
                <option value="HARD">Hard</option>
                <option value="ELITE">Elite</option>
              </select>
            </div>
          </div>
          <Button
            onClick={generateEnemy}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Swords className="h-4 w-4 mr-2" />
                Generate Enemy
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Enemy Display */}
      {enemy && (
        <>
          {/* Stat Preview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-2xl">{enemy.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${getTierColor(enemy.tier)}`}>
                    {enemy.tier}
                  </span>
                  {enemy.variant && (
                    <span className={`text-sm ${getVariantColor(enemy.variant)}`}>
                      {enemy.variant}
                    </span>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-subtle mb-4">{enemy.fullDescription}</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-xs text-subtle mb-1">HP</div>
                  <div className="text-xl font-bold text-text">{enemy.stats.hp}</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-xs text-subtle mb-1">ATK</div>
                  <div className="text-xl font-bold text-text">{enemy.stats.atk}</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-xs text-subtle mb-1">DEF</div>
                  <div className="text-xl font-bold text-text">{enemy.stats.def}</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-xs text-subtle mb-1">SPD</div>
                  <div className="text-xl font-bold text-text">{enemy.stats.speed}</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-xs text-subtle mb-1">CRIT</div>
                  <div className="text-xl font-bold text-text">{enemy.stats.crit}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* JSON Preview */}
          <Card>
            <CardHeader>
              <CardTitle>JSON Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(enemy, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

