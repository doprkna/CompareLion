import { describe, it, expect } from 'vitest';
import { calculateAnswerKarma, calculateChallengeKarma, calculateSocialKarma, getKarmaTier } from '../lib/karma';

describe('Karma System', () => {
  describe('calculateAnswerKarma', () => {
    it('should give positive karma for positive answers', () => {
      const karma = calculateAnswerKarma('yes, I always help others');
      expect(karma).toBeGreaterThan(0);
    });

    it('should give negative karma for negative answers', () => {
      const karma = calculateAnswerKarma('no, never');
      expect(karma).toBeLessThan(0);
    });

    it('should reward long, thoughtful answers', () => {
      const longAnswer = 'This is a very detailed and thoughtful response that shows I really care about the question and want to provide value. I believe in helping others and always try to be positive.';
      const karma = calculateAnswerKarma(longAnswer);
      expect(karma).toBeGreaterThan(0);
    });

    it('should penalize very short answers', () => {
      const karma = calculateAnswerKarma('idk');
      expect(karma).toBeLessThan(0);
    });

    it('should cap karma delta between -5 and +5', () => {
      const positiveKarma = calculateAnswerKarma('yes always definitely agree help support');
      const negativeKarma = calculateAnswerKarma('no never rarely disagree ignore avoid');
      
      expect(positiveKarma).toBeLessThanOrEqual(5);
      expect(positiveKarma).toBeGreaterThanOrEqual(-5);
      expect(negativeKarma).toBeLessThanOrEqual(5);
      expect(negativeKarma).toBeGreaterThanOrEqual(-5);
    });
  });

  describe('calculateChallengeKarma', () => {
    it('should give +1 karma for accepting challenges', () => {
      expect(calculateChallengeKarma('accepted')).toBe(1);
    });

    it('should give -1 karma for declining challenges', () => {
      expect(calculateChallengeKarma('declined')).toBe(-1);
    });
  });

  describe('calculateSocialKarma', () => {
    it('should reward helping others', () => {
      expect(calculateSocialKarma('helped')).toBe(2);
    });

    it('should penalize ignoring others', () => {
      expect(calculateSocialKarma('ignored')).toBe(-0.5);
    });

    it('should reward reactions', () => {
      expect(calculateSocialKarma('reacted')).toBe(0.5);
    });
  });

  describe('getKarmaTier', () => {
    it('should return saint for karma >= 100', () => {
      const tier = getKarmaTier(100);
      expect(tier.tier).toBe('saint');
      expect(tier.label).toContain('Saint');
    });

    it('should return neutral for karma around 0', () => {
      const tier = getKarmaTier(0);
      expect(tier.tier).toBe('neutral');
    });

    it('should return villain for very negative karma', () => {
      const tier = getKarmaTier(-100);
      expect(tier.tier).toBe('villain');
    });
  });
});











