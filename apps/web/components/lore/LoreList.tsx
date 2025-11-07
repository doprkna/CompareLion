'use client';

import { LoreEntry } from '@/hooks/useLore';
import { LoreCard } from './LoreCard';
import { Loader2, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoreListProps {
  entries: LoreEntry[];
  loading?: boolean;
  emptyMessage?: string;
}

export function LoreList({ entries, loading, emptyMessage = "No lore entries yet" }: LoreListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-subtle" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-subtle" />
          <h3 className="text-xl font-semibold text-text mb-2">No Lore Entries</h3>
          <p className="text-subtle">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <LoreCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

