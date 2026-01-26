"use client";
import { usePolls } from '@parel/core/hooks/usePolls';
import { PollCard } from '@/components/polls/PollCard';

export default function PollsPage() {
  const { polls, loading, error } = usePolls();
  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Polls</h2>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="grid gap-3">
        {polls.map((p) => (<PollCard key={p.id} poll={p} />))}
      </div>
    </div>
  );
}


