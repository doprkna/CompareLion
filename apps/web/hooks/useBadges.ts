'use client';

import { useState, useEffect } from 'react';

export interface Badge {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'eternal';
  unlockType: 'level' | 'event' | 'season' | 'special';
  requirementValue?: string | null;
  rewardType?: 'currency' | 'item' | 'title' | null;
  rewardValue?: string | null;
  seasonId?: string | null;
  isUnlocked?: boolean;
  unlockedAt?: string;
  claimedAt?: string | null;
  isClaimed?: boolean;
  canClaim?: boolean;
  userBadgeId?: string; // UserBadge.id for claiming rewards
}

export function useBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = async (unlocked?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const params = unlocked !== undefined ? `?unlocked=${unlocked}` : '';
      const res = await fetch(`/api/badges${params}`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch badges');
      }
      setBadges(data.badges || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load badges');
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  return { badges, loading, error, reload: fetchBadges };
}

export function useUserBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserBadges = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/badges/user');
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch user badges');
      }
      setBadges(data.badges || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load badges');
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBadges();
  }, []);

  return { 
    badges, 
    loading, 
    error, 
    reload: fetchUserBadges,
    claimedCount: badges.filter(b => b.isClaimed).length,
    unclaimedCount: badges.filter(b => !b.isClaimed && b.canClaim).length,
  };
}

