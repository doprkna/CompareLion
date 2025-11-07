import { useCallback, useEffect, useState } from 'react';

export function usePolls(region?: string | null) {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
      const url = new URL('/api/challenges/active', window.location.origin);
      if (region) url.searchParams.set('region', region);
      const res = await fetch(url.toString(), { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load challenges');
      setChallenges(json.challenges || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  }, [region]);

  useEffect(() => { load(); }, [load]);

  return { challenges, loading, error, reload: load };
}


