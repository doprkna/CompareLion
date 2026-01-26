/**
 * Missions Page
 * Mission tracker with daily/weekly/quest grouping
 * v0.36.36 - Missions & Quests 1.0
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Progress bar component - using div-based progress bar
const Progress = ({ value }: { value: number }) => (
  <div className="w-full bg-muted rounded-full h-2">
    <div
      className="bg-primary h-2 rounded-full transition-all"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);
import { Loader2, CheckCircle2, Target, Calendar, Clock } from "lucide-react";
import { apiFetch } from "@/lib/apiBase";
import { toast } from "sonner";
import { MissionType, MissionWithProgress, getMissionTypeDisplayName, getObjectiveTypeDisplayName } from "@/lib/missions/types";

interface MissionsData {
  daily: MissionWithProgress[];
  weekly: MissionWithProgress[];
  quest: MissionWithProgress[];
  total: number;
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<MissionsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const res = await apiFetch("/api/missions");
      if ((res as any).ok && (res as any).data) {
        setMissions((res as any).data);
      }
    } catch (error) {
      console.error("[Missions] Failed to load:", error);
      toast.error("Failed to load missions");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (missionProgressId: string) => {
    try {
      const res = await apiFetch("/api/missions/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionProgressId }),
      });
      
      if ((res as any).ok) {
        toast.success("Rewards claimed!");
        loadMissions();
      } else {
        throw new Error((res as any).error || "Claim failed");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to claim rewards");
    }
  };

  const renderMissionCard = (mission: MissionWithProgress) => {
    const progressPercent = mission.progressPercent;
    const isCompleted = mission.completed;
    const canClaim = mission.canClaim;

    return (
      <Card key={mission.id} className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{mission.icon || '🎯'}</span>
                <div>
                  <h3 className="font-semibold">{mission.title}</h3>
                  <p className="text-sm text-muted-foreground">{mission.description}</p>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>
                    {getObjectiveTypeDisplayName(mission.objectiveType)}
                  </span>
                  <span>
                    {mission.progress?.currentValue || 0} / {mission.targetValue}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                {mission.reward.xp && (
                  <span>+{mission.reward.xp} XP</span>
                )}
                {mission.reward.gold && (
                  <span>+{mission.reward.gold} Gold</span>
                )}
                {mission.reward.battlepassXP && (
                  <span>+{mission.reward.battlepassXP} BP</span>
                )}
                {mission.reward.items && mission.reward.items.length > 0 && (
                  <span>+{mission.reward.items.length} Item(s)</span>
                )}
              </div>
            </div>

            <div className="ml-4">
              {isCompleted && canClaim && (
                <Button
                  size="sm"
                  onClick={() => handleClaim(mission.progress?.id || '')}
                >
                  Claim
                </Button>
              )}
              {isCompleted && !canClaim && (
                <div className="flex items-center gap-1 text-green-500 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Claimed</span>
                </div>
              )}
              {!isCompleted && (
                <div className="text-xs text-muted-foreground">
                  {progressPercent}%
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Missions & Quests</h1>
        <p className="text-muted-foreground">Complete missions to earn rewards</p>
      </div>

      {/* Daily Missions */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Daily Missions</h2>
          <span className="text-sm text-muted-foreground">
            ({missions?.daily.length || 0})
          </span>
        </div>
        {missions?.daily && missions.daily.length > 0 ? (
          missions.daily.map(renderMissionCard)
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No daily missions available
            </CardContent>
          </Card>
        )}
      </div>

      {/* Weekly Missions */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Weekly Missions</h2>
          <span className="text-sm text-muted-foreground">
            ({missions?.weekly.length || 0})
          </span>
        </div>
        {missions?.weekly && missions.weekly.length > 0 ? (
          missions.weekly.map(renderMissionCard)
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No weekly missions available
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quest Missions */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Quests</h2>
          <span className="text-sm text-muted-foreground">
            ({missions?.quest.length || 0})
          </span>
        </div>
        {missions?.quest && missions.quest.length > 0 ? (
          missions.quest.map(renderMissionCard)
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No quests available
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

