/**
 * useStreak Hook
 * React hook for managing streaks in components
 * v0.13.2m - Retention Features
 */

import { useEffect, useState, useCallback } from 'react';
import { updateStreak, getStreakData, getStreakMessage, type StreakData } from '@/lib/streak';
import { toast } from 'sonner';

export function useStreak() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial streak data
    const data = getStreakData();
    setStreak(data);
    setLoading(false);
  }, []);

  const recordActivity = useCallback(() => {
    const result = updateStreak();
    setStreak(result.streak);

    // Show toast message
    const message = getStreakMessage(
      result.streak.currentStreak,
      result.isNewStreak,
      result.wasBroken
    );
    
    if (result.wasBroken) {
      toast.error(message);
    } else if (result.isNewStreak) {
      toast.success(message);
    }

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('streakUpdated', { detail: result.streak }));

    return result;
  }, []);

  return {
    streak,
    loading,
    recordActivity,
  };
}

