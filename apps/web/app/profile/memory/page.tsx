"use client";
import { MemoryEntryCard } from '@/components/memory/MemoryEntryCard';
import { MemoryTimeline } from '@/components/memory/MemoryTimeline';
import { useLatestMemory, useMemoryArchive, useGenerateMemory } from '@parel/core/hooks/useMemory';

export default function MemoryPage() {
  const { entry, loading, error, reload } = useLatestMemory();
  const { entries, loading: loadingAll, error: errorAll, loadMore, nextCursor, reload: reloadAll } = useMemoryArchive();
  const { generate, loading: generating, error: genError } = useGenerateMemory();

  const regenerate = async () => {
    const ok = await generate();
    if (ok) { reload(); reloadAll(); }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      <h2 className="text-2xl font-bold">My Chronicle</h2>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {genError && <div className="text-red-600 text-sm">{genError}</div>}
      <div className="flex gap-2">
        <button className="px-3 py-1 border rounded" onClick={regenerate} disabled={generating}>{generating ? 'Generating…' : 'Generate New Chronicle'}</button>
      </div>
      {loading ? <div>Loading…</div> : <MemoryEntryCard entry={entry} />}

      <div className="rounded border p-4">
        <h3 className="font-semibold mb-2">Archive</h3>
        {errorAll && <div className="text-red-600 text-sm">{errorAll}</div>}
        {loadingAll ? <div>Loading…</div> : <MemoryTimeline entries={entries} />}
        {nextCursor ? <button className="mt-2 px-3 py-1 border rounded" onClick={loadMore}>Load More</button> : null}
      </div>
    </div>
  );
}


