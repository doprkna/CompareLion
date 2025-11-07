"use client";
import { useState, useEffect } from 'react';
import { RarityFrame } from './RarityFrame';
import { RarityLabel } from './RarityLabel';

interface RarityPreviewListProps {
  onSeed?: () => Promise<void>;
  loading?: boolean;
}

export function RarityPreviewList({ onSeed, loading }: RarityPreviewListProps) {
  const [rarities, setRarities] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRarities = async () => {
    setLoadingList(true);
    setError(null);
    try {
      const res = await fetch('/api/rarities', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load rarities');
      setRarities(json.rarities || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load rarities');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadRarities();
  }, []);

  if (loadingList) {
    return <div className="text-center py-8 text-gray-500">Loading rarities...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-sm">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Rarity Tiers</h3>
        {onSeed && (
          <button
            onClick={onSeed}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Seeding...' : 'Seed Base Rarities'}
          </button>
        )}
      </div>

      {rarities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No rarities found. Click "Seed Base Rarities" to create them.
        </div>
      )}

      <div className="grid gap-4">
        {rarities.map((rarity) => (
          <RarityFrame key={rarity.id} rarity={rarity}>
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <RarityLabel rarity={rarity} />
                  <span className="text-sm text-gray-600">Rank #{rarity.rankOrder}</span>
                </div>
              </div>
              {rarity.description && (
                <p className="text-sm text-gray-700 mb-2">{rarity.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div>
                  <span className="font-semibold">Color: </span>
                  <span
                    className="inline-block w-4 h-4 rounded border"
                    style={{ backgroundColor: rarity.colorPrimary }}
                  />
                  <span className="ml-1">{rarity.colorPrimary}</span>
                </div>
                {rarity.colorGlow && (
                  <div>
                    <span className="font-semibold">Glow: </span>
                    <span
                      className="inline-block w-4 h-4 rounded border"
                      style={{ backgroundColor: rarity.colorGlow }}
                    />
                    <span className="ml-1">{rarity.colorGlow}</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold">Style: </span>
                  <span className="capitalize">{rarity.frameStyle || 'solid'}</span>
                </div>
              </div>
            </div>
          </RarityFrame>
        ))}
      </div>
    </div>
  );
}

