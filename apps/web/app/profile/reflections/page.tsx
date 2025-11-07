'use client';

import { useEffect, useState } from 'react';

type Reflection = { id: string; text: string; createdAt: string };

export default function ReflectionsPage() {
  const [items, setItems] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reflection?limit=5');
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to load');
      setItems(json.reflections || []);
    } catch (e: any) {
      setError(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Your Reflections</h1>
      <p className="text-sm text-muted-foreground">Last 5 reflections</p>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="space-y-3">
        {items.map((r) => (
          <div key={r.id} className="border rounded p-3">
            <div className="text-sm whitespace-pre-wrap">{r.text}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(r.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <div className="text-sm text-muted-foreground">No reflections yet.</div>
        )}
      </div>
    </div>
  );
}


