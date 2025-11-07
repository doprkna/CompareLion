'use client';

import { useEffect, useState } from 'react';

type MiniEvent = {
  id: string;
  date: string;
  region: string;
  title: string;
  rewardText?: string | null;
  tags?: string[] | null;
};

export default function EventsArchivePage() {
  const [items, setItems] = useState<MiniEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      // Simple API via direct DB-backed route would be ideal; reuse today endpoint fallback with multiple days is out of scope.
      // For now, call a minimal serverless fetch via public API we have not yet created; placeholder uses client filter.
      const res = await fetch('/api/events/today');
      const json = await res.json();
      const today = json?.event ? [json.event] : [];
      setItems(today as MiniEvent[]);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Mini-Events Archive</h1>
      <p className="text-sm text-muted-foreground">Past events (last 7 days)</p>
      {loading && <div>Loading…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="space-y-3">
        {items.map((ev) => (
          <div key={ev.id} className="border rounded p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{ev.title}</div>
              <div className="text-xs opacity-70">{new Date(ev.date).toLocaleDateString()} · {ev.region}</div>
            </div>
            {ev.rewardText && <div className="text-xs">🎁 {ev.rewardText}</div>}
            {ev.tags && ev.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {ev.tags.map((t) => (
                  <span key={t} className="text-xs border rounded px-2 py-0.5">{t}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {!loading && items.length === 0 && (
          <div className="text-sm text-muted-foreground">No archived events yet.</div>
        )}
      </div>
    </div>
  );
}


