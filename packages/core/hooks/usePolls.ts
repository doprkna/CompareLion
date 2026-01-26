'use client';
// sanity-fix
/**
 * usePolls Hook
 * Fetches polls, individual polls, and challenges
 * v0.41.14 - Migrated useChallenges GET call to unified API client
 */

import { useCallback, useEffect, useState } from 'react';
import { defaultClient, ApiClientError } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)
import type { ChallengesResponseDTO } from '@parel/types'; // sanity-fix: replaced @parel/types/dto with @parel/types (dto not exported as subpath)

export function usePolls(region?: string | null) {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (typeof window === 'undefined') { // sanity-fix
        setError('Client-side only');
        setLoading(false);
        return;
      }
      const url = new URL('/api/polls', window.location.origin);
      if (region) url.searchParams.set('region', region);
      const res = await fetch(url.toString(), { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load polls');
      setPolls(json.polls || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load polls');
    } finally {
      setLoading(false);
    }
  }, [region]);

  useEffect(() => { load(); }, [load]);

  return { polls, loading, error, reload: load };
}

export function usePoll(id: string | null) {
  const [poll, setPoll] = useState<any | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/polls/${id}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load poll');
      setPoll(json.poll);
      setStats(json.stats);
    } catch (e: any) {
      setError(e?.message || 'Failed to load poll');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return { poll, stats, loading, error, reload: load };
}

export function useChallenges(region?: string | null) {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParam = region ? `?region=${encodeURIComponent(region)}` : '';
      const response = await defaultClient.get<ChallengesResponseDTO>(`/challenges/active${queryParam}`, {
        cache: 'no-store',
      });
      // ChallengesResponseDTO has daily and weekly arrays, but endpoint returns challenges array
      const challengesData = (response?.data as any)?.challenges || []; // sanity-fix
      setChallenges(challengesData);
    } catch (e: unknown) {
      const errorMessage = e instanceof ApiClientError
        ? e.message
        : e instanceof Error
          ? e.message
          : 'Failed to load challenges';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [region]);

  useEffect(() => { load(); }, [load]);

  return { challenges, loading, error, reload: load };
}

