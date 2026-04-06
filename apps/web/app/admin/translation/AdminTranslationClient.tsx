'use client';

/**
 * Admin: community translation suggestions (v0.48.06)
 */

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiBase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Row = {
  id: string;
  userId: string | null;
  userEmail: string | null;
  entityType: string;
  entityId: string;
  language: string;
  original: string;
  suggestion: string;
  status: string;
  createdAt: string;
};

export function AdminTranslationClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/translation-suggestions');
      const body = (res as any).data as { ok?: boolean; data?: { suggestions?: Row[] } } | undefined;
      const list = body?.data?.suggestions ?? [];
      setRows(Array.isArray(list) ? list : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: 'approved' | 'rejected') {
    setActing(id);
    try {
      await fetch(`/api/admin/translation-suggestions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      await load();
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return <p className="text-subtle">Loading…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-subtle text-sm">Review community-submitted translations. Approving does not auto-apply text yet.</p>
        <Button variant="outline" size="sm" onClick={() => load()}>
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card text-left text-subtle">
              <th className="p-2">entityType</th>
              <th className="p-2">entityId</th>
              <th className="p-2">language</th>
              <th className="p-2 max-w-[120px]">original</th>
              <th className="p-2 max-w-[140px]">suggestion</th>
              <th className="p-2">userId</th>
              <th className="p-2">status</th>
              <th className="p-2">actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-subtle text-center">
                  No suggestions yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60 align-top">
                  <td className="p-2 font-mono text-xs">{r.entityType}</td>
                  <td className="p-2 font-mono text-xs break-all max-w-[120px]">{r.entityId}</td>
                  <td className="p-2">{r.language}</td>
                  <td className="p-2 max-w-[120px]">
                    <div className="text-xs text-subtle line-clamp-2" title={r.original}>
                      {r.original}
                    </div>
                  </td>
                  <td className="p-2 max-w-[200px]">
                    <div className="text-xs line-clamp-2" title={r.suggestion}>
                      {r.suggestion}
                    </div>
                  </td>
                  <td className="p-2 font-mono text-[10px] break-all max-w-[100px]">{r.userId ?? '—'}</td>
                  <td className="p-2">{r.status}</td>
                  <td className="p-2 whitespace-nowrap">
                    {r.status === 'pending' ? (
                      <div className="flex gap-1 flex-wrap">
                        <Button
                          size="sm"
                          variant="default"
                          className="h-8"
                          disabled={acting === r.id}
                          onClick={() => setStatus(r.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          disabled={acting === r.id}
                          onClick={() => setStatus(r.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-subtle">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-subtle">
        <Link href="/admin" className="text-accent hover:underline">
          ← Admin dashboard
        </Link>
      </p>
    </div>
  );
}
