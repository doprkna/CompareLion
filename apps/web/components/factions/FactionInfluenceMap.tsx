"use client";

interface FactionInfluenceMapProps {
  map: Record<string, {
    region: string;
    topFaction: {
      factionId: string;
      name: string;
      key: string;
      colorPrimary: string;
      colorSecondary?: string;
      influenceScore: number;
    };
    allFactions: Array<{
      name: string;
      influence: number;
      contributions: number;
    }>;
  }>;
}

export function FactionInfluenceMap({ map }: FactionInfluenceMapProps) {
  const regions = Object.keys(map);

  if (regions.length === 0) {
    return (
      <div className="rounded border p-6 text-center text-gray-500">
        No faction influence data available
      </div>
    );
  }

  return (
    <div className="rounded border p-4">
      <h3 className="text-lg font-semibold mb-4">Regional Influence Map</h3>
      <div className="grid gap-4">
        {regions.map((region) => {
          const data = map[region];
          const topFaction = data.topFaction;

          return (
            <div key={region} className="rounded border p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{region}</h4>
                <div 
                  className="px-3 py-1 rounded text-white text-sm"
                  style={{ backgroundColor: topFaction.colorPrimary }}
                >
                  {topFaction.name}
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (topFaction.influenceScore / 1000) * 100)}%`,
                    backgroundColor: topFaction.colorPrimary,
                  }}
                />
              </div>

              <div className="text-xs text-gray-600">
                Influence: {Math.round(topFaction.influenceScore)} | Top Faction: {topFaction.name}
              </div>

              {data.allFactions.length > 1 && (
                <div className="mt-2 text-xs">
                  <details>
                    <summary className="cursor-pointer text-gray-600">All Factions</summary>
                    <div className="mt-2 space-y-1">
                      {data.allFactions.map((faction, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{faction.name}</span>
                          <span className="font-semibold">{Math.round(faction.influence)}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

