'use client';
// sanity-fix
import { useCallback, useEffect, useState } from 'react';

export function usePrestigeHistory() {
  const [history, setHistory] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/prestige/history', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load prestige history');
      setHistory(json);
    } catch (e: any) {
      setError(e?.message || 'Failed to load prestige history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { history, loading, error, reload: load };
}
