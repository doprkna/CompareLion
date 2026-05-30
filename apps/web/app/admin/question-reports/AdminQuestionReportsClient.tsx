'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiBase';
import Link from 'next/link';

type ReportRow = {
  id: string;
  flowQuestionId: string;
  sourceQuestionId: string | null;
  questionText: string | null;
  reason: string | null;
  details: string | null;
  reviewNote: string | null;
  status: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
};

type StatusFilter = 'ALL' | 'OPEN' | 'REVIEWED' | 'DISMISSED' | 'ACTIONED';

export function AdminQuestionReportsClient() {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('OPEN');
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    try {
      const qs =
        statusFilter === 'ALL' ? '' : `?status=${encodeURIComponent(statusFilter)}`;
      const res = await apiFetch<{ ok?: boolean; reports?: ReportRow[] }>(
        `/api/admin/question-reports${qs}`
      );
      setRows(Array.isArray(res.data?.reports) ? res.data.reports : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [statusFilter]);

  async function setStatus(
    id: string,
    status: 'REVIEWED' | 'DISMISSED' | 'ACTIONED'
  ) {
    setActing(id);
    try {
      await fetch(`/api/admin/question-reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status,
          reviewNote: noteDraft[id]?.trim() || undefined,
        }),
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
        <p className="text-subtle text-sm">
          Review user reports on FlowQuestions. Status changes do not delete reports or
          change QuestionStats.reportCount.
        </p>
        <div className="flex items-center gap-2">
          <label className="text-xs text-subtle" htmlFor="report-status-filter">
            Filter:
          </label>
          <select
            id="report-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="text-sm border border-border rounded px-2 py-1 bg-bg text-text"
          >
            <option value="OPEN">OPEN</option>
            <option value="ALL">All</option>
            <option value="REVIEWED">REVIEWED</option>
            <option value="DISMISSED">DISMISSED</option>
            <option value="ACTIONED">ACTIONED</option>
          </select>
          <button
            type="button"
            onClick={() => void load()}
            className="text-sm border border-border rounded px-2 py-1 hover:bg-accent/10"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-subtle text-center py-8 border border-border rounded-lg">
            No reports{statusFilter !== 'ALL' ? ` with status ${statusFilter}` : ''}.
          </p>
        ) : (
          rows.map((r) => (
            <div
              key={r.id}
              className="border border-border rounded-lg p-4 bg-card space-y-2 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-text">
                    {r.questionText ?? '(question text unavailable)'}
                  </p>
                  <p className="text-xs text-subtle mt-1">
                    status: <span className="font-mono">{r.status}</span> ·{' '}
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-xs text-subtle space-y-1">
                <p>
                  <span className="text-text">Reason:</span> {r.reason ?? '—'}
                </p>
                {r.details ? (
                  <p>
                    <span className="text-text">Details:</span> {r.details}
                  </p>
                ) : null}
                {r.reviewNote ? (
                  <p>
                    <span className="text-text">Admin note:</span> {r.reviewNote}
                  </p>
                ) : null}
                <p className="font-mono break-all">
                  flowQuestionId: {r.flowQuestionId}
                  {r.sourceQuestionId ? ` · sourceQuestionId: ${r.sourceQuestionId}` : ''}
                  {r.userId ? ` · userId: ${r.userId}` : ''}
                </p>
              </div>
              {r.status === 'OPEN' ? (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    placeholder="Optional admin note"
                    value={noteDraft[r.id] ?? ''}
                    onChange={(e) =>
                      setNoteDraft((prev) => ({ ...prev, [r.id]: e.target.value }))
                    }
                    className="w-full text-xs border border-border rounded px-2 py-1.5 bg-bg text-text"
                  />
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      disabled={acting === r.id}
                      onClick={() => void setStatus(r.id, 'REVIEWED')}
                      className="px-3 py-1.5 text-xs rounded bg-accent text-white disabled:opacity-50"
                    >
                      Review
                    </button>
                    <button
                      type="button"
                      disabled={acting === r.id}
                      onClick={() => void setStatus(r.id, 'DISMISSED')}
                      className="px-3 py-1.5 text-xs rounded border border-border hover:bg-accent/10 disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      disabled={acting === r.id}
                      onClick={() => void setStatus(r.id, 'ACTIONED')}
                      className="px-3 py-1.5 text-xs rounded border border-amber-500 text-amber-400 hover:bg-amber-500/10 disabled:opacity-50"
                    >
                      Actioned
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-subtle">
        <Link href="/admin" className="text-accent hover:underline">
          ← Admin dashboard
        </Link>
      </p>
    </div>
  );
}
