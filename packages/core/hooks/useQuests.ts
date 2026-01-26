'use client';
// sanity-fix
/**
 * useQuests Hook
 * Fetches quests and active quests
 * v0.41.13 - Migrated GET calls to unified API client
 */

'use client';

import { useState, useEffect } from 'react';
import { defaultClient, ApiClientError } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)
import type { QuestsResponseDTO } from '@parel/types'; // sanity-fix: replaced @parel/types/dto with @parel/types (dto not exported as subpath)

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
      const response = await defaultClient.get<QuestsResponseDTO>('/quests');
      setQuests(response?.data?.quests || []); // sanity-fix
    } catch (err) {
      const errorMessage = err instanceof ApiClientError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Failed to load quests';
      setError(errorMessage);
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
      const response = await defaultClient.get('/quests/active');
      setQuests(response?.data?.quests || { daily: [], weekly: [], story: [], side: [] }); // sanity-fix
    } catch (err) {
      const errorMessage = err instanceof ApiClientError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Failed to load quests';
      setError(errorMessage);
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
