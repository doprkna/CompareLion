'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/apiBase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Bookmark, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface BookmarkItem {
  question: { id: string; text: string; categoryId?: string; categoryName?: string };
  bookmarkedAt: string;
  myLatestResponse?: { id: string; value: string; createdAt: string };
}

export default function SavedQuestionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status !== 'authenticated') return;
    loadItems();
  }, [status, router]);

  async function loadItems(cursor?: string) {
    setLoading(true);
    try {
      const url = cursor
        ? `/api/bookmarks/questions?limit=20&cursor=${encodeURIComponent(cursor)}`
        : '/api/bookmarks/questions?limit=20';
      const res = await apiFetch(url);
      if (res.ok && res.data?.success && res.data?.data) {
        const data = res.data.data;
        const newItems = data.items ?? [];
        setItems((prev) => (cursor ? [...prev, ...newItems] : newItems));
        setNextCursor(data.nextCursor ?? null);
      }
    } catch {
      if (!cursor) setItems([]);
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-subtle" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-text mb-2 flex items-center gap-2">
          <Bookmark className="h-7 w-7" />
          Saved Questions
        </h1>
        <p className="text-subtle text-sm mb-6">Save questions to review later</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-subtle" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No saved questions"
            description="Save questions to review later. Use the bookmark icon when answering flows."
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.question.id} className="bg-card border-border">
                <CardHeader className="py-3">
                  <CardTitle className="text-base font-medium line-clamp-2">
                    {item.question.text}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {item.myLatestResponse && (
                    <p className="text-sm text-subtle mb-2">
                      Your answer: {item.myLatestResponse.value}
                    </p>
                  )}
                  <Link href={`/q/${item.question.id}`}>
                    <Button variant="outline" size="sm">
                      Open
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
            {nextCursor && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => loadItems(nextCursor)}
              >
                Load more
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
