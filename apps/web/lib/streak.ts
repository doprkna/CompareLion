/**
 * Daily Streak Tracking
 * Manages user streaks based on daily activity
 * v0.13.2m - Retention Features
 */

import { logger } from '@/lib/logger';

export interface StreakData {
  currentStreak: number;
  lastAnswerDate: string; // ISO date string
  longestStreak: number;
  totalDaysActive: number;
}

const STREAK_STORAGE_KEY = 'userStreak';
const STREAK_GRACE_PERIOD_HOURS = 48; // 48 hours before streak resets

/**
 * Get current streak data from localStorage
 */
export function getStreakData(): StreakData {
  if (typeof window === 'undefined') {
    return getDefaultStreak();
  }

  try {
    const stored = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!stored) {
      return getDefaultStreak();
    }

    const parsed = JSON.parse(stored) as StreakData;
    return parsed;
  } catch (error) {
    logger.error('[STREAK] Failed to parse streak data', error);
    return getDefaultStreak();
  }
}

/**
 * Update streak based on new activity
 * Returns { streak, isNewStreak, wasBroken }
 */
export function updateStreak(): {
  streak: StreakData;
  isNewStreak: boolean;
  wasBroken: boolean;
  isFirstDay: boolean;
} {
  const currentStreak = getStreakData();
  const now = new Date();
  const today = getDateString(now);
  
  // If this is the first time, initialize
  if (!currentStreak.lastAnswerDate) {
    const newStreak: StreakData = {
      currentStreak: 1,
      lastAnswerDate: today,
      longestStreak: 1,
      totalDaysActive: 1,
    };
    saveStreakData(newStreak);
    return {
      streak: newStreak,
      isNewStreak: true,
      wasBroken: false,
      isFirstDay: true,
    };
  }

  const lastDate = new Date(currentStreak.lastAnswerDate);
  const hoursSinceLastActivity = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
  
  // Same day - no change
  if (today === currentStreak.lastAnswerDate) {
    return {
      streak: currentStreak,
      isNewStreak: false,
      wasBroken: false,
      isFirstDay: false,
    };
  }

  // Check if consecutive day
  const yesterday = getDateString(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const isConsecutive = currentStreak.lastAnswerDate === yesterday;

  // Streak broken if more than grace period
  const isStreakBroken = hoursSinceLastActivity > STREAK_GRACE_PERIOD_HOURS && !isConsecutive;

  let newCurrentStreak: number;
  if (isStreakBroken) {
    newCurrentStreak = 1;
  } else if (isConsecutive) {
    newCurrentStreak = currentStreak.currentStreak + 1;
  } else {
    // Within grace period but not consecutive
    newCurrentStreak = currentStreak.currentStreak;
  }

  const newStreak: StreakData = {
    currentStreak: newCurrentStreak,
    lastAnswerDate: today,
    longestStreak: Math.max(newCurrentStreak, currentStreak.longestStreak),
    totalDaysActive: currentStreak.totalDaysActive + 1,
  };

  saveStreakData(newStreak);

  return {
    streak: newStreak,
    isNewStreak: isConsecutive,
    wasBroken: isStreakBroken,
    isFirstDay: false,
  };
}

/**
 * Save streak data to localStorage
 */
export function saveStreakData(streak: StreakData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak));
  } catch (error) {
    logger.error('[STREAK] Failed to save streak data', error);
  }
}

/**
 * Reset streak (for testing or user request)
 */
export function resetStreak(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STREAK_STORAGE_KEY);
}

/**
 * Get streak emoji based on streak count
 */
export function getStreakEmoji(streak: number): string {
  if (streak === 0) return '💤';
  if (streak === 1) return '🌱';
  if (streak < 7) return '🔥';
  if (streak < 30) return '⚡';
  if (streak < 100) return '🌟';
  return '👑';
}

/**
 * Get streak message
 */
export function getStreakMessage(streak: number, isNewStreak: boolean, wasBroken: boolean): string {
  if (wasBroken) {
    return "Streak reset. Start fresh today! 🌱";
  }
  
  if (!isNewStreak) {
    return `Keep your ${streak}-day streak alive! 🔥`;
  }

  if (streak === 1) {
    return "Day 1! Let's start a streak! 🌱";
  }
  
  if (streak === 3) {
    return "3 days in a row! You're on fire! 🔥";
  }
  
  if (streak === 7) {
    return "One week streak! Amazing! ⚡";
  }
  
  if (streak === 30) {
    return "30-day streak! You're a legend! 🌟";
  }
  
  if (streak === 100) {
    return "100-day streak! Hall of Fame! 👑";
  }

  if (streak % 10 === 0) {
    return `${streak} days! Keep it going! 🔥`;
  }

  return `Day ${streak} streak! 🔥`;
}

// Helper functions

function getDefaultStreak(): StreakData {
  return {
    currentStreak: 0,
    lastAnswerDate: '',
    longestStreak: 0,
    totalDaysActive: 0,
  };
}

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Check if user has answered today
 */
export function hasAnsweredToday(): boolean {
  const streak = getStreakData();
  if (!streak.lastAnswerDate) return false;

  const today = getDateString(new Date());
  return streak.lastAnswerDate === today;
}

/**
 * Get days until streak expires (within grace period)
 */
export function getDaysUntilExpiry(): number {
  const streak = getStreakData();
  if (!streak.lastAnswerDate || streak.currentStreak === 0) return 0;

  const lastDate = new Date(streak.lastAnswerDate);
  const now = new Date();
  const hoursSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
  
  const hoursRemaining = STREAK_GRACE_PERIOD_HOURS - hoursSince;
  return Math.max(0, Math.ceil(hoursRemaining / 24));
}

