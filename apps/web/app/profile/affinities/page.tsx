"use client";
import { useSession } from 'next-auth/react';
import { useAffinities, useAffinityActions } from '@parel/core/hooks/useAffinities';
import { AffinityCard } from '@/components/affinity/AffinityCard';

export default function AffinitiesPage() {
  const { data: session } = useSession();
  const meEmail = session?.user?.email || null;
  const { affinities, loading, error, reload } = useAffinities();
  const { request, accept, remove, loading: acting, error: actError } = useAffinityActions();

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Affinities</h2>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {actError && <div className="text-red-600 text-sm">{actError}</div>}

      <div className="grid gap-2">
        {affinities.map((a) => (
          <AffinityCard key={a.id} item={a} />
        ))}
      </div>
    </div>
  );
}


