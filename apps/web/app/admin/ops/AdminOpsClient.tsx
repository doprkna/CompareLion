'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface OpsRun {
  id: string;
  type: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  counts: Record<string, number> | null;
  message: string | null;
  reportPath: string | null;
  triggeredBy: string | null;
  entityType: string | null;
  entityId: string | null;
  entityLabel: string | null;
  params?: Record<string, unknown> | null;
}

function countsSummary(c: Record<string, number> | null): string {
  if (!c || typeof c !== 'object') return '-';
  const parts: string[] = [];
  if (c.scanned != null && c.scanned > 0) parts.push(`S:${c.scanned}`);
  if (c.created != null && c.created > 0) parts.push(`+${c.created}`);
  if (c.updated != null && c.updated > 0) parts.push(`~${c.updated}`);
  if (c.skipped != null && c.skipped > 0) parts.push(`○${c.skipped}`);
  if (c.failed != null && c.failed > 0) parts.push(`✗${c.failed}`);
  if (c.warnings != null && c.warnings > 0) parts.push(`!${c.warnings}`);
  return parts.length ? parts.join(' ') : '-';
}

function StatusBadge({ status }: { status: string }) {
  const style =
    status === 'success'
      ? 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/40'
      : status === 'failed'
      ? 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/40'
      : 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40';
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

export default function AdminOpsClient() {
  const [runs, setRuns] = useState<OpsRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [userIdDraft, setUserIdDraft] = useState('');
  const [userIdQuery, setUserIdQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setUserIdQuery(userIdDraft.trim()), 400);
    return () => clearTimeout(t);
  }, [userIdDraft]);

  const filteredRuns = useMemo(() => {
    let list = runs;
    if (filterType) list = list.filter((r) => r.type === filterType);
    if (filterStatus) list = list.filter((r) => r.status === filterStatus);
    return list;
  }, [runs, filterType, filterStatus]);

  const types = useMemo(() => Array.from(new Set(runs.map((r) => r.type))).sort(), [runs]);
  const statuses = useMemo(() => Array.from(new Set(runs.map((r) => r.status))).sort(), [runs]);

  const load = useCallback(async (opts?: { quiet?: boolean }) => {
    if (!opts?.quiet) {
      setLoading(true);
    }
    setError(null);
    try {
      const url = userIdQuery
        ? `/api/admin/ops?userId=${encodeURIComponent(userIdQuery)}`
        : '/api/admin/ops';
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? 'Failed to load');
        setRuns([]);
        return;
      }
      setRuns(data?.data?.runs ?? []);
    } catch (e) {
      setError(String(e));
      setRuns([]);
    } finally {
      if (!opts?.quiet) {
        setLoading(false);
      }
    }
  }, [userIdQuery]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => {
      void load({ quiet: true });
    }, 8000);
    return () => clearInterval(t);
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg p-6 flex items-center justify-center">
        <p className="text-subtle text-lg">Loading ops runs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-text">Ops Runs</h1>
        <p className="text-subtle text-sm">
          Question gen, Wiki enrich, seed, API errors, and user flow traces (latest 50; refreshes every 8s).
          Optional User ID filter: server-side match on JSON params.userId (debounced); list is still capped at 50 matching rows.
        </p>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive">
            {error}
            <Button onClick={() => void load()} variant="outline" size="sm" className="ml-2">Retry</Button>
          </div>
        )}

        <Button asChild variant="outline" size="sm">
          <Link href="/admin">Back to Admin</Link>
        </Button>

        <div className="flex flex-wrap gap-4 items-center">
          <label className="text-sm text-subtle">
            User ID
            <input
              type="text"
              value={userIdDraft}
              onChange={(e) => setUserIdDraft(e.target.value)}
              placeholder="params.userId"
              className="ml-2 rounded border border-border bg-card px-2 py-1 text-text w-48 font-mono text-xs"
            />
          </label>
          <label className="text-sm text-subtle">
            Type
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="ml-2 rounded border border-border bg-card px-2 py-1 text-text"
            >
              <option value="">All</option>
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-subtle">
            Status
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="ml-2 rounded border border-border bg-card px-2 py-1 text-text"
            >
              <option value="">All</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="bg-card border-2 border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg/50">
                <th className="text-left p-3 font-medium text-text">Started</th>
                <th className="text-left p-3 font-medium text-text">Type</th>
                <th className="text-left p-3 font-medium text-text">Status</th>
                <th className="text-left p-3 font-medium text-text">Duration</th>
                <th className="text-left p-3 font-medium text-text">Counts</th>
                <th className="text-left p-3 font-medium text-text">Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-subtle text-center">
                    {runs.length === 0 ? 'No ops runs yet' : 'No runs match filters'}
                  </td>
                </tr>
              ) : (
                filteredRuns.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border hover:bg-accent/5 transition"
                  >
                    <td className="p-3">
                      <Link href={`/admin/ops/${r.id}`} className="text-accent hover:underline">
                        {new Date(r.startedAt).toLocaleString()}
                      </Link>
                      {r.entityLabel && (
                        <div className="text-xs text-subtle mt-0.5 truncate max-w-[180px]" title={r.entityLabel}>
                          {r.entityLabel}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-text">{r.type}</td>
                    <td className="p-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="p-3 text-subtle">
                      {r.durationMs != null ? `${r.durationMs}ms` : '-'}
                    </td>
                    <td className="p-3 font-mono text-xs">
                      {countsSummary(r.counts)}
                    </td>
                    <td className="p-3 text-subtle max-w-xs truncate" title={r.message ?? undefined}>
                      {r.message ?? '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
