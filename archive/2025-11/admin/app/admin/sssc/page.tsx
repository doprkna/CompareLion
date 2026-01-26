"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import * as Toast from '@radix-ui/react-toast';
import { QGEN_BATCH_SIZE } from '@/lib/config';

interface SsscEntry {
  id: string;
  path: string;
  status: string;
  generatedAt: string | null;
  error: string | null;
  questionCount: number;
}

const STATUSES = ['all', 'pending', 'generating', 'done', 'failed'];

export default function AdminSSSCCtrlPage() {
  const [entries, setEntries] = useState<SsscEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [toasts, setToasts] = useState<Array<{ id: string; title: string }>>([]);

  async function load() {
    const res = await fetch('/api/admin/sssc');
    const data = await res.json();
    setEntries(data.ssscs);
  }

  useEffect(() => { load(); }, []);

  const filtered = entries.filter(e => filter === 'all' || e.status === filter);

  async function handleGenerate(id: string) {
    await fetch(`/api/admin/sssc/${id}/generate`, { method: 'POST' });
    setToasts(ts => [...ts, { id: `gen-${id}-${Date.now()}`, title: 'Enqueued generation' }]);
    load();
  }
  
  // Batch generate pending leaves
  async function handleBatchGenerate() {
    const res = await fetch('/api/admin/sssc/batch', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: QGEN_BATCH_SIZE }),
    });
    const data = await res.json();
    setToasts(ts => [...ts, { id: `batch-${Date.now()}`, title: `Enqueued ${data.enqueued} leaves` }]);
    load();
  }

  return (
    <Toast.Provider>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Manage SSSCs</h1>
        <div className="flex items-center gap-4">
          <span>Status:</span>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="border px-2 py-1 rounded">
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            className="px-3 py-1 bg-green-600 text-white rounded"
            onClick={handleBatchGenerate}
          >
            Generate {QGEN_BATCH_SIZE} Pending
          </button>
        </div>
        {/* Progress widget */}
        <MetricsWidget />
        <ProgressWidget />
        {/* SSSC table */}
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Path</th>
              <th className="p-2">Status</th>
              <th className="p-2">#Questions</th>
              <th className="p-2">Last Gen</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="border-b">
                <td className="p-2">{e.path}</td>
                <td className="p-2">{e.status}</td>
                <td className="p-2">{e.questionCount}</td>
                <td className="p-2">{e.generatedAt ? new Date(e.generatedAt).toLocaleString() : '-'}</td>
                <td className="p-2 flex gap-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => handleGenerate(e.id)}>
                    {e.status === 'failed' ? 'Retry' : 'Generate'}
                  </button>
                  <Link href={`/admin/sssc/${e.id}/questions`}>
                    <button className="px-3 py-1 bg-gray-200 rounded">Review</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Toast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2" />
      {toasts.map(t => (
        <Toast.Root key={t.id} duration={3000} onOpenChange={open => { if (!open) setToasts(ts => ts.filter(x => x.id !== t.id)); }}>
          <Toast.Title>{t.title}</Toast.Title>
        </Toast.Root>
      ))}
    </Toast.Provider>
  );
}

function ProgressWidget() {
  const [stats, setStats] = useState<{ total: number; done: number; pending: number; percent: number; avgPerDay: number; etaDays: number | null } | null>(null);
  useEffect(() => {
    fetch('/api/admin/sssc/progress')
      .then(res => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);
  if (!stats) return <div>Loading progress...</div>;
  return (
    <div className="border p-4 rounded mb-4">
      <h3 className="font-semibold mb-2">Expansion Progress</h3>
      <div>Total Leaves: {stats.total}</div>
      <div>Done: {stats.done}</div>
      <div>Pending: {stats.pending}</div>
      <div>Complete: {stats.percent}%</div>
      <div>ETA: {stats.etaDays ?? 'N/A'} days</div>
    </div>
  );
}

function LogsPanel() {
  const [logs, setLogs] = useState<Array<{ id: string; ssscId: string; createdAt: string; status: string; insertedCount: number; finishedAt: string }>>([]);
  useEffect(() => {
    fetch('/api/admin/sssc/logs')
      .then(res => res.json())
      .then(data => setLogs(data.logs))
      .catch(console.error);
  }, []);
  return (
    <div className="border p-4 rounded mb-4">
      <h3 className="font-semibold mb-2">Generation Logs</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-1">Date</th>
            <th className="p-1">SSSC</th>
            <th className="p-1">Status</th>
            <th className="p-1">Inserted</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} className="border-b">
              <td className="p-1">{new Date(log.createdAt).toLocaleString()}</td>
              <td className="p-1">{log.ssscId}</td>
              <td className="p-1">{log.status}</td>
              <td className="p-1">{log.insertedCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetricsWidget() {
  const [m, setM] = useState<{ total: number; completedPercent: number; pending: number; avgPerDay: number; etaDays: number | null } | null>(null);
  useEffect(() => {
    fetch('/api/admin/sssc/metrics')
      .then(res => res.json())
      .then(setM)
      .catch(console.error);
  }, []);
  if (!m) return <div>Loading metrics...</div>;
  return (
    <div className="border p-4 rounded mb-4 grid grid-cols-4 gap-4">
      <div>Total Leaves<br/><strong>{m.total}</strong></div>
      <div>Completed<br/><strong>{m.completedPercent}%</strong></div>
      <div>Pending<br/><strong>{m.pending}</strong></div>
      <div>ETA (days)<br/><strong>{m.etaDays ?? 'N/A'}</strong></div>
    </div>
  );
}
