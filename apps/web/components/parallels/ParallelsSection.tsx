'use client';

/**
 * Parallels Section (C16) - Fetches and displays user parallels after flow completion
 */

import { useEffect, useState } from 'react';
import { ParallelCard, type ParallelUser } from './ParallelCard';

export function ParallelsSection() {
  const [parallels, setParallels] = useState<ParallelUser[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="mt-6 p-4 border border-border rounded-lg">
        <h3 className="font-semibold text-text mb-2">Your Parallels</h3>
        <p className="text-sm text-subtle">Loading...</p>
      </div>
    );
  }

  if (parallels.length === 0) {
    return (
      <div className="mt-6 p-4 border border-border rounded-lg">
        <h3 className="font-semibold text-text mb-2">Your Parallels</h3>
        <p className="text-sm text-subtle">Answer more questions to discover users like you.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <h3 className="font-semibold text-text">Your Parallels</h3>
      <p className="text-sm text-subtle mb-2">Users most similar to you based on your answers</p>
      <div className="space-y-3">
        {parallels.map(p => (
          <ParallelCard key={p.userId} parallel={p} />
        ))}
      </div>
    </div>
  );
}
