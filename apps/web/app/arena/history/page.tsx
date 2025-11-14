/**
 * Arena History Page
 * View your fight history
 * v0.36.0 - Full Fighting System MVP
 */

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, ChevronUp, Trophy } from "lucide-react";
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

export default function ArenaHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [fights, setFights] = useState<Fight[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFight, setExpandedFight] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      loadFights();
    }
  }, [status, router]);

  const loadFights = async () => {
    try {
      const res = await apiFetch("/api/fight/history?limit=50");
      if ((res as any).ok && (res as any).data) {
        setFights((res as any).data.fights || []);
      }
    } catch (error) {
      console.error("[ArenaHistory] Failed to load:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Trophy className="h-8 w-8" />
          Fight History
        </h1>
        <p className="text-muted-foreground">Review your past battles</p>
      </div>

      {fights.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No fights yet. Go to the Arena to start fighting!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {fights.map((fight) => (
            <Card key={fight.id}>
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
                        {fight.winner === "hero" ? "You" : fight.enemy.name}
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
          ))}
        </div>
      )}
    </div>
  );
}

