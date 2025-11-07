"use client";

interface FactionBuffBarProps {
  userFaction: {
    factionId: string;
    contributedXP: number;
    isLeader?: boolean;
    faction: {
      name: string;
      colorPrimary: string;
      buffType?: string;
      buffValue?: number;
    };
  };
  rank?: number;
  totalMembers?: number;
}

export function FactionBuffBar({ userFaction, rank, totalMembers }: FactionBuffBarProps) {
  const buffType = userFaction.faction.buffType;
  const buffValue = userFaction.faction.buffValue || 1;
  const buffPercent = ((buffValue - 1) * 100).toFixed(1);

  return (
    <div 
      className="rounded border p-4 mb-4"
      style={{ borderColor: userFaction.faction.colorPrimary }}
    >
      <h4 className="font-semibold mb-2" style={{ color: userFaction.faction.colorPrimary }}>
        Your Faction: {userFaction.faction.name}
      </h4>

      <div className="space-y-2 text-sm mb-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Your Contribution:</span>
          <span className="font-semibold">{userFaction.contributedXP} XP</span>
        </div>
        {rank !== undefined && totalMembers !== undefined && (
          <div className="flex justify-between">
            <span className="text-gray-600">Your Rank:</span>
            <span className="font-semibold">#{rank} / {totalMembers}</span>
          </div>
        )}
        {buffType && (
          <div className="flex justify-between">
            <span className="text-gray-600">Active Buff:</span>
            <span className="font-semibold text-green-600">
              +{buffPercent}% {buffType.toUpperCase()}
            </span>
          </div>
        )}
        {userFaction.isLeader && (
          <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded inline-block">
            Leader
          </div>
        )}
      </div>
    </div>
  );
}

