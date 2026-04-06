'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/apiBase';

interface QueueItem {
  id: string;
  entityType: string;
  entityId: string;
  userId: string | null;
  status: string;
  autoFlagScore: number;
  isAutoFlagged: boolean;
  createdAt: string;
  reportsCount: number;
}

export default function AdminModerationPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/admin/moderation/queue')
      .then((r) => (r.ok && r.data?.data?.queue ? r.data.data.queue : []))
      .then(setQueue)
      .catch(() => setQueue([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (entityType: string, entityId: string, action: 'approve' | 'reject' | 'shadow') => {
    const res = await apiFetch<{ success?: boolean }>('/api/admin/moderation/action', {
      method: 'POST',
      body: JSON.stringify({ entityType, entityId, action }),
    });
    if (res.ok) {
      setQueue((prev) => prev.filter((i) => !(i.entityType === entityType && i.entityId === entityId)));
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Moderation Queue</h1>
      {queue.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center text-subtle">No items in queue</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <Card key={item.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {item.entityType}:{item.entityId}
                </CardTitle>
                <p className="text-sm text-subtle">
                  Reports: {item.reportsCount} | Score: {item.autoFlagScore} | {item.status}
                  {item.isAutoFlagged && ' (auto)'}
                </p>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button size="sm" onClick={() => handleAction(item.entityType, item.entityId, 'approve')}>
                  Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleAction(item.entityType, item.entityId, 'reject')}>
                  Reject
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAction(item.entityType, item.entityId, 'shadow')}>
                  Shadow
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
