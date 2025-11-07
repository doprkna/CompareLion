import { useCallback, useEffect, useState } from 'react';

export function useDuetRun() {
  const [duetRun, setDuetRun] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/duet-runs/active', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load duet run');
      setDuetRun(json.active ? json.duetRun : null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load duet run');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Polling for updates (every 5 seconds)
  useEffect(() => {
    if (!duetRun) return;
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [duetRun, load]);

  return { duetRun, loading, error, reload: load };
}

export function useStartDuetRun() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async (missionKey: string, partnerId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/duet-runs/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionKey, partnerId }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to start duet run');
      return json;
    } catch (e: any) {
      setError(e?.message || 'Failed to start duet run');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { start, loading, error };
}

export function useDuetProgress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProgress = useCallback(async (duetRunId: string, progress: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/duet-runs/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duetRunId, progress }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to update progress');
      return json;
    } catch (e: any) {
      setError(e?.message || 'Failed to update progress');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const complete = useCallback(async (duetRunId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/duet-runs/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duetRunId }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to complete duet run');
      return json;
    } catch (e: any) {
      setError(e?.message || 'Failed to complete duet run');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateProgress, complete, loading, error };
}

