'use client';

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiBase";
import Link from "next/link";
import { QuestionPipelineFoundationPanel } from "@/components/admin/QuestionPipelineFoundationPanel";
import { AdminNeedsAttentionPanel } from "@/components/admin/AdminAttention";

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
      const wrap = await apiFetch(`/api/admin/${path}`, { method: "POST" });
      const data = wrap.data as { success?: boolean; error?: string } | undefined;
      const errText = (wrap.error || data?.error || "").trim();
      const truncated =
        errText.length > 280 ? `${errText.slice(0, 280)}…` : errText;

      let line: string;
      if (!wrap.ok) {
        line = `❌ ${label}: Fail — ${truncated || "HTTP error"}`;
      } else if (data?.success === false) {
        line = `❌ ${label}: Fail — ${truncated || "Unknown error"}`;
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
      const res = await apiFetch("/api/audit");
      if ((res as any).ok && (res as any).data) {
        setAuditLogs((res as any).data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    }
  }

  async function loadVisitStats() {
    try {
      const res = await apiFetch("/api/admin/visits");
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
        setVisitStats({
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
        });
      }
    } catch {
      setVisitStats({
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
      });
    }
  }

  useEffect(() => {
    loadAuditLogs();
  }, []);

  useEffect(() => {
    void loadVisitStats();
    void loadQuestionPipeline();
  }, []);

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text mb-2">Admin Dashboard 🔧</h1>
          <p className="text-subtle">
            Manage users, data, and system operations
          </p>
        </div>

        <AdminNeedsAttentionPanel />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* App visits (internal counter) */}
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-text mb-4">📊 App Visits</h2>
            {visitStats ? (
              <ul className="space-y-2 text-sm text-text">
                <li>
                  <span className="text-subtle">Total visits:</span>{' '}
                  <span className="font-mono font-semibold">{visitStats.totalVisits}</span>
                </li>
                <li>
                  <span className="text-subtle">Today (UTC):</span>{' '}
                  <span className="font-mono font-semibold">{visitStats.visitsToday}</span>
                </li>
                <li>
                  <span className="text-subtle">Unique users today:</span>{' '}
                  <span className="font-mono font-semibold">{visitStats.uniqueUsersToday}</span>
                </li>
                <li className="pt-2 border-t border-border mt-2">
                  <span className="text-subtle">Active users (24h):</span>{' '}
                  <span className="font-mono font-semibold text-accent">{visitStats.activeUsers24h}</span>
                  <span className="block text-[11px] text-subtle mt-0.5">visit rows in rolling 24h window</span>
                </li>
                <li>
                  <span className="text-subtle">Logged users (24h):</span>{' '}
                  <span className="font-mono font-semibold">{visitStats.activeLoggedUsers24h}</span>
                  <span className="block text-[11px] text-subtle mt-0.5">distinct userIds</span>
                </li>
                <li>
                  <span className="text-subtle">Anonymous (24h):</span>{' '}
                  <span className="font-mono font-semibold">{visitStats.anonymousVisits24h}</span>
                  <span className="block text-[11px] text-subtle mt-0.5">sessions without login</span>
                </li>
                <li className="pt-2 border-t border-border mt-2">
                  <span className="text-subtle">Active users (7d):</span>{' '}
                  <span className="font-mono font-semibold text-accent">{visitStats.activeUsers7d}</span>
                  <span className="block text-[11px] text-subtle mt-0.5">visit rows in rolling 7d window</span>
                </li>
                <li>
                  <span className="text-subtle">Logged users (7d):</span>{' '}
                  <span className="font-mono font-semibold">{visitStats.activeLoggedUsers7d}</span>
                  <span className="block text-[11px] text-subtle mt-0.5">distinct userIds</span>
                </li>
                <li>
                  <span className="text-subtle">Anonymous (7d):</span>{' '}
                  <span className="font-mono font-semibold">{visitStats.anonymousUsers7d}</span>
                  <span className="block text-[11px] text-subtle mt-0.5">sessions without login</span>
                </li>
                <li className="pt-2 border-t border-border mt-2">
                  <span className="text-subtle">Returning users (7d):</span>{' '}
                  <span className="font-mono font-semibold text-accent">{visitStats.returningUsers7d}</span>
                  <span className="block text-[11px] text-subtle mt-0.5">logged-in users with &gt;1 visit in window</span>
                </li>
                <li>
                  <span className="text-subtle">Returning % (7d):</span>{' '}
                  <span className="font-mono font-semibold">{visitStats.returningUsersPct7d}%</span>
                  <span className="block text-[11px] text-subtle mt-0.5">of logged users (7d); 0% if none</span>
                </li>
              </ul>
            ) : (
              <p className="text-subtle text-sm">Loading…</p>
            )}
            <p className="text-subtle text-xs mt-3">One log per browser session; 24h/7d = rolling windows. Not full analytics.</p>
          </div>

          {/* Users Card */}
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-text mb-4">👥 Users</h2>
            <div className="space-y-2">
              <button
                onClick={() => trigger("generate-users", "Generate Demo Users")}
                disabled={loading}
                className="w-full bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                Generate Demo Users
              </button>
              <button
                onClick={() => trigger("wipe-users", "Wipe Users")}
                disabled={loading}
                className="w-full bg-card border-2 border-destructive text-destructive px-4 py-2 rounded-lg hover:bg-destructive/10 transition disabled:opacity-50"
              >
                Wipe Users
              </button>
            </div>
          </div>

          {/* Messages Card */}
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-text mb-4">💬 Messages</h2>
            <div className="space-y-2">
              <button
                onClick={() => trigger("generate-messages", "Generate Demo Messages")}
                disabled={loading}
                className="w-full bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                Generate Messages
              </button>
              <button
                onClick={() => trigger("wipe-messages", "Wipe Messages")}
                disabled={loading}
                className="w-full bg-card border-2 border-destructive text-destructive px-4 py-2 rounded-lg hover:bg-destructive/10 transition disabled:opacity-50"
              >
                Wipe Messages
              </button>
            </div>
          </div>

          {/* Questions Card */}
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-text mb-4">❓ Questions / Flows</h2>

            <div className="mb-4">
              <QuestionPipelineFoundationPanel compact showNavLinks={false} />
            </div>

            <div className="mb-4 p-3 border border-border rounded-lg bg-bg/50 text-sm space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-text">Live pipeline counts</span>
                <Link
                  href="/admin/question-pipeline"
                  className="text-xs text-accent hover:underline"
                >
                  Full panel →
                </Link>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-subtle">Counts &amp; warnings</span>
                <button
                  type="button"
                  onClick={() => void loadQuestionPipeline()}
                  disabled={pipelineLoading || pipelineSyncRunning}
                  className="text-xs text-accent hover:underline disabled:opacity-50"
                >
                  {pipelineLoading ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>
              {pipelineStatus ? (
                <>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-subtle">
                    <span>Questions total: {pipelineStatus.totalQuestions}</span>
                    <span>Published: {pipelineStatus.publishedQuestions}</span>
                    <span>Active FlowQ: {pipelineStatus.activeFlowQuestions}</span>
                    <span>Linked FlowQ: {pipelineStatus.linkedFlowQuestions}</span>
                    <span>No projection: {pipelineStatus.publishedWithoutProjection}</span>
                    <span>Zero options: {pipelineStatus.flowQuestionsZeroOptions}</span>
                    <span>Missing category: {pipelineStatus.flowQuestionsMissingCategory}</span>
                    <span>High sens. (unpub.): {pipelineStatus.highSensitivityUnpublished}</span>
                    <span>Open reports: {pipelineStatus.openQuestionReports}</span>
                  </div>
                  <div className="text-xs text-subtle">
                    Lifecycle:{' '}
                    {Object.entries(pipelineStatus.byLifecycle)
                      .map(([k, v]) => `${k}=${v}`)
                      .join(', ') || 'none'}
                  </div>
                  {pipelineStatus.bySourceName.length > 0 ? (
                    <div className="text-xs text-subtle">
                      Sources:{' '}
                      {pipelineStatus.bySourceName
                        .slice(0, 5)
                        .map((s) => `${s.sourceName}(${s.count})`)
                        .join(', ')}
                    </div>
                  ) : null}
                  {pipelineStatus.warnings.length > 0 ? (
                    <ul className="text-xs text-amber-400 list-disc pl-4 space-y-0.5">
                      {pipelineStatus.warnings.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-green-400">No pipeline warnings</p>
                  )}
                </>
              ) : (
                <p className="text-xs text-subtle">
                  {pipelineLoading ? 'Loading pipeline status…' : 'Pipeline status unavailable'}
                </p>
              )}
              <button
                type="button"
                onClick={() => void syncPublishedQuestions()}
                disabled={loading || pipelineSyncRunning}
                className="w-full bg-card border-2 border-accent text-accent px-3 py-2 rounded-lg hover:bg-accent/10 transition disabled:opacity-50 text-sm"
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
              <p className="text-[11px] text-subtle">
                CLI: pnpm db:questions:import · publish · archive
              </p>
              <p className="text-[11px] text-subtle">
                Local validation gate: <code className="font-mono">pnpm validate:questions</code>
              </p>
            </div>

            <div className="space-y-2">
              <Link
                href="/admin/question-pipeline"
                className="block w-full bg-card border-2 border-accent text-accent px-4 py-2 rounded-lg hover:bg-accent/10 transition text-center text-sm font-medium"
              >
                Question Pipeline hub
              </Link>
              <Link
                href="/admin/question-reports"
                className="block w-full bg-card border-2 border-amber-500/60 text-amber-400 px-4 py-2 rounded-lg hover:bg-amber-500/10 transition text-center text-sm"
              >
                Review Question Reports
                {pipelineStatus && pipelineStatus.openQuestionReports > 0
                  ? ` (${pipelineStatus.openQuestionReports} open)`
                  : ''}
              </Link>
              <Link
                href="/admin/questions"
                className="block w-full bg-card border-2 border-accent text-accent px-4 py-2 rounded-lg hover:bg-accent/10 transition text-center"
              >
                Manage Tags
              </Link>
              <Link
                href="/admin/translation"
                className="block w-full bg-card border-2 border-border text-text px-4 py-2 rounded-lg hover:bg-accent/10 transition text-center text-sm"
              >
                🌍 Translation suggestions
              </Link>
              <button
                onClick={() => trigger("generate-questions", "Generate Questions")}
                disabled={loading}
                className="w-full bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                Generate Questions
              </button>
              <button
                onClick={() => trigger("wipe-questions", "Wipe Questions")}
                disabled={loading}
                className="w-full bg-card border-2 border-destructive text-destructive px-4 py-2 rounded-lg hover:bg-destructive/10 transition disabled:opacity-50"
              >
                Wipe Questions
              </button>
            </div>
          </div>

          {/* Seeder 2.0 Card */}
          <div className="bg-card border-2 border-accent rounded-xl p-6">
            <h2 className="text-xl font-bold text-text mb-4">🌱 Seeder 2.0</h2>
            <div className="space-y-2">
              <button
                onClick={runFullSeed}
                disabled={loading || seedRunning}
                className="w-full bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50 font-bold"
              >
                {seedRunning ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
                    Seeding…
                  </span>
                ) : (
                  '🚀 Run Full Seed'
                )}
              </button>
              <p className="text-subtle text-xs mt-2">
                Creates demo users, messages, questions, and badges in one go
              </p>
              {seedStatus !== 'idle' ? (
                <p className={`text-xs mt-1 ${
                  seedStatus === 'running'
                    ? 'text-subtle'
                    : seedStatus === 'success'
                      ? 'text-green-400'
                      : 'text-destructive'
                }`}>
                  {seedStatusMessage}
                </p>
              ) : (
                <p className="text-subtle text-xs mt-1">Ready</p>
              )}
            </div>
          </div>

          {/* Ops Runs Card */}
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-text mb-4">⚙️ Ops Runs</h2>
            <div className="space-y-2">
              <Link
                href="/admin/ops"
                className="block w-full bg-card border-2 border-accent text-accent px-4 py-2 rounded-lg hover:bg-accent/10 transition text-center"
              >
                View bot runs (QuestionGen, Wiki enrich)
              </Link>
            </div>
          </div>

          {/* Audit Logs Card */}
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-text mb-4">📋 Audit Logs</h2>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowAuditLogs(!showAuditLogs);
                  if (!showAuditLogs) loadAuditLogs();
                }}
                className="w-full bg-card border-2 border-accent text-accent px-4 py-2 rounded-lg hover:bg-accent/10 transition"
              >
                {showAuditLogs ? "Hide Logs" : "View Audit Logs"}
              </button>
              <p className="text-subtle text-xs">
                {auditLogs.length} system events recorded
              </p>
            </div>
          </div>
        </div>

        {/* Audit Logs Panel */}
        {showAuditLogs && (
          <div className="bg-card border-2 border-accent rounded-xl p-6">
            <h2 className="text-xl font-bold text-text mb-4">🔍 System Audit Logs</h2>
            <div className="bg-bg border border-border rounded-lg p-4 max-h-96 overflow-y-auto space-y-2">
              {auditLogs.length === 0 ? (
                <p className="text-subtle text-sm">No audit logs yet...</p>
              ) : (
                auditLogs.map((log, i) => (
                  <div key={log.id || i} className="text-sm border-b border-border pb-2 last:border-b-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-accent">{log.action}</span>
                      <span className="text-subtle text-xs">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {log.user && (
                      <div className="text-subtle text-xs mb-1">
                        By: {log.user.name || log.user.email}
                      </div>
                    )}
                    {log.meta && (
                      <div className="bg-bg/50 rounded p-2 font-mono text-xs text-text mt-1">
                        {JSON.stringify(log.meta, null, 2)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Action Log */}
        <div className="bg-card border-2 border-border rounded-xl p-6">
          <h2 className="text-xl font-bold text-text mb-4">📋 Action Log</h2>
          <div className="bg-bg border border-border rounded-lg p-4 max-h-64 overflow-y-auto space-y-1">
            {logs.length === 0 ? (
              <p className="text-subtle text-sm">No actions yet...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-sm text-text font-mono">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Status Info */}
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-subtle text-sm text-center">
            🔒 Admin-only section - Regular users cannot access this page
          </p>
        </div>
      </div>
    </div>
  );
}

