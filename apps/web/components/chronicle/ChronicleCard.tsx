'use client';

import { Chronicle } from '@/hooks/useChronicle';
import { ChronicleStats } from './ChronicleStats';
import { ChronicleQuote } from './ChronicleQuote';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollText } from 'lucide-react';

interface ChronicleCardProps {
  chronicle: Chronicle;
}

export function ChronicleCard({ chronicle }: ChronicleCardProps) {
  const date = new Date(chronicle.generatedAt);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="bg-card border-2 border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-text flex items-center gap-2">
            <ScrollText className="w-6 h-6" />
            {chronicle.type === 'weekly' ? 'Weekly Chronicle' : 'Seasonal Chronicle'}
          </CardTitle>
          <span className="text-sm text-subtle">{formattedDate}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Text */}
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <p className="text-text leading-relaxed">{chronicle.summaryText}</p>
        </div>

        {/* Stats */}
        <ChronicleStats stats={chronicle.stats} />

        {/* Quote */}
        {chronicle.quote && <ChronicleQuote quote={chronicle.quote} />}

        {/* Season Info */}
        {chronicle.season && (
          <div className="text-sm text-subtle">
            Season: <span className="font-semibold text-text">{chronicle.season.displayName}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

