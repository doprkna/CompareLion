import Link from 'next/link';

export function PollCard({ poll }: { poll: any }) {
  return (
    <div className="rounded border p-4">
      <div className="text-xs text-gray-500 mb-1">{poll.region || 'GLOBAL'} • {new Date(poll.createdAt).toLocaleDateString()}</div>
      <h3 className="text-lg font-semibold">{poll.title}</h3>
      <p className="text-sm text-gray-700">{poll.question}</p>
      <div className="mt-2">
        <Link className="text-blue-600 hover:underline" href={`/polls/${poll.id}`}>Vote</Link>
      </div>
    </div>
  );
}


