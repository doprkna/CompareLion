'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  excerpt: string | null;
  content: unknown;
  media: unknown;
  coverImageUrl: string | null;
  category: string;
  status: string;
};

export function AdminNewsEditor({ post: initialPost }: { post?: Post | null }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPost?.title ?? '');
  const [slug, setSlug] = useState(initialPost?.slug ?? '');
  const [category, setCategory] = useState(initialPost?.category ?? 'NEWS');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(initialPost?.coverImageUrl ?? '');
  const [contentJson, setContentJson] = useState(
    JSON.stringify(initialPost?.content ?? [{ type: 'p', text: '' }], null, 2)
  );
  const [saving, setSaving] = useState(false);

  const slugFromTitle = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  useEffect(() => {
    if (!initialPost?.slug) setSlug(slugFromTitle);
  }, [title, initialPost?.slug]);

  const parseContent = (): unknown[] => {
    try {
      const v = JSON.parse(contentJson);
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  };

  const handleSave = async () => {
    if (!title || !slug) return;
    setSaving(true);
    try {
      if (initialPost) {
        await apiFetch(`/api/admin/news/${initialPost.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title,
            slug,
            category,
            excerpt: excerpt || null,
            content: parseContent(),
            coverImageUrl: coverImageUrl || null,
          }),
        });
      } else {
        const res = await apiFetch<{ data?: { post?: { id: string } } }>('/api/admin/news', {
          method: 'POST',
          body: JSON.stringify({
            title,
            slug,
            category,
            excerpt: excerpt || null,
            content: parseContent(),
            coverImageUrl: coverImageUrl || null,
          }),
        });
        const id = res.data?.data?.post?.id;
        if (id) router.push(`/admin/news/${id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!initialPost) return;
    setSaving(true);
    try {
      await apiFetch(`/api/admin/news/${initialPost.id}/publish`, { method: 'POST' });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async () => {
    if (!initialPost) return;
    const at = prompt('ISO datetime (e.g. 2026-02-10T12:00:00Z):');
    if (!at) return;
    setSaving(true);
    try {
      await apiFetch(`/api/admin/news/${initialPost.id}/schedule`, {
        method: 'POST',
        body: JSON.stringify({ scheduledAt: at }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    if (!initialPost) return;
    setSaving(true);
    try {
      await apiFetch(`/api/admin/news/${initialPost.id}/unpublish`, { method: 'POST' });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <Link href="/admin/news" className="text-sm text-accent hover:underline mb-6 inline-block">
        ← Back to News
      </Link>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>{initialPost ? 'Edit Post' : 'New Post'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FEATURE">Feature</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="NEWS">News</SelectItem>
                <SelectItem value="PROMO">Promo</SelectItem>
                <SelectItem value="ALERT">Alert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Excerpt</Label>
            <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Cover Image URL</Label>
            <Input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Content (JSON)</Label>
            <textarea
              value={contentJson}
              onChange={(e) => setContentJson(e.target.value)}
              className="mt-1 w-full h-48 font-mono text-sm p-2 rounded border border-border bg-bg"
              placeholder='[{"type":"p","text":"..."},{"type":"h2","text":"..."}]'
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              Save
            </Button>
            {initialPost && (
              <>
                {initialPost.status !== 'PUBLISHED' && (
                  <Button variant="default" onClick={handlePublish} disabled={saving}>
                    Publish
                  </Button>
                )}
                <Button variant="outline" onClick={handleSchedule} disabled={saving}>
                  Schedule
                </Button>
                {(initialPost.status === 'PUBLISHED' || initialPost.status === 'SCHEDULED') && (
                  <Button variant="outline" onClick={handleUnpublish} disabled={saving}>
                    Unpublish
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
