import { useState } from 'react';

export function PollVotePanel({ poll, onVoted }: { poll: any; onVoted: () => void }) {
  const [optionIdx, setOptionIdx] = useState<number | null>(null);
  const [freetext, setFreetext] = useState('');
  const [loading, setLoading] = useState(false);
  const canFreetext = !!poll.allowFreetext;

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/polls/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId: poll.id, optionIdx: optionIdx ?? undefined, freetext: freetext || undefined })
      });
      if (res.ok) onVoted();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded border p-4 flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        {poll.options?.map((opt: string, idx: number) => (
          <label key={idx} className="flex items-center gap-2 text-sm">
            <input type="radio" name="opt" checked={optionIdx === idx} onChange={() => setOptionIdx(idx)} />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      {canFreetext && (
        <textarea className="border rounded p-2 text-sm" placeholder="Your answer..." value={freetext} onChange={e => setFreetext(e.target.value)} />
      )}
      <button className="px-3 py-1 border rounded" disabled={loading} onClick={submit}>{loading ? 'Submitting…' : 'Submit'}</button>
    </div>
  );
}


