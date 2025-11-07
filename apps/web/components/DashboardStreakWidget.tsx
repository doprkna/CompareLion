'use client';

/**
 * Dashboard Streak & Level Widget
 * Combined XP and streak display for main dashboard
 * v0.13.2m - Retention Features
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getStreakData } from '@/lib/streak';
import { Flame, Zap, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import confetti from 'canvas-confetti';

interface DashboardStreakWidgetProps {
  userXp?: number;
  userLevel?: number;
}

export function DashboardStreakWidget({ userXp = 0, userLevel = 1 }: DashboardStreakWidgetProps) {
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const data = getStreakData();
    setStreak(data.currentStreak);
    setLongestStreak(data.longestStreak);

    // Celebrate if streak is > 3
    if (data.currentStreak >= 3 && !sessionStorage.getItem('celebrationShown')) {
      setShowCelebration(true);
      sessionStorage.setItem('celebrationShown', 'true');
      
      // Fire confetti
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      }, 500);
    }

    // Listen for streak updates
    const handleStreakUpdate = () => {
      const updatedData = getStreakData();
      setStreak(updatedData.currentStreak);
      setLongestStreak(updatedData.longestStreak);

      // Celebrate on new milestones
      if (updatedData.currentStreak % 7 === 0 && updatedData.currentStreak > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    };

    window.addEventListener('streakUpdated', handleStreakUpdate);
    return () => window.removeEventListener('streakUpdated', handleStreakUpdate);
  }, []);

  if (!mounted) {
    return null;
  }

  // Calculate XP for current level (simple progression)
  const xpForCurrentLevel = userLevel * 100;
  const xpProgress = (userXp % xpForCurrentLevel) / xpForCurrentLevel * 100;

  return (
    <Card className="overflow-hidden border-2 border-primary/20">
      <CardContent className="p-0">
        <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Streak Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  streak >= 7 ? 'bg-gradient-to-br from-orange-500 to-red-500 animate-pulse' : 
                  streak >= 3 ? 'bg-gradient-to-br from-orange-500 to-red-500' :
                  'bg-gray-400'
                }`}>
                  <Flame className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-sm text-text">Streak</h3>
              </div>

              <div className="relative">
                <motion.div
                  key={streak}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    ...(showCelebration && streak >= 3 ? {
                      rotate: [0, -5, 5, -5, 5, 0],
                    } : {})
                  }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl font-bold"
                >
                  <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {streak}
                  </span>
                  <span className="text-base text-text-secondary ml-1">
                    {streak === 1 ? 'day' : 'days'}
                  </span>
                </motion.div>

                {streak >= 3 && showCelebration && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute -top-2 -right-2"
                  >
                    <div className="bg-yellow-400 rounded-full p-1 shadow-lg">
                      <Star className="h-4 w-4 text-white fill-white" />
                    </div>
                  </motion.div>
                )}
              </div>

              {longestStreak > streak && (
                <div className="flex items-center gap-1 text-xs text-text-secondary">
                  <TrendingUp className="h-3 w-3" />
                  <span>Best: {longestStreak}</span>
                </div>
              )}
            </div>

            {/* Level Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-sm text-text">Level</h3>
              </div>

              <div>
                <div className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {userLevel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-text-secondary">
                <Zap className="h-3 w-3" />
                <span>{userXp} XP</span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-text-secondary">
                Level {userLevel} Progress
              </span>
              <span className="text-xs font-medium text-text-secondary">
                {Math.round(xpProgress)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Motivational Message */}
          {streak === 0 && (
            <div className="mt-4 p-3 bg-bg rounded-lg border border-border">
              <p className="text-xs text-text-secondary text-center">
                🌱 Start your streak today! Answer your first question.
              </p>
            </div>
          )}

          {streak >= 7 && (
            <div className="mt-4 p-3 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-xs text-center font-medium text-orange-700 dark:text-orange-300">
                🔥 You're on fire! {streak}-day streak!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

