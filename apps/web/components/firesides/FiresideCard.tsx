import Link from 'next/link';

export function FiresideCard({ f }: { f: any }) {
  const timeLeftMs = new Date(f.expiresAt).getTime() - Date.now();
  const hours = Math.max(0, Math.floor(timeLeftMs / (1000 * 60 * 60)));
  return (
    <div className="rounded border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{f.title || 'Fireside'}</h3>
        <span className="text-xs text-gray-500">{hours}h left</span>
      </div>
      <div className="text-xs text-gray-500">Participants: {f.participantIds?.length || 0}</div>
      <div className="mt-2">
        <Link className="text-blue-600 hover:underline" href={`/firesides/${f.id}`}>Open</Link>
      </div>
    </div>
  );
}


