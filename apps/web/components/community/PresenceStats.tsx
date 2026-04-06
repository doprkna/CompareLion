'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/apiBase';

interface PresenceData {
  onlineNow: number;
  active48h: number;
  active7d: number;
  source: string;
  timestamp: string;
}

const POLL_MS = 60_000;

export function PresenceStats() {
  const [data, setData] = useState<PresenceData | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiFetch('/api/presence/stats');
      if (res.ok && res.data?.success && res.data?.data) {
        setData(res.data.data);
      }
    } catch {
      setData(null);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, POLL_MS);
    return () => clearInterval(id);
  }, [fetchStats]);

  useEffect(() => {
    const onFocus = () => fetchStats();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchStats]);

  if (!data) return null;

  return (
    <div className="flex items-center gap-4 text-sm text-subtle">
      <span>Online now: {data.onlineNow}</span>
      <span>Active 48h: {data.active48h}</span>
      <span>Active 7d: {data.active7d}</span>
    </div>
  );
}
