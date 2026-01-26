/**
 * Admin Season Management Page
 * v0.36.23 - Season Pass System
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/apiBase';
import { useRouter } from 'next/navigation';

interface Season {
  id: string;
  name: string;
  seasonNumber: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export default function AdminSeasonPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/admin');
      return;
    }

    loadSeasons();
  }, [session, router]);

  async function loadSeasons() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/season/list');
      if ((res as any).ok && (res as any).data?.seasons) {
        setSeasons((res as any).data.seasons);
      }
    } catch (error) {
      console.error('Failed to load seasons', error);
    } finally {
      setLoading(false);
    }
  }

  async function createSeason() {
    setCreating(true);
    try {
      const res = await apiFetch('/api/admin/season/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seasonNumber: seasons.length + 1,
        }),
      });

      if ((res as any).ok) {
        loadSeasons();
      }
    } catch (error) {
      console.error('Failed to create season', error);
    } finally {
      setCreating(false);
    }
  }

  async function activateSeason(seasonId: string) {
    try {
      const res = await apiFetch('/api/admin/season/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seasonId }),
      });

      if ((res as any).ok) {
        loadSeasons();
      }
    } catch (error) {
      console.error('Failed to activate season', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Season Management</h1>
            <p className="text-gray-400">Manage seasons and tiers</p>
          </div>
          <button
            onClick={createSeason}
            disabled={creating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create New Season'}
          </button>
        </div>

        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : seasons.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">No seasons yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seasons.map((season) => (
              <div
                key={season.id}
                className={`bg-gray-800 rounded-lg p-6 border-2 ${
                  season.isActive ? 'border-purple-600' : 'border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">{season.name}</h2>
                  {season.isActive && (
                    <span className="px-2 py-1 bg-green-600 rounded text-white text-xs">Active</span>
                  )}
                </div>
                <div className="space-y-2 text-sm text-gray-400">
                  <div>Season #{season.seasonNumber}</div>
                  <div>Starts: {new Date(season.startsAt).toLocaleDateString()}</div>
                  <div>Ends: {new Date(season.endsAt).toLocaleDateString()}</div>
                </div>
                <div className="mt-4 flex gap-2">
                  {!season.isActive && (
                    <button
                      onClick={() => activateSeason(season.id)}
                      className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm"
                    >
                      Activate
                    </button>
                  )}
                  <a
                    href={`/admin/season/${season.id}`}
                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm text-center"
                  >
                    Edit
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


