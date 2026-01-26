"use client";
import { useState } from 'react';
import { useFactions, useJoinFaction } from '@parel/core/hooks/useFactions';
import { FactionCard } from '@/components/factions/FactionCard';
import { FactionBuffBar } from '@/components/factions/FactionBuffBar';
import { useFactionMap } from '@parel/core/hooks/useFactions';
import { FactionInfluenceMap } from '@/components/factions/FactionInfluenceMap';

export default function FactionsPage() {
  const { factions, userFaction, loading, error, reload } = useFactions();
  const { map, loading: mapLoading } = useFactionMap();
  const { join, loading: joining, error: joinError } = useJoinFaction();
  const [activeTab, setActiveTab] = useState<'factions' | 'map'>('factions');

  const handleJoin = async (factionId: string) => {
    try {
      await join(factionId);
      reload();
      if (joinError) {
        alert(joinError);
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to join faction');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Factions</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('factions')}
            className={`px-4 py-2 rounded ${
              activeTab === 'factions'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Factions
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded ${
              activeTab === 'map'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Influence Map
          </button>
        </div>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}

      {activeTab === 'factions' && (
        <>
          {userFaction && (
            <FactionBuffBar userFaction={userFaction} />
          )}

          <div className="grid gap-4">
            {factions.map((faction) => (
              <FactionCard
                key={faction.id}
                faction={faction}
                userFaction={userFaction}
                onJoin={handleJoin}
                joining={joining}
              />
            ))}
          </div>
        </>
      )}

      {activeTab === 'map' && (
        <div>
          {mapLoading && <div>Loading map…</div>}
          {map && <FactionInfluenceMap map={map} />}
        </div>
      )}
    </div>
  );
}

