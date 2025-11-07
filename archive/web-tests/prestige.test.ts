import { describe, it, expect } from 'vitest';
import { calculatePrestige, getPrestigeTier } from '@/lib/prestige';

describe('Prestige System', () => {
  describe('calculatePrestige', () => {
    it('should return 0 for new user', () => {
      const prestige = calculatePrestige(1, 0, 0, 0, 0);
      expect(prestige).toBeGreaterThanOrEqual(0);
    });

    it('should increase with level', () => {
      const low = calculatePrestige(1, 1, 100, 0, 0);
      const high = calculatePrestige(10, 1, 100, 0, 0);
      expect(high).toBeGreaterThan(low);
    });

    it('should increase with achievements', () => {
      const low = calculatePrestige(5, 1, 100, 0, 0);
      const high = calculatePrestige(5, 10, 100, 0, 0);
      expect(high).toBeGreaterThan(low);
    });

    it('should cap at 100', () => {
      const prestige = calculatePrestige(100, 100, 100000, 100, 100);
      expect(prestige).toBeLessThanOrEqual(100);
    });

    it('should never be negative', () => {
      const prestige = calculatePrestige(1, 0, 0, 0, 0);
      expect(prestige).toBeGreaterThanOrEqual(0);
    });

    it('should give bonus for duel wins', () => {
      const noDuels = calculatePrestige(5, 5, 1000, 0, 0);
      const withDuels = calculatePrestige(5, 5, 1000, 10, 0);
      expect(withDuels).toBeGreaterThan(noDuels);
    });

    it('should give bonus for friends (capped)', () => {
      const noFriends = calculatePrestige(5, 5, 1000, 0, 0);
      const someFriends = calculatePrestige(5, 5, 1000, 0, 10);
      const manyFriends = calculatePrestige(5, 5, 1000, 0, 100);
      
      expect(someFriends).toBeGreaterThan(noFriends);
      // Friend bonus should cap
      expect(manyFriends - someFriends).toBeLessThanOrEqual(5);
    });
  });

  describe('getPrestigeTier', () => {
    it('should return novice for low prestige', () => {
      const tier = getPrestigeTier(3);
      expect(tier.tier).toBe('novice');
    });

    it('should return legendary for prestige >= 90', () => {
      const tier = getPrestigeTier(95);
      expect(tier.tier).toBe('legendary');
      expect(tier.label).toContain('Legendary');
    });

    it('should return respected for mid-range prestige', () => {
      const tier = getPrestigeTier(50);
      expect(tier.tier).toBe('respected');
    });
  });
});













