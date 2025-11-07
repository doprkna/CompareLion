import { useCallback, useEffect, useState } from 'react';

export function useRarities() {
  const [rarities, setRarities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/rarities', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load rarities');
      setRarities(json.rarities || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load rarities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { rarities, loading, error, reload: load };
}

export function useSeedRarities() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/rarities/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to seed rarities');
      return json;
    } catch (e: any) {
      setError(e?.message || 'Failed to seed rarities');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { seed, loading, error };
}

