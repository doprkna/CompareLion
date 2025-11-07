'use client';

/**
 * Streak Widget
 * Displays user's current daily streak
 * v0.13.2m - Retention Features
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStreakData, getStreakEmoji } from '@/lib/streak';
import { Flame, TrendingUp } from 'lucide-react';

interface StreakWidgetProps {
  compact?: boolean;
  showDetails?: boolean;
}

export function StreakWidget({ compact = false, showDetails = true }: StreakWidgetProps) {
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    updateStreak();

    // Listen for streak updates
    const handleStreakUpdate = () => {
      updateStreak();
    };

    window.addEventListener('streakUpdated', handleStreakUpdate);
    return () => window.removeEventListener('streakUpdated', handleStreakUpdate);
  }, []);

  const updateStreak = () => {
    const data = getStreakData();
    setStreak(data.currentStreak);
    setLongestStreak(data.longestStreak);
  };

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-full border border-orange-200 dark:border-orange-800">
        <span className="text-lg">{getStreakEmoji(streak)}</span>
        <span className="font-bold text-orange-600 dark:text-orange-400">
          {streak}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 rounded-lg p-4 border-2 border-orange-200 dark:border-orange-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-text">Daily Streak</h3>
            <p className="text-xs text-text-secondary">Keep it going!</p>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-4">
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={streak}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
            >
              {streak}
            </motion.div>
          </AnimatePresence>
          <p className="text-xs text-text-secondary mt-1">
            {streak === 1 ? 'day' : 'days'}
          </p>
        </div>

        {showDetails && longestStreak > 0 && (
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <TrendingUp className="h-3 w-3" />
              <span>Best: {longestStreak} days</span>
            </div>
          </div>
        )}
      </div>

      {streak === 0 && (
        <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
          <p className="text-xs text-text-secondary">
            🌱 Answer a question today to start your streak!
          </p>
        </div>
      )}

      {streak > 0 && streak < 3 && (
        <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
          <p className="text-xs text-text-secondary">
            🔥 {3 - streak} more day{3 - streak === 1 ? '' : 's'} to unlock streak bonuses!
          </p>
        </div>
      )}
    </div>
  );
}

