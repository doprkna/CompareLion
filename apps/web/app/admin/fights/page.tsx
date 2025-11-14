/**
 * Admin Fights Page
 * View fight logs and details
 * v0.36.0 - Full Fighting System MVP
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { apiFetch } from "@/lib/apiBase";

interface Fight {
  id: string;
  enemy: {
    id: string;
    name: string;
    rarity: string;
  };
  winner: string;
  rounds: Array<{
    round: number;
    attacker: string;
    defender: string;
    damage: number;
    attackerHpAfter: number;
    defenderHpAfter: number;
  }>;
  createdAt: string;
}

export default function AdminFightsPage() {
  const [fights, setFights] = useState<Fight[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFight, setExpandedFight] = useState<string | null>(null);
  const [limit] = useState(50);

  useEffect(() => {
    loadFights();
  }, []);

  const loadFights = async () => {
    try {
      // Note: Would need admin endpoint to get all fights
      // For now, using user endpoint as placeholder
      const res = await apiFetch(`/api/fight/history?limit=${limit}`);
      if ((res as any).ok && (res as any).data) {
        setFights((res as any).data.fights || []);
      }
    } catch (error) {
      console.error("[AdminFights] Failed to load:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Fight Logs</h1>
        <p className="text-muted-foreground">View and inspect fight history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Fights ({fights.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fights.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No fights found
              </div>
            ) : (
              fights.map((fight) => (
                <Card key={fight.id} className="border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          vs {fight.enemy.name}
                          <span className="ml-2 text-xs px-2 py-1 rounded bg-muted">
                            {fight.enemy.rarity}
                          </span>
                        </CardTitle>
                        <div className="text-sm text-muted-foreground mt-1">
                          {new Date(fight.createdAt).toLocaleString()} • Winner:{" "}
                          <span
                            className={
                              fight.winner === "hero"
                                ? "text-green-600 font-semibold"
                                : "text-red-600 font-semibold"
                            }
                          >
                            {fight.winner === "hero" ? "Hero" : "Enemy"}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedFight(
                            expandedFight === fight.id ? null : fight.id
                          )
                        }
                      >
                        {expandedFight === fight.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedFight === fight.id && (
                    <CardContent>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {fight.rounds.map((round, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded bg-muted/50 text-sm"
                          >
                            <span className="font-semibold">Round {round.round}:</span>{" "}
                            <span className="text-destructive">
                              {round.damage} damage
                            </span>{" "}
                            dealt. Attacker HP: {round.attackerHpAfter}, Defender HP:{" "}
                            {round.defenderHpAfter}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

