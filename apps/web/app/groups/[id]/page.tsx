"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGroup, useGroupStats, useGroupReflections } from '@parel/core/hooks/useGroups';
import { GroupLeaderboard } from '@/components/groups/GroupLeaderboard';
import { GroupReflectionList } from '@/components/groups/GroupReflectionList';

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { group, loading: groupLoading, error: groupError, reload: reloadGroup } = useGroup(id);
  const { stats, loading: statsLoading, error: statsError, reload: reloadStats } = useGroupStats(id);
  const { data: reflections, loading: reflLoading, error: reflError, reload: reloadRefl } = useGroupReflections(id);
  const [joinLoading, setJoinLoading] = useState(false);

  const canJoin = group && group.visibility === 'public';

  const join = async () => {
    if (!id) return;
    setJoinLoading(true);
    try {
      const res = await fetch(`/api/groups/${id}/join`, { method: 'POST' });
      if (res.ok) {
        reloadGroup();
        reloadStats();
        reloadRefl();
      }
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      {groupLoading ? <div>Loading…</div> : null}
      {groupError ? <div className="text-red-600 text-sm">{groupError}</div> : null}
      {group ? (
        <div className="rounded border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{group.name}</h2>
            {canJoin ? (
              <button className="px-3 py-1 border rounded" onClick={join} disabled={joinLoading}>
                {joinLoading ? 'Joining…' : 'Join'}
              </button>
            ) : null}
          </div>
          {group.description ? <p className="text-sm text-gray-600 mt-1">{group.description}</p> : null}
          <div className="text-xs text-gray-500 mt-2">{group.visibility} • {group.transparency} • {group.memberCount} members</div>
        </div>
      ) : null}

      <GroupLeaderboard stats={stats ? { totalXP: stats.totalXP, avgLevel: stats.avgLevel, memberCount: stats.memberCount, reflections: stats.reflections } : null} />

      <div className="rounded border p-4">
        <h4 className="font-semibold mb-2">Shared Reflections</h4>
        {reflLoading ? <div>Loading…</div> : null}
        {reflError ? <div className="text-red-600 text-sm">{reflError}</div> : null}
        <GroupReflectionList data={Array.isArray(reflections) ? reflections : (reflections as any)} />
      </div>
    </div>
  );
}













