/**
 * Play Page - Turn-based Fighting System
 * v0.36.0 - Full Fighting System MVP
 */

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useFightStore, Enemy } from '@parel/core/hooks/useFightStore";
import { useRewardToast } from '@parel/core/hooks/useRewardToast";
import { apiFetch } from "@/lib/apiBase";
import { Icon } from '@parel/ui/atoms';

interface HeroStats {
  hp: number;
  maxHp: number;
  str: number;
  def: number;
  speed: number;
  level: number;
  xp: number;
}

export default function PlayPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { pushToast } = useRewardToast();
  
  const { selectedEnemy, fightResult, isFighting, setEnemy, runFight, clearFight } = useFightStore();
  
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [loadingEnemies, setLoadingEnemies] = useState(true);
  const [heroStats, setHeroStats] = useState<HeroStats | null>(null);
  const [loadingHero, setLoadingHero] = useState(true);
  const [animatingRound, setAnimatingRound] = useState<number | null>(null);
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [adventureState, setAdventureState] = useState<any>(null);
  const [resettingAdventure, setResettingAdventure] = useState(false);

  // Load hero stats
  useEffect(() => {
    async function loadHeroStats() {
      try {
        const res = await apiFetch("/api/user/summary");
        if ((res as any).ok && (res as any).data) {
          const data = (res as any).data;
          // Calculate hero stats (simplified - in real app, calculate from level/stats)
          const level = data.level || 1;
          const stats = {
            hp: 50 + level * 5,
            maxHp: 50 + level * 5,
            str: 10 + level,
            def: 5 + Math.floor(level * 0.3),
            speed: 5 + Math.floor(level * 0.2),
            level,
            xp: data.xp || 0,
          };
          setHeroStats(stats);
        }
      } catch (error) {
        console.error("[Play] Failed to load hero stats:", error);
      } finally {
        setLoadingHero(false);
      }
    }
    loadHeroStats();
  }, []);

  // Load enemies
  useEffect(() => {
    async function loadEnemies() {
      try {
        const res = await apiFetch("/api/fight/enemies");
        if ((res as any).ok && (res as any).data) {
          setEnemies((res as any).data.enemies || []);
        }
      } catch (error) {
        console.error("[Play] Failed to load enemies:", error);
        pushToast({ type: "error", message: "Failed to load enemies" });
      } finally {
        setLoadingEnemies(false);
      }
    }
    loadEnemies();
  }, [pushToast]);

  // Load active events (v0.36.15)
  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await apiFetch("/api/rpg/events");
        if ((res as any).ok && (res as any).data?.events) {
          setActiveEvents((res as any).data.events || []);
        }
      } catch (error) {
        console.error("[Play] Failed to load events:", error);
      }
    }
    loadEvents();
  }, []);

  // Load adventure state (v0.36.16)
  useEffect(() => {
    async function loadAdventure() {
      try {
        const res = await apiFetch("/api/adventure");
        if ((res as any).ok && (res as any).data?.state) {
          setAdventureState((res as any).data.state);
        }
      } catch (error) {
        console.error("[Play] Failed to load adventure:", error);
      }
    }
    loadAdventure();
  }, []);

  async function handleResetAdventure() {
    if (!confirm('Are you sure you want to reset your adventure? This will start from the beginning.')) {
      return;
    }

    setResettingAdventure(true);
    try {
      const res = await apiFetch("/api/adventure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });

      if ((res as any).ok && (res as any).data?.state) {
        setAdventureState((res as any).data.state);
        pushToast({ type: "success", message: "Adventure reset!" });
      }
    } catch (error) {
      console.error("[Play] Failed to reset adventure:", error);
      pushToast({ type: "error", message: "Failed to reset adventure" });
    } finally {
      setResettingAdventure(false);
    }
  }

  // Handle fight result
  useEffect(() => {
    if (fightResult) {
      // Animate rounds
      if (fightResult.rounds.length > 0) {
        let roundIndex = 0;
        const animateRounds = () => {
          if (roundIndex < fightResult.rounds.length) {
            setAnimatingRound(roundIndex);
            roundIndex++;
            setTimeout(animateRounds, 500); // 500ms per round
          } else {
            setAnimatingRound(null);
            // Show result toast
            if (fightResult.winner === "hero") {
              pushToast({
                type: "xp",
                amount: fightResult.xpReward,
                message: `Victory! +${fightResult.xpReward} XP`,
              });
              pushToast({
                type: "gold",
                amount: fightResult.goldReward,
                message: `+${fightResult.goldReward} Gold`,
              });
            } else {
              pushToast({
                type: "error",
                message: "Defeat! Try again with a different strategy.",
              });
            }
          }
        };
        setTimeout(animateRounds, 300);
      }
    }
  }, [fightResult, pushToast]);

  const handleFight = async (enemy: Enemy) => {
    setEnemy(enemy);
    clearFight();
    const result = await runFight(enemy.id);
    if (!result) {
      pushToast({ type: "error", message: "Fight failed. Please try again." });
    }
  };

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (status === "loading" || loadingHero) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Icon name="spinner" className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Icon name="swords" className="h-8 w-8" size="md" />
          Arena
        </h1>
        <p className="text-muted-foreground">Challenge enemies in turn-based combat</p>
      </div>

      {/* Active Events Banner (v0.36.15) */}
      {activeEvents.length > 0 && (
        <Card className="mb-6 border-2 border-accent bg-accent/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="calendar" className="h-5 w-5 text-accent" />
              <span className="font-semibold text-accent">Active Events</span>
            </div>
            <div className="space-y-2">
              {activeEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-2 text-sm">
                  <Icon name="xp" className="h-4 w-4 text-accent" />
                  <span className="font-medium">{event.name}</span>
                  {event.description && (
                    <span className="text-muted-foreground">— {event.description}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adventure Mode Section (v0.36.16) */}
      {adventureState && (
        <Card className="mb-6 border-2 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="map" className="h-5 w-5" size="md" />
              Adventure Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Chapter 1: The Beginning</p>
                {adventureState.isFinished ? (
                  <p className="text-lg font-bold text-accent">Completed!</p>
                ) : (
                  <p className="text-lg font-bold">
                    Stage {adventureState.currentStage} / {adventureState.totalStages}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => router.push("/play/adventure")}
                  variant="default"
                >
                  <Icon name="map" className="h-4 w-4 mr-2" size="md" />
                  {adventureState.isFinished ? "View" : "Resume"}
                </Button>
                {!adventureState.isFinished && (
                  <Button
                    onClick={handleResetAdventure}
                    variant="outline"
                    size="sm"
                    disabled={resettingAdventure}
                  >
                    {resettingAdventure ? (
                      <Icon name="spinner" className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon name="refresh" className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero Stats */}
      {heroStats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="shield" className="h-5 w-5" size="md" />
              Your Hero
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Level</div>
                <div className="text-2xl font-bold">{heroStats.level}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">HP</div>
                <div className="flex items-center gap-2">
                  <Icon name="heart" className="h-4 w-4 text-red-500" />
                  <span className="text-lg font-semibold">
                    {heroStats.hp}/{heroStats.maxHp}
                  </span>
                </div>
                <Progress
                  value={(heroStats.hp / heroStats.maxHp) * 100}
                  className="mt-1 h-2"
                />
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Strength</div>
                <div className="text-lg font-semibold flex items-center gap-1">
                  <Icon name="swords" className="h-4 w-4" size="md" />
                  {heroStats.str}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Defense</div>
                <div className="text-lg font-semibold flex items-center gap-1">
                  <Icon name="shield" className="h-4 w-4" size="md" />
                  {heroStats.def}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Speed</div>
                <div className="text-lg font-semibold flex items-center gap-1">
                  <Icon name="zap" className="h-4 w-4" />
                  {heroStats.speed}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator className="my-6" />

      {/* Enemies */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Choose Your Opponent</h2>
        {loadingEnemies ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="spinner" className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : enemies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No enemies available. Please try again later.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {enemies.map((enemy) => (
              <Card
                key={enemy.id}
                className={`transition-all ${
                  selectedEnemy?.id === enemy.id ? "ring-2 ring-primary" : ""
                } ${isFighting && selectedEnemy?.id === enemy.id ? "opacity-50" : ""}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{enemy.name}</span>
                    <span className="text-xs px-2 py-1 rounded bg-muted">
                      {enemy.rarity}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">HP:</span>
                      <span className="font-semibold">{enemy.hp}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">STR:</span>
                      <span className="font-semibold">{enemy.str}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">DEF:</span>
                      <span className="font-semibold">{enemy.def}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">SPD:</span>
                      <span className="font-semibold">{enemy.speed}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Icon name="xp" className="h-3 w-3" />
                        XP:
                      </span>
                      <span className="font-semibold">{enemy.xpReward}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Icon name="coins" className="h-3 w-3" size="md" />
                        Gold:
                      </span>
                      <span className="font-semibold">{enemy.goldReward}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleFight(enemy)}
                    disabled={isFighting}
                    className="w-full"
                    variant={selectedEnemy?.id === enemy.id ? "default" : "outline"}
                  >
                    {isFighting && selectedEnemy?.id === enemy.id ? (
                      <>
                        <Icon name="spinner" className="h-4 w-4 mr-2 animate-spin" />
                        Fighting...
                      </>
                    ) : (
                      <>
                        <Icon name="swords" className="h-4 w-4 mr-2" size="md" />
                        Fight
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Fight Animation */}
      {fightResult && animatingRound !== null && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="trophy" className="h-5 w-5" />
              Fight Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {fightResult.rounds.slice(0, animatingRound + 1).map((round, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-muted/50 animate-in fade-in duration-300"
                >
                  <div className="text-sm">
                    <span className="font-semibold">Round {round.round}:</span>{" "}
                    <span className="text-destructive">
                      {round.damage} damage
                    </span>{" "}
                    dealt. Attacker HP: {round.attackerHpAfter}, Defender HP:{" "}
                    {round.defenderHpAfter}
                  </div>
                </div>
              ))}
            </div>
            {animatingRound === fightResult.rounds.length - 1 && (
              <div className="mt-4 p-4 rounded-lg bg-primary/10 text-center">
                <div className="text-lg font-bold">
                  {fightResult.winner === "hero" ? "?? Victory!" : "?? Defeat"}
                </div>
                {fightResult.winner === "hero" && (
                  <div className="text-sm text-muted-foreground mt-2">
                    +{fightResult.xpReward} XP, +{fightResult.goldReward} Gold
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
