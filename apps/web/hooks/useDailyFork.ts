import { useCallback, useEffect, useState } from 'react';

export function useDailyFork() {
  const [fork, setFork] = useState<any | null>(null);
  const [userChoice, setUserChoice] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/forks/today', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load fork');
      setFork(json.fork);
      setUserChoice(json.userChoice);
    } catch (e: any) {
      setError(e?.message || 'Failed to load fork');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { fork, userChoice, loading, error, reload: load };
}

export function useChooseFork() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const choose = useCallback(async (forkId: string, choice: 'A' | 'B') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/forks/choose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forkId, choice }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to make choice');
      return json;
    } catch (e: any) {
      setError(e?.message || 'Failed to make choice');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { choose, loading, error };
}

