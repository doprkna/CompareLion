'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminWipPage } from '../_components/AdminWipPage';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type State = 'loading' | 'not_implemented' | 'unavailable' | 'error' | 'success';
type Data = { stats?: unknown } | null;

export default function AdminReportsClient() {
  const [state, setState] = useState<State>('loading');
  const [data, setData] = useState<Data>(null);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const res = await fetch('/api/reports', { credentials: 'include' });
      const body = await res.json().catch(() => ({}));

      if (res.status === 501 || body.code === 'NOT_IMPLEMENTED') {
        setState('not_implemented');
        setData(null);
        return;
      }

      if (res.status === 503 || body.code === 'SERVICE_UNAVAILABLE') {
        setState('unavailable');
        setData(null);
        return;
      }

      if (!res.ok) {
        setState('error');
        setData(null);
        return;
      }

      setState('success');
      setData(body.data ?? body);
    } catch {
      setState('error');
      setData(null);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-bg p-6 flex items-center justify-center">
        <p className="text-subtle text-lg">Loading reports...</p>
      </div>
    );
  }

  if (state === 'not_implemented') {
    return <AdminWipPage title="Reports" />;
  }

  if (state === 'unavailable') {
    return (
      <div className="min-h-screen bg-bg p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold text-text">Reports</h1>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-amber-600 dark:text-amber-400">
            DB unavailable.
          </div>
          <div className="flex gap-2">
            <Button onClick={load} variant="outline">
              Retry
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">Back to Admin</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-bg p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold text-text">Reports</h1>
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-destructive">
            Failed to load reports.
          </div>
          <div className="flex gap-2">
            <Button onClick={load} variant="outline">
              Retry
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">Back to Admin</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-text">Reports</h1>
        <p className="text-subtle">Reports data loaded successfully.</p>
        {data?.stats && (
          <div className="bg-card border border-border rounded-lg p-4">
            <pre className="text-sm font-mono overflow-auto max-h-96">
              {JSON.stringify(data.stats, null, 2)}
            </pre>
          </div>
        )}
        <Button asChild variant="outline">
          <Link href="/admin">Back to Admin</Link>
        </Button>
      </div>
    </div>
  );
}
