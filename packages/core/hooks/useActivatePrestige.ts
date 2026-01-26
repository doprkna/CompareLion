'use client';
// sanity-fix
import { useCallback, useState } from 'react';

export function useActivatePrestige() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/prestige/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to activate prestige');
      return json;
    } catch (e: any) {
      setError(e?.message || 'Failed to activate prestige');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { activate, loading, error };
}

