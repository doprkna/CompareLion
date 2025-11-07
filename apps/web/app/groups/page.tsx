'use client';

import { GroupCard } from '@/components/groups/GroupCard';
import { useGroups } from '@/hooks/useGroups';

export default function GroupsPage() {
  // Client component for simplicity to reuse hooks
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { groups, loading, error } = useGroups();

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Your Groups</h2>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="grid gap-3">
        {groups.map((g) => (
          <GroupCard key={g.id} id={g.id} name={g.name} description={g.description} visibility={g.visibility} transparency={g.transparency} role={g.role} />
        ))}
      </div>
    </div>
  );
}













