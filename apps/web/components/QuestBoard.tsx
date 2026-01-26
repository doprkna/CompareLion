'use client';

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiBase";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/react";
import { CheckCircle } from "lucide-react";
import { useEventBus } from '@parel/core/hooks/useEventBus";

export default function QuestBoard() {
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalQuests, setTotalQuests] = useState(0);

  useEffect(() => {
    loadQuests();
  }, []);

  useEventBus("quest:completed", () => {
    loadQuests();
  });

  async function loadQuests() {
    const res = await apiFetch("/api/quests/today");
    if ((res as any).ok && (res as any).data) {
      setQuests((res as any).data.quests || []);
      setCompletedCount((res as any).data.completedCount || 0);
      setTotalQuests((res as any).data.totalQuests || 0);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <Card className="bg-card border-border text-text">
        <CardContent className="p-6 text-center text-subtle">
          Loading quests...
        </CardContent>
      </Card>
    );
  }

  const questIcons: Record<string, string> = {
    answer_questions: "📝",
    complete_challenge: "⚔️",
    trade_item: "💰",
    send_messages: "💬",
    win_duel: "🎯",
    craft_item: "🔨",
  };

  return (
    <Card className="bg-card border-border text-text">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🎯 Daily Quests</span>
          <span className="text-sm font-normal text-accent">
            {completedCount}/{totalQuests}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quests.map((questData) => {
          const quest = questData.quest;
          const progress = questData.progress || 0;
          const completed = questData.completed || false;
          const progressPercent = Math.min((progress / quest.targetCount) * 100, 100);

          return (
            <div
              key={quest.id}
              className={`p-3 rounded-lg border ${
                completed
                  ? "border-green-500 bg-green-500/10"
                  : "border-border bg-bg"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-2xl">{questIcons[quest.type] || "📌"}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{quest.title}</div>
                    <div className="text-xs text-subtle">{quest.objective}</div>
                  </div>
                </div>
                {completed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="text-xs text-accent">
                    {progress}/{quest.targetCount}
                  </div>
                )}
              </div>

              {!completed && (
                <Progress value={progressPercent} className="h-2 mb-2" />
              )}

              <div className="flex items-center justify-between text-xs">
                <div className="flex gap-3">
                  <span className="text-blue-400">+{quest.rewardXp} XP</span>
                  <span className="text-yellow-400">+{quest.rewardGold} 💰</span>
                  {quest.dropChance > 0 && (
                    <span className="text-purple-400">{quest.dropChance}% drop</span>
                  )}
                </div>
                {completed && questData.itemDropped && (
                  <span className="text-green-400">🎁 Bonus item!</span>
                )}
              </div>
            </div>
          );
        })}

        {completedCount === totalQuests && totalQuests > 0 && (
          <div className="p-4 bg-accent/10 border border-accent rounded-lg text-center">
            <div className="text-2xl mb-2">🎉</div>
            <div className="font-bold text-accent">All Quests Complete!</div>
            <div className="text-xs text-subtle mt-1">+100 Bonus XP awarded</div>
          </div>
        )}

        {quests.length === 0 && (
          <div className="text-center py-6 text-subtle text-sm">
            No quests available. Check back tomorrow!
          </div>
        )}
      </CardContent>
    </Card>
  );
}













