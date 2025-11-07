'use client';

import { useState, useEffect } from 'react';

export interface Quest {
  id: string;
  questId: string;
  userQuestId?: string | null;
  key: string;
  lore?: {
    text: string;
    tone: 'serious' | 'comedic' | 'poetic';
  } | null;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'story' | 'side';
  requirementType: 'xp' | 'reflections' | 'gold' | 'missions' | 'custom';
  requirementValue: number;
  rewardXP: number;
  rewardGold: number;
  rewardItem?: string | null;
  rewardBadge?: string | null;
  rewardKarma: number;
  isRepeatable: boolean;
  progress: number;
  progressPercent: number;
  isCompleted: boolean;
  isClaimed: boolean;
  canClaim: boolean;
  startedAt?: string;
  completedAt?: string | null;
}

export function useQuests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/quests');
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch quests');
      }
      setQuests(data.quests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quests');
      setQuests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, []);

  return { quests, loading, error, reload: fetchQuests };
}

export function useActiveQuests() {
  const [quests, setQuests] = useState<{
    daily: Quest[];
    weekly: Quest[];
    story: Quest[];
    side: Quest[];
  }>({
    daily: [],
    weekly: [],
    story: [],
    side: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveQuests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/quests/active');
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch active quests');
      }
      setQuests(data.quests || { daily: [], weekly: [], story: [], side: [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quests');
      setQuests({ daily: [], weekly: [], story: [], side: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveQuests();
  }, []);

  return { quests, loading, error, reload: fetchActiveQuests };
}

export function useClaimQuest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claim = async (userQuestId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuestId }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to claim quest');
      }
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to claim quest';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { claim, loading, error };
}

