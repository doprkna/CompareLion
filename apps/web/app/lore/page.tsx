'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LoreList } from '@/components/lore/LoreList';
import { LoreToneSelector } from '@/components/lore/LoreToneSelector';
import { useLoreEntries, useLatestLore, useLoreTone } from '@parel/core/hooks/useLore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Loader2, Sparkles } from 'lucide-react';

export default function LorePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'latest' | 'all'>('latest');

  const { entries: latestEntries, loading: latestLoading, reload: reloadLatest } = useLatestLore();
  const { entries: allEntries, loading: allLoading, pagination, reload: reloadAll } = useLoreEntries(page, 20);
  const { tone, updateTone, loading: toneLoading } = useLoreTone();

  const currentEntries = viewMode === 'latest' ? latestEntries : allEntries;
  const currentLoading = viewMode === 'latest' ? latestLoading : allLoading;

  const handleToneChange = async (newTone: 'serious' | 'comedic' | 'poetic') => {
    try {
      await updateTone(newTone);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast(`📜 Narrative tone set to ${newTone}`, 'success');
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleReload = () => {
    if (viewMode === 'latest') {
      reloadLatest();
    } else {
      reloadAll();
    }
  };

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading' || (latestLoading && viewMode === 'latest') || (allLoading && viewMode === 'all')) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-subtle" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-2">
          <BookOpen className="w-8 h-8" />
          Your Story So Far
        </h1>
        <p className="text-subtle">A personal log of your journey and adventures</p>
      </div>

      {/* Tone Selector */}
      <Card className="bg-card border-border mb-6">
        <CardContent className="p-4">
          <LoreToneSelector
            currentTone={tone}
            onToneChange={handleToneChange}
            loading={toneLoading}
          />
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={viewMode === 'latest' ? 'default' : 'outline'}
          onClick={() => {
            setViewMode('latest');
            setPage(1);
          }}
        >
          Latest
        </Button>
        <Button
          variant={viewMode === 'all' ? 'default' : 'outline'}
          onClick={() => {
            setViewMode('all');
            setPage(1);
          }}
        >
          All Entries
        </Button>
        <Button
          variant="outline"
          onClick={handleReload}
          disabled={currentLoading}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Lore List */}
      <LoreList
        entries={currentEntries}
        loading={currentLoading}
        emptyMessage="Your legend begins here. Complete actions to generate lore entries!"
      />

      {/* Pagination */}
      {viewMode === 'all' && pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || allLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-subtle">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages || allLoading}
          >
            Next
          </Button>
        </div>
      )}

      {/* Stats */}
      {pagination && (
        <div className="mt-6 text-center text-sm text-subtle">
          Showing {currentEntries.length} of {pagination.total} entries
        </div>
      )}
    </div>
  );
}

