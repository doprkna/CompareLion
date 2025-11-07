export function PollResultsChart({ poll, stats }: { poll: any; stats: { total: number; optionCounts: number[]; freetextCount: number } | null }) {
  if (!stats) return null;
  const total = stats.total || 0;
  return (
    <div className="rounded border p-4">
      <h4 className="font-semibold mb-2">Results</h4>
      <div className="flex flex-col gap-2">
        {poll.options?.map((opt: string, idx: number) => {
          const count = stats.optionCounts[idx] || 0;
          const pct = total ? Math.round((count / total) * 100) : 0;
          return (
            <div key={idx} className="text-sm">
              <div className="flex justify-between">
                <span>{opt}</span>
                <span>{count} ({pct}%)</span>
              </div>
              <div className="h-2 bg-gray-200 rounded"><div className="h-2 bg-blue-500 rounded" style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
        {stats.freetextCount ? <div className="text-xs text-gray-500">Freetext responses: {stats.freetextCount}</div> : null}
      </div>
    </div>
  );
}


