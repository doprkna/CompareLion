import { useCallback, useState } from 'react';

export function usePrestige() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prestige = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/meta/prestige', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Prestige failed');
      return json;
    } catch (e: any) {
      setError(e?.message || 'Prestige failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { prestige, loading, error };
}

