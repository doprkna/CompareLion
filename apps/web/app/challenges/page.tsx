"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/apiBase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Sparkles, Clock, CheckCircle2, Target } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import confetti from 'canvas-confetti';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  target: number;
  metric: string;
  progress: number;
  completed: boolean;
  reward: {
    xp: number;
    diamonds: number;
  };
  icon: string;
}

interface ChallengesData {
  daily: Challenge[];
  weekly: Challenge[];
  timestamp: string;
}

export default function ChallengesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<ChallengesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  async function loadChallenges() {
    setLoading(true);

    // Fetch challenges from API
    const res = await apiFetch('/api/challenges');
    if ((res as any).ok) {
      const apiData = (res as any).data;
      
      // Load progress from localStorage
      const savedProgress = localStorage.getItem('challenge_progress');
      const progressData = savedProgress ? JSON.parse(savedProgress) : {};

      // Merge API data with saved progress
      const today = new Date().toDateString();
      const thisWeek = getWeekKey(new Date());

      // Reset daily progress if it's a new day
      if (progressData.lastDaily !== today) {
        progressData.daily = {};
        progressData.lastDaily = today;
      }

      // Reset weekly progress if it's a new week
      if (progressData.lastWeekly !== thisWeek) {
        progressData.weekly = {};
        progressData.lastWeekly = thisWeek;
      }

      // Apply saved progress
      apiData.daily = apiData.daily.map((c: Challenge) => ({
        ...c,
        progress: progressData.daily?.[c.id] || 0,
        completed: (progressData.daily?.[c.id] || 0) >= c.target,
      }));

      apiData.weekly = apiData.weekly.map((c: Challenge) => ({
        ...c,
        progress: progressData.weekly?.[c.id] || 0,
        completed: (progressData.weekly?.[c.id] || 0) >= c.target,
      }));

      setChallenges(apiData);
      localStorage.setItem('challenge_progress', JSON.stringify(progressData));
    }

    setLoading(false);
  }

  function getWeekKey(date: Date): string {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - start.getTime();
    const oneWeek = 604800000;
    return `${date.getFullYear()}-W${Math.floor(diff / oneWeek)}`;
  }

  function updateProgress(challengeId: string, type: 'daily' | 'weekly', amount: number) {
    const savedProgress = localStorage.getItem('challenge_progress');
    const progressData = savedProgress ? JSON.parse(savedProgress) : { daily: {}, weekly: {} };

    progressData[type][challengeId] = (progressData[type][challengeId] || 0) + amount;
    localStorage.setItem('challenge_progress', JSON.stringify(progressData));

    // Reload challenges to reflect new progress
    loadChallenges();

    // Check if completed
    const challenge = challenges?.[type].find(c => c.id === challengeId);
    if (challenge && progressData[type][challengeId] >= challenge.target) {
      claimReward(challenge);
    }
  }

  function claimReward(challenge: Challenge) {
    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Show toast
    toast({
      title: `🎉 Challenge Complete!`,
      description: `${challenge.title} - Earned ${challenge.reward.xp} XP + ${challenge.reward.diamonds} 💎`,
    });

    // Track completion
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        events: [{
          name: 'challenge_completed',
          timestamp: Date.now(),
          data: { challengeId: challenge.id, type: challenge.type },
        }],
      }),
    });
  }

  function renderChallengeCard(challenge: Challenge) {
    const progressPercent = Math.min((challenge.progress / challenge.target) * 100, 100);

    return (
      <Card key={challenge.id} className={challenge.completed ? 'opacity-75' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{challenge.icon}</span>
              <span className="text-lg">{challenge.title}</span>
              {challenge.completed && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-subtle text-sm">{challenge.description}</p>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-subtle">Progress</span>
              <span className="font-bold">
                {challenge.progress} / {challenge.target}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Rewards */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>{challenge.reward.xp} XP</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg">💎</span>
              <span>{challenge.reward.diamonds}</span>
            </div>
          </div>

          {/* Test Button (dev only) */}
          {process.env.NODE_ENV === 'development' && !challenge.completed && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateProgress(challenge.id, challenge.type, 1)}
              className="w-full"
            >
              Test Progress +1
            </Button>
          )}

          {challenge.completed && (
            <div className="text-center text-green-600 font-medium text-sm">
              ✓ Completed!
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text text-xl">Loading challenges...</div>
      </div>
    );
  }

  if (!challenges) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text text-xl">Failed to load challenges</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text mb-2 flex items-center gap-3">
            <Target className="h-10 w-10 text-accent" />
            Challenges
          </h1>
          <p className="text-subtle">
            Complete daily and weekly challenges to earn XP and rewards
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="daily" className="gap-2">
              <Clock className="h-4 w-4" />
              Daily Challenges
            </TabsTrigger>
            <TabsTrigger value="weekly" className="gap-2">
              <Trophy className="h-4 w-4" />
              Weekly Challenges
            </TabsTrigger>
          </TabsList>

          {/* Daily Challenges */}
          <TabsContent value="daily">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.daily.map(renderChallengeCard)}
            </div>
            <div className="mt-6 text-center text-subtle text-sm">
              🔄 Resets daily at midnight
            </div>
          </TabsContent>

          {/* Weekly Challenges */}
          <TabsContent value="weekly">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.weekly.map(renderChallengeCard)}
            </div>
            <div className="mt-6 text-center text-subtle text-sm">
              🔄 Resets every Monday
            </div>
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="mt-8 bg-accent/5 border-accent/20">
          <CardContent className="p-4">
            <p className="text-sm text-center text-subtle">
              💡 <strong>Tip:</strong> Progress is tracked automatically as you use PareL. Come back daily to claim your rewards!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

