'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/apiBase";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import StatDiffBar from "@/components/StatDiffBar";
import UserBadge from "@/components/UserBadge";
import { ArrowLeftRight, Trophy, Sparkles } from "lucide-react";

export default function ComparePage() {
  const params = useParams();
  const targetId = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComparison();
  }, [targetId]);

  async function loadComparison() {
    setLoading(true);
    setError(null);
    const res = await apiFetch(`/api/compare?targetId=${targetId}`);
    
    if ((res as any).ok && (res as any).data?.comparison) {
      setData((res as any).data.comparison);
    } else {
      setError((res as any).error || "Failed to load comparison");
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text text-xl">Loading comparison...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <div className="text-destructive text-xl">{error}</div>
          <p className="text-subtle text-sm">
            One or both users may have disabled public comparison in their privacy settings.
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { currentUser, targetUser } = data;

  const stats = [
    { name: "Sleep", key: "sleep", icon: "💤", color: "bg-blue-500" },
    { name: "Health", key: "health", icon: "💪", color: "bg-red-500" },
    { name: "Social", key: "social", icon: "💬", color: "bg-green-500" },
    { name: "Knowledge", key: "knowledge", icon: "📘", color: "bg-purple-500" },
    { name: "Creativity", key: "creativity", icon: "🎨", color: "bg-yellow-500" },
  ];

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <ArrowLeftRight className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-text">Profile Comparison</h1>
          </div>
          <p className="text-subtle">Compare stats, achievements, and identity</p>
        </div>

        {/* User Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Current User */}
          <Card className="bg-card border-2 border-accent text-text">
            <CardContent className="p-6 text-center space-y-3">
              {currentUser.image && (
                <img
                  src={currentUser.image}
                  alt={currentUser.name}
                  className="w-24 h-24 rounded-full mx-auto border-4 border-accent"
                />
              )}
              <h2 className="text-2xl font-bold">{currentUser.name}</h2>
              <div className="flex items-center justify-center gap-2">
                {currentUser.badge && <UserBadge type={currentUser.badge} />}
                <span className="text-accent font-semibold">
                  🧙 {currentUser.archetype}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                <div>
                  <div className="text-2xl font-bold text-accent">{currentUser.level}</div>
                  <div className="text-xs text-subtle">Level</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-text">{currentUser.achievementCount}</div>
                  <div className="text-xs text-subtle">Achievements</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target User */}
          <Card className="bg-card border-2 border-border text-text">
            <CardContent className="p-6 text-center space-y-3">
              {targetUser.image && (
                <img
                  src={targetUser.image}
                  alt={targetUser.name}
                  className="w-24 h-24 rounded-full mx-auto border-4 border-border"
                />
              )}
              <h2 className="text-2xl font-bold">{targetUser.name}</h2>
              <div className="flex items-center justify-center gap-2">
                {targetUser.badge && <UserBadge type={targetUser.badge} />}
                <span className="text-accent font-semibold">
                  🧙 {targetUser.archetype}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                <div>
                  <div className="text-2xl font-bold text-accent">{targetUser.level}</div>
                  <div className="text-xs text-subtle">Level</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-text">{targetUser.achievementCount}</div>
                  <div className="text-xs text-subtle">Achievements</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hero Stats Comparison */}
        <Card className="bg-card border-border text-text">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-accent" />
              Hero Stats Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.map((stat) => (
              <StatDiffBar
                key={stat.key}
                statName={stat.name}
                icon={stat.icon}
                color={stat.color}
                leftValue={currentUser.stats[stat.key as keyof typeof currentUser.stats]}
                rightValue={targetUser.stats[stat.key as keyof typeof targetUser.stats]}
                leftName={currentUser.name}
                rightName={targetUser.name}
              />
            ))}
          </CardContent>
        </Card>

        {/* Karma & Prestige */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card border-border text-text">
            <CardHeader>
              <CardTitle>☯️ Karma</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className={`text-3xl font-bold ${currentUser.karmaTier.color}`}>
                    {currentUser.karma > 0 ? `+${currentUser.karma}` : currentUser.karma}
                  </div>
                  <div className="text-sm text-subtle mt-1">{currentUser.karmaTier.label}</div>
                  <div className="text-xs text-muted">{currentUser.name}</div>
                </div>
                <div>
                  <div className={`text-3xl font-bold ${targetUser.karmaTier.color}`}>
                    {targetUser.karma > 0 ? `+${targetUser.karma}` : targetUser.karma}
                  </div>
                  <div className="text-sm text-subtle mt-1">{targetUser.karmaTier.label}</div>
                  <div className="text-xs text-muted">{targetUser.name}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border text-text">
            <CardHeader>
              <CardTitle>👑 Prestige</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className={`text-3xl font-bold ${currentUser.prestigeTier.color}`}>
                    {currentUser.prestige}
                  </div>
                  <div className="text-sm text-subtle mt-1">{currentUser.prestigeTier.label}</div>
                  <div className="text-xs text-muted">{currentUser.name}</div>
                </div>
                <div>
                  <div className={`text-3xl font-bold ${targetUser.prestigeTier.color}`}>
                    {targetUser.prestige}
                  </div>
                  <div className="text-sm text-subtle mt-1">{targetUser.prestigeTier.label}</div>
                  <div className="text-xs text-muted">{targetUser.name}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="bg-card border border-accent text-text">
          <CardContent className="p-4 text-center text-subtle text-sm">
            <Sparkles className="h-5 w-5 inline mr-2 text-accent" />
            Comparison respects both users' privacy settings. Stats shown are based on current gameplay data.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}










