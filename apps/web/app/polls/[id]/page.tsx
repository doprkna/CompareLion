"use client";
import { useParams } from 'next/navigation';
import { usePoll } from '@/hooks/usePolls';
import { PollVotePanel } from '@/components/polls/PollVotePanel';
import { PollResultsChart } from '@/components/polls/PollResultsChart';

export default function PollDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { poll, stats, loading, error, reload } = usePoll(id);

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {poll && (
        <>
          <div className="rounded border p-4">
            <div className="text-xs text-gray-500 mb-1">{poll.region || 'GLOBAL'} • {new Date(poll.createdAt).toLocaleString()}</div>
            <h2 className="text-xl font-bold">{poll.title}</h2>
            <p className="text-sm text-gray-700">{poll.question}</p>
          </div>
          <PollVotePanel poll={poll} onVoted={reload} />
          <PollResultsChart poll={poll} stats={stats} />
        </>
      )}
    </div>
  );
}


