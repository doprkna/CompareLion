/**
 * FightResultView Component
 * Displays fight results with round-by-round log
 * v0.36.5 - Combat core + fight UI
 */

"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, X, Sparkles, Coins, ArrowLeft, Swords, Package } from "lucide-react";
import { getRarityColorClass, getRarityDisplayName } from "@/lib/rpg/rarity";

export interface Round {
  roundIndex: number;
  heroHp: number;
  enemyHp: number;
  heroDamage: number;
  enemyDamage: number;
  heroCrit: boolean;
  enemyCrit: boolean;
  heroMiss: boolean;
  enemyMiss: boolean;
}

export interface FightResult {
  rounds: Round[];
  result: "WIN" | "LOSE" | "DRAW";
  rewards?: {
    xp?: number;
    gold?: number;
    itemId?: string;
    item?: {
      id: string;
      name: string;
      rarity: string;
    } | null;
  };
}

interface FightResultViewProps {
  fight: FightResult;
  onFightAgain?: () => void;
  onBack?: () => void;
}

export function FightResultView({ fight, onFightAgain, onBack }: FightResultViewProps) {
  const isWin = fight.result === "WIN";
  const isDraw = fight.result === "DRAW";

  return (
    <div className="space-y-4">
      {/* Result Header */}
      <Card className={isWin ? "border-green-500" : isDraw ? "border-yellow-500" : "border-red-500"}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isWin ? (
                <>
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <span className="text-2xl font-bold text-green-600">Victory!</span>
                </>
              ) : isDraw ? (
                <>
                  <X className="h-6 w-6 text-yellow-500" />
                  <span className="text-2xl font-bold text-yellow-600">Draw</span>
                </>
              ) : (
                <>
                  <X className="h-6 w-6 text-red-500" />
                  <span className="text-2xl font-bold text-red-600">Defeat</span>
                </>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fight.rewards && (fight.rewards.xp || fight.rewards.gold || fight.rewards.item) && (
            <div className="space-y-3 mt-2">
              <div className="flex items-center gap-4 flex-wrap">
                {fight.rewards.xp && (
                  <div className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    <span className="font-semibold">+{fight.rewards.xp} XP</span>
                  </div>
                )}
                {fight.rewards.gold && (
                  <div className="flex items-center gap-2 text-lg">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <span className="font-semibold">+{fight.rewards.gold} Gold</span>
                  </div>
                )}
              </div>
              
              {/* Loot Section */}
              {fight.rewards.item ? (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold text-text">Loot:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text">{fight.rewards.item.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${getRarityColorClass(fight.rewards.item.rarity)}`}>
                      {getRarityDisplayName(fight.rewards.item.rarity)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-subtle italic">
                  No item drop this time
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fight Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5" />
            Fight Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {fight.rounds.map((round, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-muted/50 border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">Round {round.roundIndex}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Hero HP: {round.heroHp}</span>
                    <span>•</span>
                    <span>Enemy HP: {round.enemyHp}</span>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm">
                  {/* Hero Attack */}
                  {round.heroMiss ? (
                    <div className="text-muted-foreground">
                      <span className="font-medium">Hero</span> missed!
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Hero</span>
                      <span className="text-destructive">
                        dealt {round.heroDamage} damage
                      </span>
                      {round.heroCrit && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-600 font-semibold">
                          CRIT!
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Enemy Attack */}
                  {round.enemyMiss ? (
                    <div className="text-muted-foreground">
                      <span className="font-medium">Enemy</span> missed!
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Enemy</span>
                      <span className="text-destructive">
                        dealt {round.enemyDamage} damage
                      </span>
                      {round.enemyCrit && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-600 font-semibold">
                          CRIT!
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        {onFightAgain && (
          <Button
            onClick={onFightAgain}
            className="flex items-center gap-2"
          >
            <Swords className="h-4 w-4" />
            Fight Again
          </Button>
        )}
      </div>
    </div>
  );
}

