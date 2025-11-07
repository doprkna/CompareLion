"use client";

interface FactionCardProps {
  faction: {
    id: string;
    key: string;
    name: string;
    motto?: string;
    description?: string;
    colorPrimary: string;
    colorSecondary?: string;
    buffType?: string;
    buffValue?: number;
    influence: number;
    membersCount: number;
  };
  userFaction?: any;
  onJoin?: (factionId: string) => void;
  joining?: boolean;
}

export function FactionCard({ faction, userFaction, onJoin, joining }: FactionCardProps) {
  const isMember = userFaction?.factionId === faction.id;
  const canJoin = !userFaction || (userFaction && !isMember);

  return (
    <div 
      className="rounded border p-4 mb-4"
      style={{ 
        borderColor: faction.colorPrimary,
        borderWidth: isMember ? '2px' : '1px',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold mb-1" style={{ color: faction.colorPrimary }}>
            {faction.name}
          </h3>
          {faction.motto && (
            <p className="text-sm text-gray-600 italic mb-2">{faction.motto}</p>
          )}
        </div>
        {isMember && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
            Your Faction
          </span>
        )}
      </div>

      {faction.description && (
        <p className="text-sm text-gray-700 mb-3">{faction.description}</p>
      )}

      <div className="flex items-center gap-4 mb-3 text-sm">
        <div>
          <span className="text-gray-600">Influence: </span>
          <span className="font-semibold">{Math.round(faction.influence)}</span>
        </div>
        <div>
          <span className="text-gray-600">Members: </span>
          <span className="font-semibold">{faction.membersCount}</span>
        </div>
        {faction.buffType && (
          <div>
            <span className="text-gray-600">Buff: </span>
            <span className="font-semibold">
              +{((faction.buffValue || 1) - 1) * 100}% {faction.buffType}
            </span>
          </div>
        )}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${Math.min(100, (faction.influence / 1000) * 100)}%`,
            backgroundColor: faction.colorPrimary,
          }}
        />
      </div>

      {canJoin && onJoin && (
        <button
          onClick={() => onJoin(faction.id)}
          disabled={joining}
          className="w-full px-4 py-2 rounded text-white hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: faction.colorPrimary }}
        >
          {joining ? 'Joining...' : 'Join Faction'}
        </button>
      )}
    </div>
  );
}

