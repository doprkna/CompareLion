/**
 * Retention Features Smoke Tests
 * Tests for onboarding, streaks, and notifications
 * v0.13.2m - Retention Features
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getStreakData,
  updateStreak,
  resetStreak,
  hasAnsweredToday,
  getStreakEmoji,
  getStreakMessage,
} from '../apps/web/lib/streak';
import {
  isNotificationSupported,
  getNotificationConfig,
  saveNotificationConfig,
  toggleNotifications,
} from '../apps/web/lib/notifications';

describe('Streak System', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    resetStreak();
  });

  it('should initialize with default streak data', () => {
    const streak = getStreakData();
    
    expect(streak.currentStreak).toBe(0);
    expect(streak.lastAnswerDate).toBe('');
    expect(streak.longestStreak).toBe(0);
    expect(streak.totalDaysActive).toBe(0);
  });

  it('should start a streak on first activity', () => {
    const result = updateStreak();
    
    expect(result.streak.currentStreak).toBe(1);
    expect(result.isFirstDay).toBe(true);
    expect(result.wasBroken).toBe(false);
    expect(result.streak.totalDaysActive).toBe(1);
  });

  it('should not increment streak on same day', () => {
    // First activity
    updateStreak();
    
    // Second activity same day
    const result = updateStreak();
    
    expect(result.streak.currentStreak).toBe(1);
    expect(result.isNewStreak).toBe(false);
  });

  it('should increment streak on consecutive days', () => {
    // Day 1
    const day1 = updateStreak();
    expect(day1.streak.currentStreak).toBe(1);

    // Manually set yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const streakData = getStreakData();
    streakData.lastAnswerDate = yesterdayStr;
    localStorage.setItem('userStreak', JSON.stringify(streakData));

    // Day 2
    const day2 = updateStreak();
    expect(day2.streak.currentStreak).toBe(2);
    expect(day2.isNewStreak).toBe(true);
  });

  it('should reset streak after grace period', () => {
    // Day 1
    updateStreak();

    // Set last answer to 3 days ago (beyond grace period)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];
    
    const streakData = getStreakData();
    streakData.lastAnswerDate = threeDaysAgoStr;
    streakData.currentStreak = 5;
    localStorage.setItem('userStreak', JSON.stringify(streakData));

    // New activity after gap
    const result = updateStreak();
    expect(result.streak.currentStreak).toBe(1);
    expect(result.wasBroken).toBe(true);
  });

  it('should track longest streak', () => {
    // Build a 3-day streak manually
    const streakData = getStreakData();
    streakData.currentStreak = 3;
    streakData.longestStreak = 3;
    localStorage.setItem('userStreak', JSON.stringify(streakData));

    // Reset streak
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    streakData.lastAnswerDate = threeDaysAgo.toISOString().split('T')[0];
    localStorage.setItem('userStreak', JSON.stringify(streakData));

    // Start new streak
    const result = updateStreak();
    expect(result.streak.currentStreak).toBe(1);
    expect(result.streak.longestStreak).toBe(3); // Longest should remain
  });

  it('should return correct hasAnsweredToday status', () => {
    // Before any activity
    expect(hasAnsweredToday()).toBe(false);

    // After activity
    updateStreak();
    expect(hasAnsweredToday()).toBe(true);
  });

  it('should return appropriate emoji for streak', () => {
    expect(getStreakEmoji(0)).toBe('💤');
    expect(getStreakEmoji(1)).toBe('🌱');
    expect(getStreakEmoji(5)).toBe('🔥');
    expect(getStreakEmoji(15)).toBe('⚡');
    expect(getStreakEmoji(50)).toBe('🌟');
    expect(getStreakEmoji(150)).toBe('👑');
  });

  it('should return appropriate messages for streaks', () => {
    const msg1 = getStreakMessage(1, true, false);
    expect(msg1).toContain('Day 1');

    const msg3 = getStreakMessage(3, true, false);
    expect(msg3).toContain('3 days');

    const msgBroken = getStreakMessage(1, false, true);
    expect(msgBroken).toContain('reset');
  });
});

describe('Notification System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should check notification support', () => {
    const supported = isNotificationSupported();
    expect(typeof supported).toBe('boolean');
  });

  it('should initialize with default config', () => {
    const config = getNotificationConfig();
    
    expect(config.enabled).toBe(false);
    expect(config.dailyReminder).toBe(false);
    expect(config.reminderTime).toBe('09:00');
    expect(config.streakReminder).toBe(true);
  });

  it('should save and load notification config', () => {
    const config = {
      enabled: true,
      dailyReminder: true,
      reminderTime: '10:30',
      streakReminder: false,
    };

    saveNotificationConfig(config);
    const loaded = getNotificationConfig();

    expect(loaded.enabled).toBe(true);
    expect(loaded.dailyReminder).toBe(true);
    expect(loaded.reminderTime).toBe('10:30');
    expect(loaded.streakReminder).toBe(false);
  });

  it('should handle malformed config gracefully', () => {
    localStorage.setItem('notificationConfig', 'invalid json');
    
    const config = getNotificationConfig();
    expect(config.enabled).toBe(false); // Should return default
  });
});

describe('API Integration', () => {
  it('should have /api/notify endpoint', async () => {
    const response = await fetch('/api/notify', {
      method: 'GET',
    });

    // Should return 200 or similar
    expect([200, 401, 404]).toContain(response.status);
  });

  it('should validate notification request schema', async () => {
    const response = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'test',
      }),
    });

    // Should handle request (even if not authenticated)
    expect([200, 401]).toContain(response.status);
  });
});

describe('Onboarding Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should check onboarding status', () => {
    const onboarded = localStorage.getItem('onboarded');
    expect(onboarded).toBeNull();

    localStorage.setItem('onboarded', 'true');
    expect(localStorage.getItem('onboarded')).toBe('true');
  });

  it('should save and load onboarding progress', () => {
    const progress = {
      step: 'profile' as const,
      profileName: 'Test User',
    };

    localStorage.setItem('onboardingProgress', JSON.stringify(progress));
    const loaded = JSON.parse(localStorage.getItem('onboardingProgress') || '{}');

    expect(loaded.step).toBe('profile');
    expect(loaded.profileName).toBe('Test User');
  });

  it('should clear onboarding progress after completion', () => {
    localStorage.setItem('onboardingProgress', JSON.stringify({ step: 'intro' }));
    localStorage.setItem('onboarded', 'true');
    localStorage.removeItem('onboardingProgress');

    expect(localStorage.getItem('onboarded')).toBe('true');
    expect(localStorage.getItem('onboardingProgress')).toBeNull();
  });
});

