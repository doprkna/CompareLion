'use client';

/**
 * Parallels Section (C16) - Fetches and displays user parallels after flow completion
 */

import { useEffect, useState } from 'react';
import { ParallelCard, type ParallelUser } from './ParallelCard';
import { FLOW_CONTENT_KEYS } from '@/lib/content/flowContent';
import { resolveContent } from '@/lib/content/resolveContent';

interface ParallelsSectionProps {
  onSimilarityAvgChange?: (avg: number | null) => void;
  maxVisible?: number;
}

export function ParallelsSection({ onSimilarityAvgChange, maxVisible = 3 }: ParallelsSectionProps) {
  const [parallels, setParallels] = useState<ParallelUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch('/api/parallels')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.parallels) {
          setParallels(data.data.parallels);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!onSimilarityAvgChange) return;
    if (parallels.length === 0) {
      onSimilarityAvgChange(null);
      return;
    }
    const sum = parallels.reduce((acc, p) => acc + p.similarityPercent, 0);
    onSimilarityAvgChange(Math.round(sum / parallels.length));
  }, [parallels, onSimilarityAvgChange]);

  if (loading) {
    return (
      <div className="mt-6 p-5 border border-border rounded-lg bg-card/60">
        <h3 className="text-xl font-semibold text-text mb-2">
          {resolveContent(FLOW_CONTENT_KEYS.parallelsHeading, 'People like you')}
        </h3>
        <p className="text-sm text-subtle">Loading...</p>
      </div>
    );
  }

  if (parallels.length === 0) {
    return (
      <div className="mt-6 p-5 border border-border rounded-lg bg-card/60">
        <h3 className="text-xl font-semibold text-text mb-2">
          {resolveContent(FLOW_CONTENT_KEYS.parallelsHeading, 'People like you')}
        </h3>
        <p className="text-sm text-subtle">Answer more questions to discover users like you.</p>
      </div>
    );
  }

  const visibleParallels = expanded ? parallels : parallels.slice(0, maxVisible);
  const hasMore = parallels.length > maxVisible;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-2xl font-semibold text-text">
          {resolveContent(FLOW_CONTENT_KEYS.parallelsHeading, 'People like you')}
        </h3>
        <p className="text-sm text-subtle mt-1">
          {resolveContent(FLOW_CONTENT_KEYS.parallelsSubtitle, 'Based on your answers')}
        </p>
      </div>
      <div className="space-y-3">
        {visibleParallels.map(p => (
          <ParallelCard key={p.userId} parallel={p} />
        ))}
      </div>
      {hasMore && !expanded ? (
        <button
          type="button"
          className="text-sm text-accent hover:underline"
          onClick={() => setExpanded(true)}
        >
          Show more
        </button>
      ) : null}
    </div>
  );
}
