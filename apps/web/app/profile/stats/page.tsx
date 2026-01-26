/**
 * Stats Page
 * /profile/stats - View and allocate base attributes, see derived stats
 * v0.36.34 - Stats / Attributes / Level Curve 2.0
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, Shield, Zap, Heart, Target, Coins, Plus, Minus, Save } from 'lucide-react';
import { toast } from 'sonner';

interface BaseAttributes {
  strength: number;
  agility: number;
  endurance: number;
  intellect: number;
  luck: number;
}

interface FinalStats {
  baseAttributes: BaseAttributes;
  maxHP: number;
  attack: number;
  defense: number;
  speed: number;
  critChance: number;
  critDamage: number;
  lootLuck: number;
  level: number;
  xp: number;
  unspentPoints: number;
}

interface XPProgress {
  currentXP: number;
  requiredXP: number;
  progress: number;
}

const ATTRIBUTE_LABELS: Record<keyof BaseAttributes, { label: string; icon: string; description: string }> = {
  strength: { label: 'Strength', icon: '💪', description: 'Increases attack power' },
  agility: { label: 'Agility', icon: '⚡', description: 'Increases speed' },
  endurance: { label: 'Endurance', icon: '🛡️', description: 'Increases HP and defense' },
  intellect: { label: 'Intellect', icon: '🧠', description: 'Increases magic power' },
  luck: { label: 'Luck', icon: '🍀', description: 'Increases crit chance and loot luck' },
};

export default function StatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<FinalStats | null>(null);
  const [xpProgress, setXpProgress] = useState<XPProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [editingAttributes, setEditingAttributes] = useState<BaseAttributes | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated') {
      loadStats();
    }
  }, [status, router]);

  async function loadStats() {
    setLoading(true);
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setXpProgress(data.xpProgress);
        setEditingAttributes({ ...data.stats.baseAttributes });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  }

  function adjustAttribute(attr: keyof BaseAttributes, delta: number) {
    if (!editingAttributes || !stats) return;

    const current = editingAttributes[attr];
    const newValue = current + delta;
    const minBase = 5;
    
    // Check if we have enough points or are reducing
    const pointsNeeded = delta;
    const canIncrease = pointsNeeded <= 0 || pointsNeeded <= stats.unspentPoints;
    const canDecrease = pointsNeeded < 0 && newValue >= minBase;

    if (newValue < minBase) {
      toast.error(`${ATTRIBUTE_LABELS[attr].label} cannot go below ${minBase}`);
      return;
    }

    if (pointsNeeded > 0 && pointsNeeded > stats.unspentPoints) {
      toast.error(`Not enough unspent points. Need ${pointsNeeded}, have ${stats.unspentPoints}`);
      return;
    }

    setEditingAttributes({
      ...editingAttributes,
      [attr]: newValue,
    });
  }

  async function saveAllocation() {
    if (!editingAttributes || !stats) return;

    setAllocating(true);
    try {
      const res = await fetch('/api/stats/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAttributes),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Attributes allocated successfully');
        await loadStats();
      } else {
        toast.error(data.message || 'Failed to allocate attributes');
      }
    } catch (error) {
      console.error('Error allocating attributes:', error);
      toast.error('Failed to allocate attributes');
    } finally {
      setAllocating(false);
    }
  }

  function hasChanges(): boolean {
    if (!editingAttributes || !stats) return false;
    return JSON.stringify(editingAttributes) !== JSON.stringify(stats.baseAttributes);
  }

  function calculatePointsNeeded(): number {
    if (!editingAttributes || !stats) return 0;
    let total = 0;
    Object.keys(editingAttributes).forEach((key) => {
      const attr = key as keyof BaseAttributes;
      total += editingAttributes[attr] - stats.baseAttributes[attr];
    });
    return total;
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!stats || !xpProgress) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Failed to load stats</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pointsNeeded = calculatePointsNeeded();
  const canSave = hasChanges() && pointsNeeded <= stats.unspentPoints && pointsNeeded >= 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Character Stats</h1>
        <p className="text-muted-foreground">
          Manage your base attributes and see how they affect your derived stats.
        </p>
      </div>

      {/* Level Progress */}
      <Card className="bg-card border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">Level {stats.level}</div>
              <div className="text-sm text-muted-foreground">
                {xpProgress.currentXP} / {xpProgress.requiredXP} XP to next level
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Unspent Points</div>
              <div className="text-2xl font-bold text-accent">{stats.unspentPoints}</div>
            </div>
          </div>
          <Progress value={xpProgress.progress * 100} className="h-3" />
          <div className="text-xs text-muted-foreground">
            {stats.xp} total XP
          </div>
        </CardContent>
      </Card>

      {/* Base Attributes */}
      <Card className="bg-card border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Base Attributes
            </div>
            {hasChanges() && (
              <Button
                onClick={saveAllocation}
                disabled={!canSave || allocating}
                size="sm"
              >
                {allocating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes ({pointsNeeded > 0 ? `-${pointsNeeded}` : pointsNeeded < 0 ? `+${Math.abs(pointsNeeded)}` : '0'} points)
                  </>
                )}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Allocate your unspent attribute points. Each level gives you +2 points to distribute.
          </p>
          
          {Object.keys(ATTRIBUTE_LABELS).map((key) => {
            const attr = key as keyof BaseAttributes;
            const label = ATTRIBUTE_LABELS[attr];
            const current = stats.baseAttributes[attr];
            const editing = editingAttributes?.[attr] ?? current;
            const delta = editing - current;

            return (
              <div key={attr} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{label.icon}</span>
                    <div>
                      <div className="font-semibold">{label.label}</div>
                      <div className="text-xs text-muted-foreground">{label.description}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustAttribute(attr, -1)}
                    disabled={editing <= 5 || allocating}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="text-center min-w-[80px]">
                    <div className="text-2xl font-bold">{editing}</div>
                    {delta !== 0 && (
                      <div className={`text-xs ${delta > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {delta > 0 ? '+' : ''}{delta}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustAttribute(attr, 1)}
                    disabled={pointsNeeded + 1 > stats.unspentPoints || allocating}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Derived Stats */}
      <Card className="bg-card border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Derived Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            These stats are calculated from your base attributes, equipment, and passive skills.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-red-500" />
                <div className="font-semibold">Max HP</div>
              </div>
              <div className="text-2xl font-bold">{stats.maxHP}</div>
              <div className="text-xs text-muted-foreground mt-1">
                END × 10 + Level × 5
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <div className="font-semibold">Attack</div>
              </div>
              <div className="text-2xl font-bold">{stats.attack}</div>
              <div className="text-xs text-muted-foreground mt-1">
                STR × 2 + Weapon Power
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <div className="font-semibold">Defense</div>
              </div>
              <div className="text-2xl font-bold">{stats.defense}</div>
              <div className="text-xs text-muted-foreground mt-1">
                END × 1.5 + Armor Power
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-purple-500" />
                <div className="font-semibold">Speed</div>
              </div>
              <div className="text-2xl font-bold">{stats.speed}</div>
              <div className="text-xs text-muted-foreground mt-1">
                AGI × 1.2
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-orange-500" />
                <div className="font-semibold">Crit Chance</div>
              </div>
              <div className="text-2xl font-bold">{stats.critChance.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                LCK × 0.2 + Bonuses
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-5 w-5 text-green-500" />
                <div className="font-semibold">Loot Luck</div>
              </div>
              <div className="text-2xl font-bold">{stats.lootLuck.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                LCK × 0.1 + Bonuses
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <div className="font-semibold mb-1">Crit Damage:</div>
              <div className="text-muted-foreground">{stats.critDamage}% (constant)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

