'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiBase';
import Link from 'next/link';

type RunRow = {
  id: string;
  jobType: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  triggeredBy: string | null;
  sourceName: string | null;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  errorCount: number;
  errorMessage: string | null;
};

function statusClass(status: string): string {
  if (status === 'SUCCESS') return 'text-green-400';
  if (status === 'FAILED') return 'text-red-400';
  if (status === 'PARTIAL_SUCCESS') return 'text-amber-400';
  return 'text-subtle';
}

export function AdminQuestionPipelineClient() {
  const [rows, setRows] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch<{ runs?: RunRow[] }>('/api/admin/question-pipeline-runs');
      setRows(Array.isArray(res.data?.runs) ? res.data.runs : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return <p className="text-subtle">Loading…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-subtle text-sm">Latest 20 question pipeline job runs.</p>
        <button
          type="button"
          onClick={() => void load()}
          className="text-sm border border-border rounded px-2 py-1 hover:bg-accent/10"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card text-left text-subtle">
              <th className="p-2">started</th>
              <th className="p-2">job</th>
              <th className="p-2">status</th>
              <th className="p-2">duration</th>
              <th className="p-2">counts</th>
              <th className="p-2">source</th>
              <th className="p-2">error</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-subtle text-center">
                  No pipeline runs yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60 align-top">
                  <td className="p-2 text-xs whitespace-nowrap">
                    {new Date(r.startedAt).toLocaleString()}
                  </td>
                  <td className="p-2 font-mono text-xs">{r.jobType}</td>
                  <td className={`p-2 text-xs font-medium ${statusClass(r.status)}`}>
                    {r.status}
                  </td>
                  <td className="p-2 text-xs">
                    {r.durationMs != null ? `${r.durationMs}ms` : '—'}
                  </td>
                  <td className="p-2 text-xs font-mono">
                    P:{r.recordsProcessed} +{r.recordsCreated} ~{r.recordsUpdated} skip
                    {r.recordsSkipped}
                    {r.errorCount > 0 ? ` err:${r.errorCount}` : ''}
                  </td>
                  <td className="p-2 text-xs">{r.sourceName ?? '—'}</td>
                  <td className="p-2 text-xs text-red-400 max-w-[200px] truncate" title={r.errorMessage ?? ''}>
                    {r.errorMessage ?? '—'}
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
