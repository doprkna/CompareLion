/**
 * Battlepass Page
 * Simple battlepass UI with level, progress, and rewards
 * v0.36.38 - Seasons & Battlepass 1.0
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Lock, Crown } from "lucide-react";
import { apiFetch } from "@/lib/apiBase";
import { toast } from "sonner";
import { BattlepassProgress, BattlepassTrack, getRewardTypeDisplayName } from "@/lib/seasons/types";

// Progress bar component
const Progress = ({ value }: { value: number }) => (
  <div className="w-full bg-muted rounded-full h-2">
    <div
      className="bg-primary h-2 rounded-full transition-all"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

export default function BattlepassPage() {
  const [progress, setProgress] = useState<BattlepassProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBattlepass();
  }, []);

  const loadBattlepass = async () => {
    try {
      const res = await apiFetch("/api/battlepass/progress");
      if ((res as any).ok && (res as any).data) {
        setProgress((res as any).data.progress);
      }
    } catch (error) {
      console.error("[Battlepass] Failed to load:", error);
      toast.error("Failed to load battlepass");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (tier: number, track: BattlepassTrack) => {
    try {
      const res = await apiFetch("/api/battlepass/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, track }),
      });
      
      if ((res as any).ok) {
        toast.success("Reward claimed!");
        loadBattlepass();
      } else {
        throw new Error((res as any).error || "Claim failed");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to claim reward");
    }
  };

  const handleClaimAll = async () => {
    try {
      const res = await apiFetch("/api/battlepass/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimAll: true }),
      });
      
      if ((res as any).ok) {
        const result = (res as any).data;
        toast.success(`Claimed ${result.claimed} rewards!`);
        loadBattlepass();
      } else {
        throw new Error((res as any).error || "Claim all failed");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to claim rewards");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No active season. Check back soon!
          </CardContent>
        </Card>
      </div>
    );
  }

  const { season, tiers, userProgress } = progress;
  const daysRemaining = Math.ceil((new Date(season.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{season.name}</h1>
        <p className="text-muted-foreground">
          {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Season ended"}
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold">Level {userProgress.currentLevel}</div>
              <div className="text-sm text-muted-foreground">
                {userProgress.xp} XP
                {userProgress.progressToNextLevel && (
                  <span> • {userProgress.progressToNextLevel.percent.toFixed(0)}% to next level</span>
                )}
              </div>
            </div>
            {userProgress.premiumActive && (
              <div className="flex items-center gap-2 text-yellow-500">
                <Crown className="h-5 w-5" />
                <span className="font-semibold">Premium Active</span>
              </div>
            )}
          </div>
          {userProgress.progressToNextLevel && (
            <Progress value={userProgress.progressToNextLevel.percent} />
          )}
        </CardContent>
      </Card>

      {/* Claim All Button */}
      {userProgress.unlockedLevels.some(level => !userProgress.claimedRewards.includes(level)) && (
        <div className="mb-4 flex justify-end">
          <Button onClick={handleClaimAll} variant="outline">
            Claim All Available
          </Button>
        </div>
      )}

      {/* Tiers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tiers.map((tier) => {
          const isUnlocked = userProgress.unlockedLevels.includes(tier.level);
          const freeClaimed = userProgress.claimedRewards.includes(tier.level);
          const canClaimFree = isUnlocked && !freeClaimed && tier.freeReward;
          const canClaimPremium = isUnlocked && !freeClaimed && tier.premiumReward && userProgress.premiumActive;

          return (
            <Card key={tier.level} className={!isUnlocked ? "opacity-60" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-lg font-semibold">Tier {tier.level}</div>
                    <div className="text-xs text-muted-foreground">
                      {tier.xpRequired} XP required
                    </div>
                  </div>
                  {!isUnlocked && (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                  {isUnlocked && freeClaimed && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                </div>

                {/* Free Reward */}
                {tier.freeReward && (
                  <div className="mb-3 p-3 bg-muted rounded">
                    <div className="text-sm font-medium mb-1">Free</div>
                    <div className="text-xs text-muted-foreground">
                      {getRewardTypeDisplayName(tier.freeReward.type)}
                      {tier.freeReward.amount && ` × ${tier.freeReward.amount}`}
                      {tier.freeReward.itemId && ` (${tier.freeReward.itemId})`}
                    </div>
                    {canClaimFree && (
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => handleClaim(tier.level, BattlepassTrack.FREE)}
                      >
                        Claim
                      </Button>
                    )}
                  </div>
                )}

                {/* Premium Reward */}
                {tier.premiumReward && (
                  <div className={`p-3 rounded ${userProgress.premiumActive ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-muted opacity-60'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <div className="text-sm font-medium">Premium</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getRewardTypeDisplayName(tier.premiumReward.type)}
                      {tier.premiumReward.amount && ` × ${tier.premiumReward.amount}`}
                      {tier.premiumReward.itemId && ` (${tier.premiumReward.itemId})`}
                    </div>
                    {canClaimPremium && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => handleClaim(tier.level, BattlepassTrack.PREMIUM)}
                      >
                        Claim
                      </Button>
                    )}
                    {!userProgress.premiumActive && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Premium required
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tiers.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No tiers configured for this season
          </CardContent>
        </Card>
      )}
    </div>
  );
}
