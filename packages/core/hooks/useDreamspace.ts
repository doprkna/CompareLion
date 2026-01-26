'use client';
// sanity-fix
import { useCallback, useEffect, useState } from 'react';

export function useDreamspace() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dreamspace/history', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load dream history');
      setHistory(json.dreams || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load dream history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { history, loading, error, reload: load };
}
