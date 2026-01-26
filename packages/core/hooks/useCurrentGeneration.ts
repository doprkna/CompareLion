'use client';
// sanity-fix
import { useCallback, useEffect, useState } from 'react';

export function useCurrentGeneration() {
  const [current, setCurrent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generation/current', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load current generation');
      setCurrent(json ?? null); // sanity-fix
    } catch (e: any) {
      setError(e?.message || 'Failed to load current generation');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { current, loading, error, reload: load };
}
