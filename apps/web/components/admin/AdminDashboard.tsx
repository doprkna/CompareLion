'use client';

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/apiBase";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  async function trigger(path: string, label: string) {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/admin/${path}`, { method: "POST" });
      const status = (res as any).ok !== false ? "OK" : "Fail";
      setLogs((l) => [`✅ ${label}: ${status}`, ...l].slice(0, 50));
      
      // Refresh audit logs after action
      if ((res as any).ok !== false) {
        await loadAuditLogs();
      }
    } catch (err) {
      setLogs((l) => [`❌ ${label}: Error`, ...l].slice(0, 50));
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

