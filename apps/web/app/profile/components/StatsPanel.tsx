'use client';

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiBase";
import { Sparkles, Star, Flame, Trophy } from "lucide-react";

export default function StatsPanel() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await apiFetch("/api/user/summary");
      if ((res as any).ok && (res as any).data?.user) {
        setStats((res as any).data.user);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="text-subtle">Loading stats...</div>;
  }

  if (!stats) {
    return <div className="text-destructive">Failed to load stats</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-bg border border-accent rounded-lg p-4 text-center">
        <Sparkles className="h-6 w-6 text-accent mx-auto mb-2" />
        <div className="text-2xl font-bold text-text">{stats.xp}</div>
        <div className="text-xs text-subtle">Total XP</div>
      </div>

      <div className="bg-bg border border-border rounded-lg p-4 text-center">
        <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
        <div className="text-2xl font-bold text-text">{stats.funds}</div>
        <div className="text-xs text-subtle">Gold</div>
      </div>

      <div className="bg-bg border border-border rounded-lg p-4 text-center">
        <Star className="h-6 w-6 text-purple-500 mx-auto mb-2" />
        <div className="text-2xl font-bold text-text">{stats.diamonds}</div>
        <div className="text-xs text-subtle">Diamonds</div>
      </div>

      <div className="bg-bg border border-border rounded-lg p-4 text-center">
        <Flame className="h-6 w-6 text-orange-500 mx-auto mb-2" />
        <div className="text-2xl font-bold text-text">{stats.streakCount}</div>
        <div className="text-xs text-subtle">Day Streak</div>
      </div>

      <div className="bg-bg border border-border rounded-lg p-4 text-center col-span-2">
        <Trophy className="h-6 w-6 text-accent mx-auto mb-2" />
        <div className="text-2xl font-bold text-text">Level {stats.level}</div>
        <div className="text-xs text-subtle">{Math.round(stats.progress)}% to next level</div>
      </div>

      <div className="bg-bg border border-border rounded-lg p-4 text-center col-span-2">
        <div className="text-2xl font-bold text-text">{stats.questionsAnswered || 0}</div>
        <div className="text-xs text-subtle">Questions Answered</div>
      </div>
    </div>
  );
}










