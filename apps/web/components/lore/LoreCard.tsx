'use client';

import { LoreEntry } from '@/hooks/useLore';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollText, Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoreCardProps {
  entry: LoreEntry;
}

const toneIcons = {
  serious: ScrollText,
  comedic: Zap,
  poetic: Sparkles,
};

const toneColors = {
  serious: 'text-blue-500 dark:text-blue-400',
  comedic: 'text-yellow-500 dark:text-yellow-400',
  poetic: 'text-purple-500 dark:text-purple-400',
};

const sourceTypeLabels = {
  reflection: 'Reflection',
  quest: 'Quest',
  item: 'Item',
  event: 'Event',
  system: 'System',
};

export function LoreCard({ entry }: LoreCardProps) {
  const Icon = toneIcons[entry.tone];
  const date = new Date(entry.createdAt).toLocaleDateString();

  return (
    <Card className="bg-card border-border hover:border-accent/50 transition-all">
      <CardContent className="p-4 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn('w-4 h-4', toneColors[entry.tone])} />
            <span className="text-xs font-semibold text-subtle uppercase">
              {sourceTypeLabels[entry.sourceType]}
            </span>
          </div>
          <span className="text-xs text-subtle">{date}</span>
        </div>

        {/* Text */}
        <p className="text-text leading-relaxed whitespace-pre-wrap">{entry.text}</p>
      </CardContent>
    </Card>
  );
}

