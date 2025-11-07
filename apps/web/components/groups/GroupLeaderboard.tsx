interface Props {
  stats: {
    totalXP: number;
    reflections: number;
    avgLevel: number;
    memberCount: number;
  } | null;
}

export function GroupLeaderboard({ stats }: Props) {
  if (!stats) return null;
  return (
    <div className="rounded border p-4">
      <h4 className="font-semibold mb-2">Group Stats</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Total XP: <span className="font-medium">{stats.totalXP}</span></div>
        <div>Avg Level: <span className="font-medium">{stats.avgLevel}</span></div>
        <div>Members: <span className="font-medium">{stats.memberCount}</span></div>
        <div>Reflections: <span className="font-medium">{stats.reflections}</span></div>
      </div>
    </div>
  );
}


