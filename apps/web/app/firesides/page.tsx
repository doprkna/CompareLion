"use client";
import { useFiresides } from '@parel/core/hooks/useFiresides';
import { FiresideCard } from '@/components/firesides/FiresideCard';

export default function FiresidesPage() {
  const { firesides, loading, error } = useFiresides();
  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Firesides</h2>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="grid gap-3">
        {firesides.map((f) => (<FiresideCard key={f.id} f={f} />))}
      </div>
    </div>
  );
}


