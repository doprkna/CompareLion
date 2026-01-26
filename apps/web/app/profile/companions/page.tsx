'use client';

/**
 * Companions Page
 * v0.36.17 - Companions + Pets System v0.1
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, Shield, Zap, Heart, Target, Coins, TrendingUp } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { toast } from 'sonner';
import { getRarityColorClass, getRarityDisplayName, getRarityBgClass } from '@/lib/rpg/rarity';

interface Companion {
  id: string;
  companionId: string;
  name: string;
  type: string;
  rarity: string;
  icon: string | null;
  level: number;
  xp: number;
  equipped: boolean;
  bonuses: {
    atk: number;
    def: number;
    hp: number;
    crit: number;
    speed: number;
    xp: number;
    gold: number;
  };
}

export default function CompanionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);
  const [equipping, setEquipping] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated') {
      loadCompanions();
    }
  }, [status, router]);

  async function loadCompanions() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/companion');
      if ((res as any).ok && (res as any).data?.companions) {
        setCompanions((res as any).data.companions);
      }
    } catch (error) {
      console.error('Error loading companions:', error);
      toast.error('Failed to load companions');
    } finally {
      setLoading(false);
    }
  }

  async function handleEquip(companionId: string) {
    setEquipping(companionId);
    try {
      const res = await apiFetch('/api/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userCompanionId: companionId }),
      });

      if ((res as any).ok) {
        toast.success('Companion equipped!');
        loadCompanions();
      } else {
        throw new Error((res as any).error || 'Failed to equip companion');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to equip companion');
    } finally {
      setEquipping(null);
    }
  }

  async function handleUnequip() {
    setEquipping('unequip');
    try {
      const res = await apiFetch('/api/companion/unequip', {
        method: 'POST',
      });

      if ((res as any).ok) {
        toast.success('Companion unequipped');
        loadCompanions();
      } else {
        throw new Error((res as any).error || 'Failed to unequip companion');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to unequip companion');
    } finally {
      setEquipping(null);
    }
  }

  function getXPRequired(level: number): number {
    return 100 * level;
  }

  function getXPProgress(xp: number, level: number): number {
    const required = getXPRequired(level);
    return Math.min(100, (xp / required) * 100);
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-muted-foreground">Loading companions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-2">
              <Sparkles className="h-8 w-8" />
              Companions & Pets
            </h1>
            <p className="text-subtle">Manage your companions and their passive buffs</p>
          </div>
          <Button onClick={() => router.push('/shop')} variant="outline">
            <Sparkles className="h-4 w-4 mr-2" />
            Buy Companions
          </Button>
        </div>

        {companions.length === 0 ? (
          <Card className="bg-card border-2 border-border">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🐾</div>
              <h2 className="text-2xl font-bold mb-2">No Companions Yet</h2>
              <p className="text-muted-foreground mb-6">
                Visit the shop to purchase companions and pets
              </p>
              <Button onClick={() => router.push('/shop')} size="lg">
                Browse Shop
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companions.map((companion) => {
              const xpRequired = getXPRequired(companion.level);
              const xpProgress = getXPProgress(companion.xp, companion.level);
              const hasBonuses = Object.values(companion.bonuses).some(v => v > 0);

              return (
                <Card
                  key={companion.id}
                  className={`bg-card border-2 ${
                    companion.equipped
                      ? 'border-accent bg-accent/10'
                      : 'border-border'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-5xl">{companion.icon || '🐾'}</div>
                        <div>
                          <CardTitle className="text-lg">{companion.name}</CardTitle>
                          <div className={`text-xs font-bold px-2 py-0.5 rounded mt-1 ${getRarityColorClass(companion.rarity)}`}>
                            {getRarityDisplayName(companion.rarity)}
                          </div>
                        </div>
                      </div>
                      {companion.equipped && (
                        <span className="text-xs px-2 py-1 bg-accent text-white rounded">
                          EQUIPPED
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Level & XP */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Level {companion.level}</span>
                        <span className="text-muted-foreground">
                          {companion.xp} / {xpRequired} XP
                        </span>
                      </div>
                      <Progress value={xpProgress} className="h-2" />
                    </div>

                    {/* Bonuses */}
                    {hasBonuses && (
                      <div className="space-y-1 text-sm">
                        <div className="font-semibold text-text mb-2">Bonuses:</div>
                        {companion.bonuses.atk > 0 && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Zap className="h-3 w-3" />
                            +{companion.bonuses.atk} ATK
                          </div>
                        )}
                        {companion.bonuses.def > 0 && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Shield className="h-3 w-3" />
                            +{companion.bonuses.def} DEF
                          </div>
                        )}
                        {companion.bonuses.hp > 0 && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Heart className="h-3 w-3" />
                            +{companion.bonuses.hp} HP
                          </div>
                        )}
                        {companion.bonuses.crit > 0 && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Target className="h-3 w-3" />
                            +{companion.bonuses.crit}% CRIT
                          </div>
                        )}
                        {companion.bonuses.speed > 0 && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Zap className="h-3 w-3" />
                            +{companion.bonuses.speed} SPEED
                          </div>
                        )}
                        {companion.bonuses.xp > 0 && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            +{companion.bonuses.xp}% XP
                          </div>
                        )}
                        {companion.bonuses.gold > 0 && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Coins className="h-3 w-3" />
                            +{companion.bonuses.gold}% Gold
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2">
                      {companion.equipped ? (
                        <Button
                          onClick={handleUnequip}
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={equipping === 'unequip'}
                        >
                          {equipping === 'unequip' ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Unequipping...
                            </>
                          ) : (
                            'Unequip'
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleEquip(companion.id)}
                          variant="default"
                          size="sm"
                          className="w-full"
                          disabled={equipping === companion.id}
                        >
                          {equipping === companion.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Equipping...
                            </>
                          ) : (
                            'Equip'
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


