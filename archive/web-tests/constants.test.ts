/**
 * Constants Tests
 * 
 * Verify main constants file exports defined values
 * v0.30.6 - Testing & Verification Recovery
 */

import { describe, it, expect } from 'vitest';
import {
  XP_CONSTANTS,
  CURRENCY_CONSTANTS,
  ECONOMY_CONSTANTS,
  REWARD_CONSTANTS,
  COLOR_CONSTANTS,
  LIMITS_CONSTANTS,
  TIMING_CONSTANTS,
  ACHIEVEMENT_CONSTANTS,
  DEFAULTS,
} from '@/lib/config/constants';

describe('Constants Exports', () => {
  it('should export XP_CONSTANTS', () => {
    expect(XP_CONSTANTS).toBeDefined();
    expect(XP_CONSTANTS.LEVEL_MULTIPLIER).toBe(100);
    expect(XP_CONSTANTS.QUESTION_BASE).toBe(10);
    expect(XP_CONSTANTS.DIFFICULTY).toBeDefined();
    expect(XP_CONSTANTS.STREAK_BONUS).toBeDefined();
  });

  it('should export CURRENCY_CONSTANTS', () => {
    expect(CURRENCY_CONSTANTS).toBeDefined();
    expect(CURRENCY_CONSTANTS.STARTING_FUNDS).toBe(1000);
    expect(CURRENCY_CONSTANTS.STARTING_DIAMONDS).toBe(0);
    expect(CURRENCY_CONSTANTS.SYMBOLS).toBeDefined();
  });

  it('should export ECONOMY_CONSTANTS', () => {
    expect(ECONOMY_CONSTANTS).toBeDefined();
    expect(ECONOMY_CONSTANTS.XP_TO_COINS_RATIO).toBe(10);
    expect(ECONOMY_CONSTANTS.REWARDS).toBeDefined();
    expect(ECONOMY_CONSTANTS.SEASON).toBeDefined();
    expect(ECONOMY_CONSTANTS.SHOP).toBeDefined();
  });

  it('should export REWARD_CONSTANTS', () => {
    expect(REWARD_CONSTANTS).toBeDefined();
    expect(REWARD_CONSTANTS.BASE).toBeDefined();
    expect(REWARD_CONSTANTS.STREAK_MULTIPLIER).toBeDefined();
    expect(REWARD_CONSTANTS.DIFFICULTY_MULTIPLIER).toBeDefined();
    expect(REWARD_CONSTANTS.CAPS).toBeDefined();
  });

  it('should export COLOR_CONSTANTS', () => {
    expect(COLOR_CONSTANTS).toBeDefined();
    expect(COLOR_CONSTANTS.KARMA).toBeDefined();
    expect(COLOR_CONSTANTS.PRESTIGE).toBeDefined();
    expect(COLOR_CONSTANTS.DIFFICULTY).toBeDefined();
    expect(COLOR_CONSTANTS.STATUS).toBeDefined();
  });

  it('should export LIMITS_CONSTANTS', () => {
    expect(LIMITS_CONSTANTS).toBeDefined();
    expect(LIMITS_CONSTANTS.QUESTIONS).toBeDefined();
    expect(LIMITS_CONSTANTS.SOCIAL).toBeDefined();
    expect(LIMITS_CONSTANTS.CONTENT).toBeDefined();
  });

  it('should export TIMING_CONSTANTS', () => {
    expect(TIMING_CONSTANTS).toBeDefined();
    expect(TIMING_CONSTANTS.DEBOUNCE).toBeDefined();
    expect(TIMING_CONSTANTS.ANIMATION).toBeDefined();
    expect(TIMING_CONSTANTS.POLLING).toBeDefined();
  });

  it('should export ACHIEVEMENT_CONSTANTS', () => {
    expect(ACHIEVEMENT_CONSTANTS).toBeDefined();
    expect(ACHIEVEMENT_CONSTANTS.POINTS).toBeDefined();
    expect(ACHIEVEMENT_CONSTANTS.RARITY).toBeDefined();
  });

  it('should export DEFAULTS', () => {
    expect(DEFAULTS).toBeDefined();
    expect(DEFAULTS.user).toBeDefined();
    expect(DEFAULTS.pagination).toBeDefined();
    expect(DEFAULTS.user.level).toBe(1);
    expect(DEFAULTS.user.xp).toBe(0);
  });

  it('should export helper functions', () => {
    // Import helper functions
    const {
      xpToCoins,
      coinsToXP,
      getCoinReward,
      getPriceRange,
      getSeasonEndReward,
    } = require('@/lib/config/constants');
    
    expect(typeof xpToCoins).toBe('function');
    expect(typeof coinsToXP).toBe('function');
    expect(typeof getCoinReward).toBe('function');
    expect(typeof getPriceRange).toBe('function');
    expect(typeof getSeasonEndReward).toBe('function');
  });

  describe('Helper Function Tests', () => {
    const { xpToCoins, coinsToXP, getCoinReward } = require('@/lib/config/constants');

    it('xpToCoins should convert correctly', () => {
      expect(xpToCoins(100)).toBe(10);
      expect(xpToCoins(50)).toBe(5);
      expect(xpToCoins(0)).toBe(0);
    });

    it('coinsToXP should convert correctly', () => {
      expect(coinsToXP(10)).toBe(100);
      expect(coinsToXP(5)).toBe(50);
      expect(coinsToXP(0)).toBe(0);
    });

    it('getCoinReward should return reward values', () => {
      expect(typeof getCoinReward('questionAnswered')).toBe('number');
      expect(getCoinReward('questionAnswered')).toBeGreaterThanOrEqual(0);
    });
  });
});




