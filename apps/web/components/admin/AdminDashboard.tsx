'use client';

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiBase";
import Link from "next/link";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
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

  useEffect(() => {
    loadAuditLogs();
  }, []);

  useEffect(() => {
    (async () => {
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
    })();
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
            <div className="space-y-2">
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
                onClick={() => trigger("seed-db", "Run Seeder 2.0")}
                disabled={loading}
                className="w-full bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50 font-bold"
              >
                🚀 Run Full Seed
              </button>
              <p className="text-subtle text-xs mt-2">
                Creates demo users, messages, questions, and badges in one go
              </p>
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

