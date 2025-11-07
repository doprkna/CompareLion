'use client';

interface ChronicleStatsProps {
  stats: {
    reflectionCount: number;
    xpGained: number;
    dominantSentiment: string;
    sentimentCounts: Record<string, number>;
    mostActiveDay?: string;
  };
}

export function ChronicleStats({ stats }: ChronicleStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div className="bg-card/50 border border-border rounded-lg p-3">
        <div className="text-xs text-subtle mb-1">Reflections</div>
        <div className="text-2xl font-bold text-text">{stats.reflectionCount}</div>
      </div>
      <div className="bg-card/50 border border-border rounded-lg p-3">
        <div className="text-xs text-subtle mb-1">XP Gained</div>
        <div className="text-2xl font-bold text-accent">{stats.xpGained.toLocaleString()}</div>
      </div>
      <div className="bg-card/50 border border-border rounded-lg p-3">
        <div className="text-xs text-subtle mb-1">Mood</div>
        <div className="text-lg font-semibold text-text capitalize">{stats.dominantSentiment}</div>
      </div>
      {stats.mostActiveDay && (
        <div className="bg-card/50 border border-border rounded-lg p-3">
          <div className="text-xs text-subtle mb-1">Most Active Day</div>
          <div className="text-lg font-semibold text-text">{stats.mostActiveDay}</div>
        </div>
      )}
    </div>
  );
}

