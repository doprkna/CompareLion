'use client';

/**
 * Admin Performance Debug Panel
 * Shows API timing and SWR cache stats
 * Dev-only page for debugging performance
 * v0.32.1 - Performance & Caching Audit
 */

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2 } from 'lucide-react';
import { getFlags } from '@parel/core/config/flags';

interface PerfLogEntry {
  timestamp: string;
  label: string;
  duration: number;
}

export default function AdminPerfPage() {
  const [logs, setLogs] = useState<PerfLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch logs from API endpoint
      const response = await fetch('/api/admin/perf/logs');
      if (!response.ok) {
        throw new Error('Failed to load logs');
      }

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('[ADMIN_PERF] Load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      const response = await fetch('/api/admin/perf/logs', {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to clear logs');
      }
      setLogs([]);
    } catch (err) {
      console.error('[ADMIN_PERF] Clear error:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear logs');
    }
  };

  useEffect(() => {
    // Only show in development
    if (getFlags().environment === 'production') {
      return;
    }

    loadLogs();
    const interval = setInterval(loadLogs, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Hide in production
  if (getFlags().environment === 'production') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-subtle">Performance debug panel is only available in development mode.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate statistics
  const avgDuration = logs.length > 0
    ? logs.reduce((sum, log) => sum + log.duration, 0) / logs.length
    : 0;

  const slowestLogs = [...logs]
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10);

  const logsByLabel = logs.reduce((acc, log) => {
    if (!acc[log.label]) {
      acc[log.label] = { count: 0, total: 0, avg: 0 };
    }
    acc[log.label].count++;
    acc[log.label].total += log.duration;
    acc[log.label].avg = acc[log.label].total / acc[log.label].count;
    return acc;
  }, {} as Record<string, { count: number; total: number; avg: number }>);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">📊 Performance Debug Panel</h1>
        <div className="flex gap-2">
          <Button onClick={loadLogs} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={clearLogs} variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardContent className="p-4">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{logs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avgDuration.toFixed(2)}ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Slowest</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {slowestLogs[0]?.duration.toFixed(2) || '0'}ms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Logs by Label */}
      <Card>
        <CardHeader>
          <CardTitle>Logs by Endpoint</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Label</th>
                <th className="text-right py-2">Count</th>
                <th className="text-right py-2">Avg Duration</th>
                <th className="text-right py-2">Total Duration</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(logsByLabel)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([label, stats]) => (
                  <tr key={label} className="border-b">
                    <td className="py-2 font-mono text-sm">{label}</td>
                    <td className="text-right py-2">{stats.count}</td>
                    <td className="text-right py-2">{stats.avg.toFixed(2)}ms</td>
                    <td className="text-right py-2">{stats.total.toFixed(2)}ms</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs (Last 50)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {logs.slice(-50).map((log, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border-b font-mono text-sm"
              >
                <span className="text-subtle">{log.timestamp}</span>
                <span className="font-medium">{log.label}</span>
                <span
                  className={`font-bold ${
                    log.duration > 200
                      ? 'text-red-400'
                      : log.duration > 100
                      ? 'text-yellow-400'
                      : 'text-green-400'
                  }`}
                >
                  {log.duration}ms
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

