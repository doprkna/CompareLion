import { useCallback, useEffect, useState } from 'react';

export function useSeason() {
  const [season, setSeason] = useState<any | null>(null);
  const [userProgress, setUserProgress] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/meta/season', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load season');
      setSeason(json.season);
      setUserProgress(json.userProgress);
    } catch (e: any) {
      setError(e?.message || 'Failed to load season');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { season, userProgress, loading, error, reload: load };
}

