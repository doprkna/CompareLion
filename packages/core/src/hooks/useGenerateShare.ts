'use client';
// sanity-fix
import { useCallback, useState } from 'react';

export function useGenerateShare() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (type: 'weekly' | 'achievement' | 'comparison') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/share/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to generate share card');
      return json;
    } catch (e: any) {
      setError(e?.message || 'Failed to generate share card');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, loading, error };
}
