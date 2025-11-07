"use client";

interface ClanLeaderboardProps {
  clans: Array<{
    id: string;
    name: string;
    leader: {
      id: string;
      name: string;
      image: string | null;
    };
    memberCount: number;
    buffType: string;
    stats: {
      xpTotal: number;
      activityScore: number;
      rank: number;
      updatedAt: string;
    } | null;
  }>;
  limit?: number;
}

export function ClanLeaderboard({ clans, limit = 10 }: ClanLeaderboardProps) {
  const topClans = clans
    .filter((c) => c.stats)
    .sort((a, b) => (a.stats?.rank || 9999) - (b.stats?.rank || 9999))
    .slice(0, limit);

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold mb-3">🏆 Clan Leaderboard</h3>
      {topClans.length === 0 ? (
        <div className="text-sm text-gray-500">No clans ranked yet</div>
      ) : (
        <div className="space-y-2">
          {topClans.map((clan, index) => (
            <div
              key={clan.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="text-xl font-bold text-gray-400 w-8 text-center">
                  #{clan.stats?.rank || index + 1}
                </div>
                <div>
                  <div className="font-semibold">{clan.name}</div>
                  <div className="text-xs text-gray-500">
                    Leader: {clan.leader.name} • {clan.memberCount}/5 members
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{clan.stats?.xpTotal || 0} XP</div>
                <div className="text-xs text-gray-500">{clan.stats?.activityScore || 0} activity</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

