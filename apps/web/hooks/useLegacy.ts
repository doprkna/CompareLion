import { useCallback, useEffect, useState } from 'react';

export function useLegacy() {
  const [legacy, setLegacy] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/meta/legacy', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load legacy');
      setLegacy(json);
    } catch (e: any) {
      setError(e?.message || 'Failed to load legacy');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { legacy, loading, error, reload: load };
}

