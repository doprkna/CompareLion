import { useCallback, useEffect, useState } from 'react';

export function useRituals() {
  const [ritual, setRitual] = useState<any | null>(null);
  const [userProgress, setUserProgress] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/rituals/today', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load ritual');
      setRitual(json.ritual);
      setUserProgress(json.userProgress);
    } catch (e: any) {
      setError(e?.message || 'Failed to load ritual');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { ritual, userProgress, loading, error, reload: load };
}

export function useCompleteRitual() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = useCallback(async (ritualId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/rituals/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ritualId }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to complete ritual');
      return json;
    } catch (e: any) {
      setError(e?.message || 'Failed to complete ritual');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { complete, loading, error };
}

