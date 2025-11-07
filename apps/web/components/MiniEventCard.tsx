'use client';

import { useState } from 'react';

type MiniEvent = {
  id: string;
  title: string;
  description?: string | null;
  rewardText?: string | null;
  tags?: string[] | null;
  region: string;
};

export function MiniEventCard({ event }: { event: MiniEvent }) {
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function join() {
    if (joined || loading) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/events/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, action: 'join' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to join');
      setJoined(true);
      setMsg('Challenge joined!');
    } catch (e: any) {
      setMsg(e?.message || 'Join failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <div className="text-xs opacity-70">{event.region}</div>
      </div>
      {event.description && <p className="text-sm opacity-90">{event.description}</p>}
      {event.rewardText && <div className="text-sm font-medium">🎁 {event.rewardText}</div>}
      {event.tags && event.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {event.tags.map((t) => (
            <span key={t} className="text-xs border rounded px-2 py-0.5">{t}</span>
          ))}
        </div>
      )}
      <div className="pt-2">
        <button className="border rounded px-3 py-1" onClick={join} disabled={joined || loading}>
          {joined ? 'Joined' : loading ? 'Joining…' : 'Join Challenge'}
        </button>
      </div>
      {msg && <div className="text-xs opacity-80">{msg}</div>}
    </div>
  );
}


