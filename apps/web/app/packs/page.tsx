"use client";
import { usePacks } from '@/hooks/usePacks';
import { useUnlockPack } from '@/hooks/usePacks';
import { PackCard } from '@/components/packs/PackCard';

export default function PacksPage() {
  const { packs, loading, error, reload } = usePacks();
  const { unlock, loading: unlocking } = useUnlockPack();

  const onUnlock = async (id: string) => {
    if (unlocking) return;
    const ok = await unlock(id);
    if (ok) reload();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Content Packs</h2>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="grid gap-3">
        {packs.map((p) => (<PackCard key={p.id} pack={p} onUnlock={onUnlock} />))}
      </div>
    </div>
  );
}


