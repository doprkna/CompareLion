/**
 * Admin: Seed Generation Management
 * 
 * Monitor and control automated question generation:
 * - View batch status and progress
 * - Trigger new batches
 * - Retry failed jobs
 * - Multi-language support
 */

"use client";

import { useEffect, useState } from "react";
import { GEN_CONFIG } from '@parel/core/config/generator";
import { ErrorPlaceholder } from "@/components/ErrorPlaceholder";
import { LoadingPlaceholder } from "@/components/ErrorPlaceholder";

type Batch = {
  id: string;
  createdAt: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  status: string;
  language: string;
  targetCount: number;
  processed: number;
  succeeded: number;
  failed: number;
  note?: string | null;
  _count?: {
    jobs: number;
  };
};

export default function SeedsAdmin() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [lang, setLang] = useState(GEN_CONFIG.LANGUAGES[0] || "en");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      const res = await fetch("/api/admin/generate");
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch batches');
      }
      
      setBatches(data.batches || []);
      setError("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const trigger = async () => {
    setLoading(true);
    setMsg("");
    setError("");
    
    try {
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": GEN_CONFIG.ADMIN_TOKEN || "",
        },
        body: JSON.stringify({ language: lang }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to trigger batch");
      }
      
      setMsg(`✅ Batch created: ${data.batchId}. Now run: pnpm gen:questions`);
      await refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const retryFailed = async (batchId: string) => {
    setLoading(true);
    setMsg("");
    setError("");
    
    try {
      const res = await fetch("/api/admin/generate/retry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": GEN_CONFIG.ADMIN_TOKEN || "",
        },
        body: JSON.stringify({ batchId }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Retry failed");
      }
      
      setMsg(`✅ ${data.message}`);
      await refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      RUNNING: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      DONE: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      FAILED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      PAUSED: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[status] || statusColors.PENDING}`}>
        {status}
      </span>
    );
  };

  if (initialLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Seed Generation — Admin</h1>
        <LoadingPlaceholder message="Loading batches..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Seed Generation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage automated question generation batches
          </p>
        </div>
      </div>

      {/* Configuration Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-200 mb-2">
          ⚙️ Generator Configuration
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-blue-700 dark:text-blue-400">Concurrency:</span>{" "}
            <span className="font-mono">{GEN_CONFIG.MAX_CONCURRENCY}</span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-400">Questions/Cat:</span>{" "}
            <span className="font-mono">
              {GEN_CONFIG.QUESTIONS_PER_CATEGORY_MIN}-{GEN_CONFIG.QUESTIONS_PER_CATEGORY_MAX}
            </span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-400">Languages:</span>{" "}
            <span className="font-mono">{GEN_CONFIG.LANGUAGES.join(", ")}</span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-400">Dry Run:</span>{" "}
            <span className="font-mono">{GEN_CONFIG.DRY_RUN ? "Yes" : "No"}</span>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-gray-800 border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Create New Batch</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              className="w-full border rounded-md px-3 py-2 bg-background text-foreground"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              disabled={loading}
            >
              {GEN_CONFIG.LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={trigger}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "Creating..." : "Create Batch"}
            </button>
          </div>
        </div>

        {msg && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-800 dark:text-green-200">
            {msg}
          </div>
        )}

        {error && (
          <div className="mt-4">
            <ErrorPlaceholder title={error} retry={() => setError("")} />
          </div>
        )}
      </div>

      {/* Batches Table */}
      <div className="bg-white dark:bg-gray-800 border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Recent Batches</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="p-3 text-left font-semibold">Batch ID</th>
                <th className="p-3 text-center font-semibold">Lang</th>
                <th className="p-3 text-center font-semibold">Status</th>
                <th className="p-3 text-center font-semibold">Progress</th>
                <th className="p-3 text-center font-semibold">✅ OK</th>
                <th className="p-3 text-center font-semibold">❌ Fail</th>
                <th className="p-3 text-left font-semibold">Started</th>
                <th className="p-3 text-left font-semibold">Finished</th>
                <th className="p-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    No batches yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                batches.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-3">
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {b.id.slice(0, 8)}
                      </code>
                    </td>
                    <td className="p-3 text-center font-mono text-xs">
                      {b.language.toUpperCase()}
                    </td>
                    <td className="p-3 text-center">{getStatusBadge(b.status)}</td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-mono text-xs">
                          {b.processed}/{b.targetCount || "?"}
                        </span>
                        {b.targetCount > 0 && (
                          <div className="w-full max-w-[100px] bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all"
                              style={{ width: `${(b.processed / b.targetCount) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        {b.succeeded}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-red-600 dark:text-red-400 font-semibold">
                        {b.failed}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {b.startedAt ? new Date(b.startedAt).toLocaleString() : "-"}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {b.finishedAt ? new Date(b.finishedAt).toLocaleString() : "-"}
                    </td>
                    <td className="p-3 text-center">
                      {b.failed > 0 && (
                        <button
                          onClick={() => retryFailed(b.id)}
                          disabled={loading}
                          className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 transition-colors"
                        >
                          Retry Failed
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 dark:bg-gray-900 border rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-2">📖 How to Use</h3>
        <ol className="text-xs space-y-1 text-muted-foreground list-decimal list-inside">
          <li>Click "Create Batch" to queue a new generation batch</li>
          <li>
            Run the worker script:{" "}
            <code className="bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">
              pnpm gen:questions
            </code>
          </li>
          <li>Monitor progress in this table (auto-refreshes)</li>
          <li>If jobs fail, click "Retry Failed" and re-run the worker</li>
        </ol>
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
          <strong>Note:</strong> Concurrency is set to {GEN_CONFIG.MAX_CONCURRENCY}. Each job generates{" "}
          {GEN_CONFIG.QUESTIONS_PER_CATEGORY_MIN}–{GEN_CONFIG.QUESTIONS_PER_CATEGORY_MAX} questions.
        </div>
      </div>

      {/* Auto-refresh every 5 seconds when there are running batches */}
      {batches.some((b) => b.status === "RUNNING" || b.status === "PENDING") && (
        <AutoRefresh onRefresh={refresh} interval={5000} />
      )}
    </div>
  );
}

/**
 * Auto-refresh component
 * Refreshes data at a specified interval
 */
function AutoRefresh({ onRefresh, interval }: { onRefresh: () => void; interval: number }) {
  useEffect(() => {
    const timer = setInterval(onRefresh, interval);
    return () => clearInterval(timer);
  }, [onRefresh, interval]);

  return (
    <div className="text-xs text-center text-muted-foreground">
      Auto-refreshing every {interval / 1000}s...
    </div>
  );
}

