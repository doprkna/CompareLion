/**
 * Admin Stats Page
 * /admin/stats - Manage stat formulas and test level simulations
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
import { Loader2, TrendingUp, Calculator, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import { getXPForLevel, getLevelFromXP, getXPProgress } from '@/lib/levelCurve';

export default function AdminStatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [testLevel, setTestLevel] = useState(5);
  const [testXP, setTestXP] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
  }, [status, router]);

  // Calculate XP for test level
  useEffect(() => {
    if (testLevel >= 1 && testLevel <= 100) {
      const xp = getXPForLevel(testLevel);
      setTestXP(xp);
    }
  }, [testLevel]);

  function simulateLevelUp(startLevel: number, xpGained: number) {
    const startXP = getXPForLevel(startLevel);
    const newXP = startXP + xpGained;
    const newLevel = getLevelFromXP(newXP);
    const levelsGained = newLevel - startLevel;
    const pointsGained = levelsGained * 2; // +2 points per level
    
    return {
      startLevel,
      startXP,
      xpGained,
      newXP,
      newLevel,
      levelsGained,
      pointsGained,
    };
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin - Stats System</h1>
        <p className="text-muted-foreground">
          Manage stat formulas, test level curve, and simulate level-ups
        </p>
      </div>

      {/* Level Curve Testing */}
      <Card className="bg-card border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Level Curve Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Test Level</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={testLevel}
                onChange={(e) => setTestLevel(parseInt(e.target.value) || 1)}
              />
              <div className="mt-2 text-sm text-muted-foreground">
                XP Required: {getXPForLevel(testLevel).toLocaleString()}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Test XP</label>
              <Input
                type="number"
                min="0"
                value={testXP}
                onChange={(e) => setTestXP(parseInt(e.target.value) || 0)}
              />
              <div className="mt-2 text-sm text-muted-foreground">
                Level: {getLevelFromXP(testXP)}
              </div>
            </div>
          </div>

          {/* Level Examples */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Level Examples (XP = 50 × level^1.5)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              {[1, 2, 5, 10, 20].map((level) => (
                <div key={level} className="p-2 border rounded">
                  <div className="font-bold">Lvl {level}</div>
                  <div className="text-muted-foreground">{getXPForLevel(level).toLocaleString()} XP</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level-Up Simulation */}
      <Card className="bg-card border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Level-Up Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Start Level</label>
              <Input
                type="number"
                min="1"
                max="99"
                defaultValue="5"
                id="sim-start-level"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">XP to Gain</label>
              <Input
                type="number"
                min="1"
                defaultValue="1000"
                id="sim-xp-gain"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  const startLevelInput = document.getElementById('sim-start-level') as HTMLInputElement;
                  const xpGainInput = document.getElementById('sim-xp-gain') as HTMLInputElement;
                  const startLevel = parseInt(startLevelInput?.value || '5');
                  const xpGain = parseInt(xpGainInput?.value || '1000');
                  
                  const result = simulateLevelUp(startLevel, xpGain);
                  toast.success(
                    `Level ${result.startLevel} → ${result.newLevel} (+${result.levelsGained} levels, +${result.pointsGained} attribute points)`
                  );
                }}
              >
                Simulate
              </Button>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm font-semibold mb-2">Rewards per Level:</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• +2 attribute points</li>
              <li>• Full heal</li>
              <li>• Small XP carryover</li>
            </ul>
            <div className="text-sm font-semibold mt-3 mb-2">Every 5 Levels:</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• +1 skill unlock</li>
              <li>• +5 inventory cap</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Stat Formulas */}
      <Card className="bg-card border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Derived Stat Formulas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 border rounded-lg">
              <div className="font-semibold mb-1">Max HP</div>
              <code className="text-xs text-muted-foreground">END × 10 + level × 5</code>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-semibold mb-1">Attack</div>
              <code className="text-xs text-muted-foreground">STR × 2 + weaponPower</code>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-semibold mb-1">Defense</div>
              <code className="text-xs text-muted-foreground">END × 1.5 + armorPower</code>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-semibold mb-1">Speed</div>
              <code className="text-xs text-muted-foreground">AGI × 1.2</code>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-semibold mb-1">Crit Chance</div>
              <code className="text-xs text-muted-foreground">LCK × 0.2 + passiveBonus</code>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-semibold mb-1">Crit Damage</div>
              <code className="text-xs text-muted-foreground">150% (constant)</code>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-semibold mb-1">Loot Luck</div>
              <code className="text-xs text-muted-foreground">LCK × 0.1 + passiveBonus</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enemy Scaling Info */}
      <Card className="bg-card border-2 border-border">
        <CardHeader>
          <CardTitle>Enemy Scaling</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p>
              <strong>Formula:</strong> baseArchetype + (playerLevel × 0.4) per stat
            </p>
            <p className="text-muted-foreground">
              Example: Goblin base (STR 4, AGI 5, END 3) at player level 10:
              <br />
              STR: 4 + (10 × 0.4) = 8
              <br />
              AGI: 5 + (10 × 0.4) = 9
              <br />
              END: 3 + (10 × 0.4) = 7
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

