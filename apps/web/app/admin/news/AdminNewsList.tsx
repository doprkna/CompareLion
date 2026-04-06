'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiFetch } from '@/lib/apiBase';

type Post = {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
};

export function AdminNewsList() {
  const [items, setItems] = useState<Post[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = statusFilter ? `?status=${statusFilter}` : '';
    apiFetch(`/api/admin/news${params}`)
      .then((r) => (r.ok && r.data?.data?.items ? r.data.data.items : []))
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), [statusFilter]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">News CMS</h1>
        <Link href="/admin/news/new">
          <Button>+ New Post</Button>
        </Link>
      </div>
      <div className="flex gap-4 mb-6">
        <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {loading ? (
        <div className="text-subtle py-12">Loading…</div>
      ) : items.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center text-subtle">No posts</CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((p) => (
            <Card key={p.id} className="bg-card border-border">
              <CardContent className="p-4 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <Link href={`/admin/news/${p.id}`} className="font-medium hover:underline">
                    {p.title}
                  </Link>
                  <span className="text-xs text-subtle ml-2">{p.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-card border border-border">{p.status}</span>
                  {p.publishedAt && (
                    <span className="text-xs text-subtle">
                      {new Date(p.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                  {p.scheduledAt && !p.publishedAt && (
                    <span className="text-xs text-amber-600">
                      {new Date(p.scheduledAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
