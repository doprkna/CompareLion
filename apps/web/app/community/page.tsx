"use client";
import { useState } from 'react';
import { useCommunityCreations, useLikeCreation } from '@/hooks/useCommunity';
import { CommunityCard } from '@/components/community/CommunityCard';

export default function CommunityPage() {
  const [type, setType] = useState<string | null>(null);
  const { creations, loading, error, reload } = useCommunityCreations(type);
  const { like, loading: liking } = useLikeCreation();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const handleLike = async (creationId: string) => {
    if (likedIds.has(creationId)) return;
    try {
      await like(creationId);
      setLikedIds(new Set([...likedIds, creationId]));
      reload();
    } catch (e) {
      console.error('Failed to like', e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Community Creations</h2>
        <a
          href="/community/submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Submit Creation
        </a>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setType(null)}
          className={`px-4 py-2 rounded ${
            type === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setType('question')}
          className={`px-4 py-2 rounded ${
            type === 'question'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Questions
        </button>
        <button
          onClick={() => setType('mission')}
          className={`px-4 py-2 rounded ${
            type === 'mission'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Missions
        </button>
        <button
          onClick={() => setType('item')}
          className={`px-4 py-2 rounded ${
            type === 'item'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Items
        </button>
        <button
          onClick={() => setType('other')}
          className={`px-4 py-2 rounded ${
            type === 'other'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Other
        </button>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="space-y-4">
        {creations.map((creation) => (
          <CommunityCard
            key={creation.id}
            creation={creation}
            onLike={handleLike}
            liked={likedIds.has(creation.id)}
            liking={liking}
          />
        ))}
      </div>

      {creations.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          No creations found. Be the first to submit!
        </div>
      )}
    </div>
  );
}
