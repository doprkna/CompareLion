"use client";
import { useParams } from 'next/navigation';
import { usePack } from '@parel/core/hooks/usePacks';

export default function PackDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { pack, loading, error, reload } = usePack(id);

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {pack && (
        <>
          <div className="rounded border p-4">
            <div className="text-xs text-gray-500 mb-1">{pack.category || 'general'} • {pack.owned ? 'owned' : `price: ${pack.price}`}</div>
            <h2 className="text-xl font-bold">{pack.title}</h2>
            {pack.description ? <p className="text-sm text-gray-700">{pack.description}</p> : null}
          </div>
          <div className="rounded border p-4">
            <h4 className="font-semibold mb-2">Included Items</h4>
            {!pack.owned ? (
              <div className="text-sm text-gray-600">Unlock this pack to view items.</div>
            ) : (
              <ul className="list-disc pl-5 text-sm">
                {pack.items?.map((it: any) => (
                  <li key={it.id}><span className="text-gray-500">[{it.type}]</span> {it.refId || ''}</li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}


