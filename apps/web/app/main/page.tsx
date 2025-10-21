'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/apiBase";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, TrendingUp, Flame, Star, Target, AlertCircle } from "lucide-react";
import { useEventBus } from "@/hooks/useEventBus";
import { xpToLevel, levelProgress } from "@/lib/xp";
import { LevelUpPopup } from "@/components/LevelUpPopup";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

interface UserSummary {
  name: string;
  email: string;
  image: string | null;
  xp: number;
  funds: number;
  diamonds: number;
  level: number;
  progress: number;
  streakCount: number;
  questionsAnswered: number;
  achievements: Array<{
    id: string;
    code: string;
    title: string;
    description: string;
    icon: string | null;
    xpReward: number;
    earnedAt: string;
  }>;
}

export default function MainPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('[MainPage] Loading user data...');
      const res = await apiFetch("/api/user/summary");
      console.log('[MainPage] API response:', res);
      
      if (res.ok && res.data?.data?.user) {
        console.log('[MainPage] Setting user data:', res.data.data.user);
        setData(res.data.data.user);
      } else {
        console.error("Failed to load user data:", res.error);
        console.error("Response structure:", res);
        setData(null);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen for XP updates
  useEventBus("xp:update", useCallback((eventData: any) => {
    if (session?.user?.id && eventData.userId === session.user.id) {
      setData((prev) => {
        if (!prev) return prev;
        const newXp = eventData.newXp;
        const newCalculatedLevel = xpToLevel(newXp);
        
        // Check for level up
        if (newCalculatedLevel > prev.level) {
          setNewLevel(newCalculatedLevel);
          setShowLevelUp(true);
        }
        
        return {
          ...prev,
          xp: newXp,
          level: newCalculatedLevel,
          progress: levelProgress(newXp),
        };
      });
    }
  }, [session?.user?.id]));

  // Polling fallback (refresh every 60 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) {
    return <SkeletonLoader variant="profile" />;
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Card className="bg-card border-2 border-border max-w-lg">
          <CardContent className="p-6">
            <EmptyState
              icon={AlertCircle}
              title="Unable to Load Profile"
              description="We couldn't fetch your profile data. This might be a temporary issue. Please try refreshing the page or logging in again."
              action={
                <div className="flex gap-3">
                  <Button onClick={() => loadData()} variant="outline">
                    Try Again
                  </Button>
                  <Button onClick={() => router.push('/login')}>
                    Back to Login
                  </Button>
                </div>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Level Up Animation */}
      <LevelUpPopup 
        show={showLevelUp} 
        level={newLevel} 
        onComplete={() => setShowLevelUp(false)} 
      />

      <div className="min-h-screen bg-bg p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Hero Section */}
        <div className="flex items-center gap-4">
          {data.image && (
            <img
              src={data.image}
              alt={data.name}
              className="w-20 h-20 rounded-full border-4 border-accent"
            />
          )}
          <div>
            <h1 className="text-4xl font-bold text-text">
              Welcome, {data.name}! 👋
            </h1>
            <p className="text-subtle mt-1">
              Level {data.level} • {data.questionsAnswered} questions answered
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border-2 border-accent rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-subtle text-sm">XP</span>
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div className="text-3xl font-bold text-accent">{data.xp}</div>
          </div>

          <div className="bg-card border-2 border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-subtle text-sm">Gold</span>
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-text">{data.funds}</div>
          </div>

          <div className="bg-card border-2 border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-subtle text-sm">Diamonds</span>
              <Star className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-text">{data.diamonds}</div>
          </div>

          <div className="bg-card border-2 border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-subtle text-sm">Streak</span>
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-text">{data.streakCount} 🔥</div>
          </div>
        </div>

        {/* Level Progress Card */}
        <Card className="bg-card border-2 border-accent text-text shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-accent" />
              Level Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Level {data.level}</span>
                <span className="text-subtle">{Math.round(data.progress)}% to Level {data.level + 1}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="relative w-full h-6 bg-bg rounded-full overflow-hidden border-2 border-border">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-blue-400 transition-all duration-500"
                  style={{ width: `${data.progress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text">
                  {Math.round(data.progress)}%
                </div>
              </div>

              <div className="flex justify-between text-sm text-subtle">
                <span>Current XP: {data.xp}</span>
                <span>Keep going! 💪</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements Card */}
        <Card className="bg-card border-2 border-border text-text shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Trophy className="h-6 w-6 text-accent" />
              Achievements ({data.achievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="bg-bg border-2 border-accent rounded-lg p-4 text-center hover:shadow-lg transition-shadow"
                  >
                    <div className="text-4xl mb-2">{achievement.icon || "🏆"}</div>
                    <div className="font-bold text-text">{achievement.title}</div>
                    <div className="text-xs text-subtle mt-1">{achievement.description}</div>
                    <div className="text-xs text-accent mt-2 font-bold">
                      +{achievement.xpReward} XP
                    </div>
                    <div className="text-xs text-subtle mt-1">
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Trophy}
                title="No Achievements Yet"
                description="Complete flows, answer questions, and participate in challenges to unlock achievements and earn rewards!"
                action={
                  <Button onClick={() => router.push("/flow-demo")} className="bg-accent text-white">
                    <Target className="h-4 w-4 mr-2" />
                    Start Your First Flow
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => router.push("/flow-demo")}
            className="bg-accent text-white hover:opacity-90 h-16 text-lg font-bold"
          >
            <Target className="h-6 w-6 mr-2" />
            Start Flow
          </Button>
          <Button
            onClick={() => router.push("/leaderboard")}
            variant="outline"
            className="border-2 border-accent text-accent hover:bg-accent/10 h-16 text-lg font-bold"
          >
            <Trophy className="h-6 w-6 mr-2" />
            Leaderboard
          </Button>
          <Button
            onClick={() => router.push("/shop")}
            variant="outline"
            className="border-2 border-border text-text hover:bg-card/50 h-16 text-lg font-bold"
          >
            <Star className="h-6 w-6 mr-2" />
            Shop
          </Button>
        </div>

        {/* Footer Note */}
        <div className="text-center text-subtle text-sm">
          💡 Complete flows, send messages, and explore to earn more XP and unlock achievements!
        </div>
        </div>
      </div>
    </>
  );
}
