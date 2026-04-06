'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Item = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  publishedAt: string | null;
  coverImageUrl: string | null;
  likeCount: number;
};

export function NewsListClient({
  categories,
}: {
  categories: { value: string; label: string }[];
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (cursor?: string, append = false) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (cursor) params.set('cursor', cursor);
    const res = await fetch(`/api/news?${params}`);
    const json = await res.json();
    const data = json?.data ?? json;
    const list = data?.items ?? [];
    setItems(append ? (prev) => [...prev, ...list] : list);
    setNextCursor(data?.nextCursor ?? null);
  };

  useEffect(() => {
    setLoading(true);
    load(undefined, false).finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <Select value={category || 'all'} onValueChange={(v) => setCategory(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.value || 'all'} value={c.value || 'all'}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-subtle py-12 text-center">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-subtle py-12 text-center">No posts yet.</div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Link key={item.id} href={`/news/${item.slug}`}>
              <article className="card bg-card border border-border rounded-lg overflow-hidden hover:border-accent/50 transition-colors">
                <div className="flex flex-col sm:flex-row">
                  {item.coverImageUrl && (
                    <div className="relative w-full sm:w-48 h-32 sm:h-auto flex-shrink-0">
                      <Image
                        src={item.coverImageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 192px"
                      />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-accent uppercase">{item.category}</span>
                      {item.publishedAt && (
                        <span className="text-xs text-subtle">
                          {new Date(item.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-text">{item.title}</h2>
                    {item.excerpt && (
                      <p className="text-sm text-subtle line-clamp-2 mt-1">{item.excerpt}</p>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          ))}
          {nextCursor && (
            <button
              className="w-full py-3 text-accent font-medium hover:underline"
              onClick={() => load(nextCursor, true)}
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
