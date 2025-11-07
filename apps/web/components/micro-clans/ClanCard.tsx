"use client";

interface ClanCardProps {
  clan: {
    id: string;
    name: string;
    description?: string;
    leader: {
      id: string;
      name: string;
      image: string | null;
    };
    memberCount: number;
    buffType: 'xp' | 'gold' | 'karma' | 'compare' | 'reflect';
    buffValue: number;
    stats: {
      xpTotal: number;
      activityScore: number;
      rank: number;
      updatedAt: string;
    } | null;
    seasonId?: string;
    createdAt: string;
  };
  onClick?: (clanId: string) => void;
}

export function ClanCard({ clan, onClick }: ClanCardProps) {
  const buffLabels: Record<string, { label: string; color: string }> = {
    xp: { label: 'XP Boost', color: 'bg-blue-100 text-blue-700' },
    gold: { label: 'Gold Boost', color: 'bg-yellow-100 text-yellow-700' },
    karma: { label: 'Karma Boost', color: 'bg-purple-100 text-purple-700' },
    compare: { label: 'Compare Boost', color: 'bg-green-100 text-green-700' },
    reflect: { label: 'Reflection Boost', color: 'bg-indigo-100 text-indigo-700' },
  };

  const buffInfo = buffLabels[clan.buffType] || { label: clan.buffType, color: 'bg-gray-100 text-gray-700' };
  const buffPercent = ((clan.buffValue - 1) * 100).toFixed(0);

  return (
    <div
      className={`rounded border-2 border-gray-300 p-4 mb-4 bg-white hover:border-blue-400 transition ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={() => onClick?.(clan.id)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{clan.name}</h3>
          {clan.stats && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              #{clan.stats.rank}
            </span>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded capitalize ${buffInfo.color}`}>
          {buffInfo.label} +{buffPercent}%
        </span>
      </div>

      {clan.description && (
        <p className="text-sm text-gray-600 mb-3">{clan.description}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          {clan.leader.image && (
            <img
              src={clan.leader.image}
              alt={clan.leader.name}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span>Leader: {clan.leader.name}</span>
        </div>
        <span>👥 {clan.memberCount}/5 members</span>
        {clan.stats && (
          <span>⚡ {clan.stats.activityScore} activity</span>
        )}
      </div>
    </div>
  );
}

