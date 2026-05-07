import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@parel/ui';
import { useMemo, useState } from 'react';

export interface FlowTemptationData {
  categoryId: string;
  title: string;
  moodLabel: string;
  moodClass: string;
  rewardPreview: string;
  firstQuestionPreview: string;
  ambientLine?: string;
}

interface FlowTemptationCardProps {
  data: FlowTemptationData;
  loading?: boolean;
  onStart: (categoryId: string) => void;
}

export function FlowTemptationCard({ data, loading = false, onStart }: FlowTemptationCardProps) {
  const [revealed, setRevealed] = useState(false);
  const teaseOptions = useMemo(() => {
    const labels = ['Rare flow', 'Wildcard discovered', 'Different path available'];
    const seed = `${data.categoryId}-${data.title}-${data.firstQuestionPreview}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    const highlightedIndex = hash % labels.length;
    return labels.map((label, index) => ({
      label,
      highlighted: index === highlightedIndex,
    }));
  }, [data.categoryId, data.firstQuestionPreview, data.title]);

  return (
    <Card className={`border shadow-sm ${data.moodClass} bg-gradient-to-b from-card to-accent/5`}>
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.16em] text-subtle">Next quest</p>
          <span className="inline-flex items-center rounded-full border border-accent/35 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
            ✦
            Featured
          </span>
        </div>
        <CardTitle className="text-lg sm:text-xl leading-snug">{data.title}</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full bg-bg/70 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-text/90">
            {data.moodLabel}
          </span>
          <span className="text-xs font-semibold text-accent">{data.rewardPreview}</span>
          <span className="text-xs text-subtle">!</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {teaseOptions.map(option => (
            <div
              key={option.label}
              className={`rounded-md border px-2 py-1.5 text-[11px] uppercase tracking-[0.1em] ${
                option.highlighted
                  ? 'border-accent/50 bg-accent/15 text-accent shadow-[0_0_18px_rgba(99,102,241,0.2)]'
                  : 'border-border/70 bg-card/70 text-subtle'
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
        <Button type="button" className="w-full sm:w-auto" disabled={loading} onClick={() => onStart(data.categoryId)}>
          Continue with this flow
          <Icon name="arrow-right" className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <button
          type="button"
          className="w-full flex items-center justify-between rounded-md border border-border/70 bg-card/60 px-3 py-2 text-left text-xs text-subtle hover:bg-card/80"
          onClick={() => setRevealed(prev => !prev)}
        >
          <span>{revealed ? 'Hide teaser' : 'Reveal first-question teaser'}</span>
          <span aria-hidden>{revealed ? '▲' : '▼'}</span>
        </button>
        {revealed ? (
          <div className="mt-3 space-y-3">
            <div className="rounded-lg border border-border/70 bg-card/80 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-subtle">First question</p>
              <p className="mt-1 text-sm leading-snug text-text">{data.firstQuestionPreview}</p>
            </div>
            {data.ambientLine ? (
              <p className="text-xs text-subtle">{data.ambientLine}</p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
