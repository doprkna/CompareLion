import Link from 'next/link';

export function PackCard({ pack, onUnlock }: { pack: any; onUnlock?: (id: string) => void }) {
  const owned = !!pack.owned;
  return (
    <div className="rounded border p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{pack.title}</h3>
        <span className="text-xs" style={{ color: pack.themeColor || '#666' }}>{pack.icon || ''}</span>
      </div>
      {pack.description ? <p className="text-sm text-gray-600">{pack.description}</p> : null}
      <div className="text-xs text-gray-500">{pack.category || 'general'} • {owned ? 'owned' : `price: ${pack.price}`}</div>
      <div className="flex gap-3">
        <Link className="text-blue-600 hover:underline" href={`/packs/${pack.id}`}>Open</Link>
        {!owned && onUnlock ? (
          <button className="px-3 py-1 border rounded" onClick={() => onUnlock(pack.id)}>Unlock</button>
        ) : null}
      </div>
    </div>
  );
}


