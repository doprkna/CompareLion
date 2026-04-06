'use client';

interface ChangelogSummaryProps {
  entries: Array<{
    version?: string;
    date?: string;
    counts?: { added: number; fixed: number; changed: number; docs: number };
  }>;
}

export function ChangelogSummary({ entries }: ChangelogSummaryProps) {
  const stats = entries.reduce(
    (acc, e) => {
      acc.totalVersions += 1;
      acc.totalAdded += e.counts?.added ?? 0;
      acc.totalFixed += e.counts?.fixed ?? 0;
      acc.totalChanged += e.counts?.changed ?? 0;
      return acc;
    },
    { totalVersions: 0, totalAdded: 0, totalFixed: 0, totalChanged: 0 }
  );
  const latest = entries.find((e) => e.date)?.date ?? '';

  return (
    <aside className="rounded-xl border border-border p-4 bg-card/80">
      <h3 className="font-semibold text-text mb-3">Changelog Stats</h3>
      <dl className="space-y-2 text-sm text-subtle">
        <div className="flex justify-between">
          <dt>Versions:</dt>
          <dd className="font-medium text-text">{stats.totalVersions}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Added:</dt>
          <dd className="font-medium text-text">{stats.totalAdded}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Fixed:</dt>
          <dd className="font-medium text-text">{stats.totalFixed}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Changed:</dt>
          <dd className="font-medium text-text">{stats.totalChanged}</dd>
        </div>
      </dl>
      {latest && (
        <p className="mt-3 pt-3 border-t border-border text-xs text-subtle">
          Last update: {latest}
        </p>
      )}
    </aside>
  );
}
