'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { apiFetch } from '@/lib/apiBase';
import Link from 'next/link';
import { QuestionPipelineFoundationPanel } from '@/components/admin/QuestionPipelineFoundationPanel';
import { AdminNeedsAttentionPanel } from '@/components/admin/AdminAttention';

function AdminCard({
  title,
  children,
  className = '',
  borderAccent = false,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  borderAccent?: boolean;
}) {
  return (
    <div
      className={`bg-card border-2 rounded-xl p-4 h-fit ${borderAccent ? 'border-accent' : 'border-border'} ${className}`}
    >
      <h2 className="text-base font-bold text-text mb-3">{title}</h2>
      {children}
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [seedRunning, setSeedRunning] = useState(false);
  const [seedStatus, setSeedStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [seedStatusMessage, setSeedStatusMessage] = useState('');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [visitStats, setVisitStats] = useState<{
    totalVisits: number;
    visitsToday: number;
    uniqueUsersToday: number;
    activeUsers24h: number;
    activeLoggedUsers24h: number;
    anonymousVisits24h: number;
    activeUsers7d: number;
    activeLoggedUsers7d: number;
    anonymousUsers7d: number;
    returningUsers7d: number;
    returningUsersPct7d: number;
  } | null>(null);

  type QuestionPipelineStatus = {
    totalQuestions: number;
    byLifecycle: Record<string, number>;
    bySourceName: { sourceName: string; count: number }[];
    publishedQuestions: number;
    activeFlowQuestions: number;
    linkedFlowQuestions: number;
    publishedWithoutProjection: number;
    flowQuestionsZeroOptions: number;
    flowQuestionsMissingCategory: number;
    highSensitivityUnpublished: number;
    openQuestionReports: number;
    lastFailedPipelineRun: {
      id: string;
      jobType: string;
      completedAt: string;
      errorMessage: string | null;
      sourceName: string | null;
    } | null;
    warnings: string[];
  };

  const [pipelineStatus, setPipelineStatus] = useState<QuestionPipelineStatus | null>(null);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [pipelineSyncRunning, setPipelineSyncRunning] = useState(false);
  const [pipelineActionMessage, setPipelineActionMessage] = useState('');
  const [archiveQuestionId, setArchiveQuestionId] = useState('');
  const [archiveRunning, setArchiveRunning] = useState(false);

  async function loadQuestionPipeline() {
    setPipelineLoading(true);
    try {
      const wrap = await apiFetch<{ success?: boolean; status?: QuestionPipelineStatus }>(
        '/api/admin/questions'
      );
      if (wrap.ok && wrap.data?.status) {
        setPipelineStatus(wrap.data.status);
      }
    } catch (err) {
      console.error('Failed to load question pipeline status:', err);
    } finally {
      setPipelineLoading(false);
    }
  }

  async function syncPublishedQuestions() {
    if (pipelineSyncRunning) return;
    setPipelineSyncRunning(true);
    setPipelineActionMessage('Syncing published Questions → FlowQuestion…');
    setLogs((l) => ['⏳ Question sync: Started', ...l].slice(0, 50));

    try {
      const wrap = await apiFetch<{
        success?: boolean;
        error?: string;
        sync?: { flowUpserted?: number; flowSkipped?: number; flowDeactivated?: number };
        status?: QuestionPipelineStatus;
      }>('/api/admin/questions', {
        method: 'POST',
        body: JSON.stringify({ action: 'sync' }),
      });
      const data = wrap.data;
      const errText = (wrap.error || data?.error || '').trim();

      if (wrap.ok && data?.success !== false) {
        if (data?.status) setPipelineStatus(data.status);
        const upserted = data?.sync?.flowUpserted ?? 0;
        const skipped = data?.sync?.flowSkipped ?? 0;
        setPipelineActionMessage(`Sync OK — upserted ${upserted}, skipped ${skipped}`);
        setLogs((l) => [`✅ Question sync: upserted ${upserted}, skipped ${skipped}`, ...l].slice(0, 50));
      } else {
        setPipelineActionMessage(`Sync failed: ${errText || 'Unknown error'}`);
        setLogs((l) => [`❌ Question sync: ${errText || 'Failed'}`, ...l].slice(0, 50));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setPipelineActionMessage(`Sync failed: ${msg}`);
      setLogs((l) => [`❌ Question sync: ${msg}`, ...l].slice(0, 50));
    } finally {
      setPipelineSyncRunning(false);
    }
  }

  async function archiveQuestionById() {
    const id = archiveQuestionId.trim();
    if (!id || archiveRunning) return;
    setArchiveRunning(true);
    setPipelineActionMessage(`Archiving question ${id}…`);

    try {
      const wrap = await apiFetch<{
        success?: boolean;
        error?: string;
        archive?: { archived?: number; flowDeactivated?: number };
        status?: QuestionPipelineStatus;
      }>('/api/admin/questions', {
        method: 'POST',
        body: JSON.stringify({ action: 'archive', questionId: id }),
      });
      const data = wrap.data;
      const errText = (wrap.error || data?.error || '').trim();

      if (wrap.ok && data?.success !== false) {
        if (data?.status) setPipelineStatus(data.status);
        const archived = data?.archive?.archived ?? 0;
        const deactivated = data?.archive?.flowDeactivated ?? 0;
        setPipelineActionMessage(`Archive OK — archived ${archived}, flow deactivated ${deactivated}`);
        setLogs((l) => [`✅ Question archive: ${id}`, ...l].slice(0, 50));
        setArchiveQuestionId('');
      } else {
        setPipelineActionMessage(`Archive failed: ${errText || 'Unknown error'}`);
        setLogs((l) => [`❌ Question archive: ${errText || 'Failed'}`, ...l].slice(0, 50));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setPipelineActionMessage(`Archive failed: ${msg}`);
    } finally {
      setArchiveRunning(false);
    }
  }

  async function trigger(path: string, label: string) {
    setLoading(true);
    try {
      const wrap = await apiFetch(`/api/admin/${path}`, { method: 'POST' });
      const data = wrap.data as { success?: boolean; error?: string } | undefined;
      const errText = (wrap.error || data?.error || '').trim();
      const truncated =
        errText.length > 280 ? `${errText.slice(0, 280)}…` : errText;

      let line: string;
      if (!wrap.ok) {
        line = `❌ ${label}: Fail — ${truncated || 'HTTP error'}`;
      } else if (data?.success === false) {
        line = `❌ ${label}: Fail — ${truncated || 'Unknown error'}`;
      } else {
        line = `✅ ${label}: OK`;
      }
      setLogs((l) => [line, ...l].slice(0, 50));

      if (wrap.ok && data?.success !== false) {
        await loadAuditLogs();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLogs((l) => [`❌ ${label}: Error — ${msg}`, ...l].slice(0, 50));
    } finally {
      setLoading(false);
    }
  }

  async function runFullSeed() {
    if (seedRunning) return;
    setSeedRunning(true);
    setSeedStatus('running');
    setSeedStatusMessage('Full seed is running. This may take a moment.');
    setLogs((l) => [`⏳ Run Seeder 2.0: Started`, ...l].slice(0, 50));

    try {
      const wrap = await apiFetch('/api/admin/seed-db', { method: 'POST' });
      const data = wrap.data as { success?: boolean; error?: string; message?: string } | undefined;
      const errText = (wrap.error || data?.error || '').trim();
      const safeErr = errText.length > 200 ? `${errText.slice(0, 200)}…` : errText;

      const success = wrap.ok && data?.success !== false;
      if (success) {
        setSeedStatus('success');
        setSeedStatusMessage('Seed completed. Refreshing data…');
        setLogs((l) => [`✅ Run Seeder 2.0: Completed`, ...l].slice(0, 50));
        await Promise.all([loadAuditLogs(), loadVisitStats()]);
      } else {
        setSeedStatus('error');
        setSeedStatusMessage(`Seed failed: ${safeErr || 'Unknown error'}`);
        setLogs((l) => [`❌ Run Seeder 2.0: Failed — ${safeErr || 'Unknown error'}`, ...l].slice(0, 50));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const safeErr = msg.length > 200 ? `${msg.slice(0, 200)}…` : msg;
      setSeedStatus('error');
      setSeedStatusMessage(`Seed failed: ${safeErr || 'Network error'}`);
      setLogs((l) => [`❌ Run Seeder 2.0: Error — ${safeErr || 'Network error'}`, ...l].slice(0, 50));
    } finally {
      setSeedRunning(false);
    }
  }

  async function loadAuditLogs() {
    try {
      const res = await apiFetch('/api/audit');
      if ((res as any).ok && (res as any).data) {
        setAuditLogs((res as any).data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  }

  async function loadVisitStats() {
    try {
      const res = await apiFetch('/api/admin/visits');
      if ((res as any).ok && (res as any).data) {
        const d = (res as any).data;
        setVisitStats({
          totalVisits: d.totalVisits ?? 0,
          visitsToday: d.visitsToday ?? 0,
          uniqueUsersToday: d.uniqueUsersToday ?? 0,
          activeUsers24h: d.activeUsers24h ?? 0,
          activeLoggedUsers24h: d.activeLoggedUsers24h ?? 0,
          anonymousVisits24h: d.anonymousVisits24h ?? 0,
          activeUsers7d: d.activeUsers7d ?? 0,
          activeLoggedUsers7d: d.activeLoggedUsers7d ?? 0,
          anonymousUsers7d: d.anonymousUsers7d ?? 0,
          returningUsers7d: d.returningUsers7d ?? 0,
          returningUsersPct7d: d.returningUsersPct7d ?? 0,
        });
      } else {
        setVisitStats(emptyVisitStats());
      }
    } catch {
      setVisitStats(emptyVisitStats());
    }
  }

  useEffect(() => {
    loadAuditLogs();
  }, []);

  useEffect(() => {
    void loadVisitStats();
    void loadQuestionPipeline();
  }, []);

  const btnPrimary =
    'w-full bg-accent text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition disabled:opacity-50 text-sm';
  const btnOutline =
    'w-full bg-card border-2 border-accent text-accent px-3 py-1.5 rounded-lg hover:bg-accent/10 transition disabled:opacity-50 text-sm';
  const btnDanger =
    'w-full bg-card border-2 border-destructive text-destructive px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition disabled:opacity-50 text-sm';
  const linkBtn =
    'block w-full bg-card border-2 border-accent text-accent px-3 py-1.5 rounded-lg hover:bg-accent/10 transition text-center text-sm';

  return (
    <div className="min-h-screen bg-bg p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <header className="mb-2">
          <h1 className="text-2xl font-bold text-text">Admin Dashboard</h1>
          <p className="text-subtle text-sm">Manage users, data, and system operations</p>
        </header>

        {/* A — Needs attention */}
        <AdminNeedsAttentionPanel />

        {/* B — Compact stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <AdminCard title="📊 App Visits">
            {visitStats ? (
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-text">
                <div>
                  <dt className="text-subtle">Total</dt>
                  <dd className="font-mono font-semibold">{visitStats.totalVisits}</dd>
                </div>
                <div>
                  <dt className="text-subtle">Today (UTC)</dt>
                  <dd className="font-mono font-semibold">{visitStats.visitsToday}</dd>
                </div>
                <div>
                  <dt className="text-subtle">Unique today</dt>
                  <dd className="font-mono font-semibold">{visitStats.uniqueUsersToday}</dd>
                </div>
                <div>
                  <dt className="text-subtle">Active 24h</dt>
                  <dd className="font-mono font-semibold text-accent">{visitStats.activeUsers24h}</dd>
                </div>
                <div>
                  <dt className="text-subtle">Logged 24h</dt>
                  <dd className="font-mono font-semibold">{visitStats.activeLoggedUsers24h}</dd>
                </div>
                <div>
                  <dt className="text-subtle">Anon 24h</dt>
                  <dd className="font-mono font-semibold">{visitStats.anonymousVisits24h}</dd>
                </div>
                <div>
                  <dt className="text-subtle">Active 7d</dt>
                  <dd className="font-mono font-semibold text-accent">{visitStats.activeUsers7d}</dd>
                </div>
                <div>
                  <dt className="text-subtle">Returning 7d</dt>
                  <dd className="font-mono font-semibold">
                    {visitStats.returningUsers7d} ({visitStats.returningUsersPct7d}%)
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-subtle text-xs">Loading…</p>
            )}
            <p className="text-subtle text-[11px] mt-2 leading-snug">
              Session counter; rolling 24h/7d windows. Not full analytics.
            </p>
          </AdminCard>

          <AdminCard title="👥 Users">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => trigger('generate-users', 'Generate Demo Users')}
                disabled={loading}
                className={btnPrimary}
              >
                Generate Demo Users
              </button>
              <button
                type="button"
                onClick={() => trigger('wipe-users', 'Wipe Users')}
                disabled={loading}
                className={btnDanger}
              >
                Wipe Users
              </button>
            </div>
          </AdminCard>

          <AdminCard title="💬 Messages">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => trigger('generate-messages', 'Generate Demo Messages')}
                disabled={loading}
                className={btnPrimary}
              >
                Generate Messages
              </button>
              <button
                type="button"
                onClick={() => trigger('wipe-messages', 'Wipe Messages')}
                disabled={loading}
                className={btnDanger}
              >
                Wipe Messages
              </button>
            </div>
          </AdminCard>
        </div>

        {/* C — Operational row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <AdminCard title="🌱 Seeder 2.0" borderAccent>
            <div className="space-y-2">
              <button
                type="button"
                onClick={runFullSeed}
                disabled={loading || seedRunning}
                className={`${btnPrimary} font-semibold`}
              >
                {seedRunning ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
                    Seeding…
                  </span>
                ) : (
                  'Run Full Seed'
                )}
              </button>
              <p className="text-subtle text-[11px] leading-snug">
                Demo users, messages, questions, and badges in one run.
              </p>
              {seedStatus !== 'idle' ? (
                <p
                  className={`text-xs ${
                    seedStatus === 'running'
                      ? 'text-subtle'
                      : seedStatus === 'success'
                        ? 'text-green-400'
                        : 'text-destructive'
                  }`}
                >
                  {seedStatusMessage}
                </p>
              ) : (
                <p className="text-subtle text-xs">Ready</p>
              )}
            </div>
          </AdminCard>

          <AdminCard title="⚙️ Ops Runs">
            <Link href="/admin/ops" className={linkBtn}>
              View bot runs (QuestionGen, Wiki enrich)
            </Link>
          </AdminCard>

          <AdminCard title="📋 Audit Logs">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowAuditLogs(!showAuditLogs);
                  if (!showAuditLogs) loadAuditLogs();
                }}
                className={btnOutline}
              >
                {showAuditLogs ? 'Hide Logs' : 'View Audit Logs'}
              </button>
              <p className="text-subtle text-xs">{auditLogs.length} system events recorded</p>
            </div>
          </AdminCard>
        </div>

        {showAuditLogs ? (
          <div className="bg-card border-2 border-accent rounded-xl p-4">
            <h2 className="text-base font-bold text-text mb-3">System audit logs</h2>
            <div className="bg-bg border border-border rounded-lg p-3 max-h-72 overflow-y-auto space-y-2">
              {auditLogs.length === 0 ? (
                <p className="text-subtle text-xs">No audit logs yet…</p>
              ) : (
                auditLogs.map((log, i) => (
                  <div key={log.id || i} className="text-xs border-b border-border pb-2 last:border-b-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-bold text-accent">{log.action}</span>
                      <span className="text-subtle shrink-0">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {log.user ? (
                      <div className="text-subtle">
                        By: {log.user.name || log.user.email}
                      </div>
                    ) : null}
                    {log.meta ? (
                      <pre className="bg-bg/50 rounded p-1.5 font-mono text-[10px] text-text mt-1 overflow-x-auto">
                        {JSON.stringify(log.meta, null, 2)}
                      </pre>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}

        {/* D — Question Pipeline (full width, two columns) */}
        <div className="bg-card border-2 border-border rounded-xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-base font-bold text-text">❓ Question Pipeline</h2>
            <Link href="/admin/question-pipeline" className="text-xs text-accent hover:underline">
              Full panel →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            {/* Summary */}
            <div className="space-y-3 min-w-0">
              <h3 className="text-sm font-semibold text-text">Summary</h3>
              <QuestionPipelineFoundationPanel compact showNavLinks={false} />

              <section className="border border-border rounded-lg p-3 bg-bg/50 text-xs space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-text">Live pipeline counts</span>
                  <button
                    type="button"
                    onClick={() => void loadQuestionPipeline()}
                    disabled={pipelineLoading || pipelineSyncRunning}
                    className="text-accent hover:underline disabled:opacity-50"
                  >
                    {pipelineLoading ? 'Refreshing…' : 'Refresh'}
                  </button>
                </div>
                {pipelineStatus ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 text-subtle">
                      <span>Total: {pipelineStatus.totalQuestions}</span>
                      <span>Published: {pipelineStatus.publishedQuestions}</span>
                      <span>Active FlowQ: {pipelineStatus.activeFlowQuestions}</span>
                      <span>Linked: {pipelineStatus.linkedFlowQuestions}</span>
                      <span>No projection: {pipelineStatus.publishedWithoutProjection}</span>
                      <span>Zero opts: {pipelineStatus.flowQuestionsZeroOptions}</span>
                      <span>No category: {pipelineStatus.flowQuestionsMissingCategory}</span>
                      <span>High sens.: {pipelineStatus.highSensitivityUnpublished}</span>
                      <span>Open reports: {pipelineStatus.openQuestionReports}</span>
                    </div>
                    <p className="text-subtle">
                      Lifecycle:{' '}
                      {Object.entries(pipelineStatus.byLifecycle)
                        .map(([k, v]) => `${k}=${v}`)
                        .join(', ') || 'none'}
                    </p>
                    {pipelineStatus.bySourceName.length > 0 ? (
                      <p className="text-subtle">
                        Sources:{' '}
                        {pipelineStatus.bySourceName
                          .slice(0, 5)
                          .map((s) => `${s.sourceName}(${s.count})`)
                          .join(', ')}
                      </p>
                    ) : null}
                    {pipelineStatus.warnings.length > 0 ? (
                      <ul className="text-amber-400 list-disc pl-4 space-y-0.5 max-h-24 overflow-y-auto">
                        {pipelineStatus.warnings.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-green-400">No pipeline warnings</p>
                    )}
                  </>
                ) : (
                  <p className="text-subtle">
                    {pipelineLoading ? 'Loading…' : 'Pipeline status unavailable'}
                  </p>
                )}
              </section>
            </div>

            {/* Actions */}
            <div className="space-y-3 min-w-0">
              <h3 className="text-sm font-semibold text-text">Actions</h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => void syncPublishedQuestions()}
                  disabled={loading || pipelineSyncRunning}
                  className={btnOutline}
                >
                  {pipelineSyncRunning ? 'Syncing…' : 'Sync Published Questions'}
                </button>
                {pipelineActionMessage ? (
                  <p className="text-xs text-subtle">{pipelineActionMessage}</p>
                ) : null}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={archiveQuestionId}
                    onChange={(e) => setArchiveQuestionId(e.target.value)}
                    placeholder="Question ID to archive"
                    className="flex-1 min-w-0 px-2 py-1.5 text-xs border border-border rounded bg-bg text-text"
                  />
                  <button
                    type="button"
                    onClick={() => void archiveQuestionById()}
                    disabled={loading || archiveRunning || !archiveQuestionId.trim()}
                    className="shrink-0 px-2 py-1.5 text-xs border border-destructive text-destructive rounded hover:bg-destructive/10 disabled:opacity-50"
                  >
                    {archiveRunning ? '…' : 'Archive'}
                  </button>
                </div>
                <p className="text-[11px] text-subtle leading-snug">
                  CLI: pnpm db:questions:import · publish · archive ·{' '}
                  <code className="font-mono">pnpm validate:questions</code>
                </p>
              </div>

              <div className="space-y-2 pt-1 border-t border-border">
                <Link href="/admin/question-pipeline" className={linkBtn}>
                  Question Pipeline hub
                </Link>
                <Link
                  href="/admin/question-reports"
                  className="block w-full bg-card border-2 border-amber-500/60 text-amber-400 px-3 py-1.5 rounded-lg hover:bg-amber-500/10 transition text-center text-sm"
                >
                  Review Question Reports
                  {pipelineStatus && pipelineStatus.openQuestionReports > 0
                    ? ` (${pipelineStatus.openQuestionReports} open)`
                    : ''}
                </Link>
                <Link href="/admin/questions" className={linkBtn}>
                  Manage Tags
                </Link>
                <Link
                  href="/admin/translation"
                  className="block w-full bg-card border-2 border-border text-text px-3 py-1.5 rounded-lg hover:bg-accent/10 transition text-center text-sm"
                >
                  Translation suggestions
                </Link>
                <button
                  type="button"
                  onClick={() => trigger('generate-questions', 'Generate Questions')}
                  disabled={loading}
                  className={btnPrimary}
                >
                  Generate Questions
                </button>
                <button
                  type="button"
                  onClick={() => trigger('wipe-questions', 'Wipe Questions')}
                  disabled={loading}
                  className={btnDanger}
                >
                  Wipe Questions
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* E — Action log */}
        <AdminCard title="📋 Action Log" className="w-full">
          <div className="bg-bg border border-border rounded-lg p-3 max-h-48 overflow-y-auto space-y-0.5">
            {logs.length === 0 ? (
              <p className="text-subtle text-xs">No actions yet…</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-xs text-text font-mono leading-relaxed">
                  {log}
                </div>
              ))
            )}
          </div>
        </AdminCard>

        <p className="text-subtle text-xs text-center py-1">
          Admin-only — regular users cannot access this page
        </p>
      </div>
    </div>
  );
}

function emptyVisitStats() {
  return {
    totalVisits: 0,
    visitsToday: 0,
    uniqueUsersToday: 0,
    activeUsers24h: 0,
    activeLoggedUsers24h: 0,
    anonymousVisits24h: 0,
    activeUsers7d: 0,
    activeLoggedUsers7d: 0,
    anonymousUsers7d: 0,
    returningUsers7d: 0,
    returningUsersPct7d: 0,
  };
}
