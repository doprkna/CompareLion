/**
 * Admin Ads Management Page
 * v0.36.22 - Ads Integration
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/apiBase';
import { useRouter } from 'next/navigation';

interface AdsLog {
  id: string;
  userId: string;
  type: string;
  createdAt: string;
  user?: {
    email: string;
    name: string | null;
  };
}

export default function AdminAdsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<AdsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [rewardXp, setRewardXp] = useState(20);
  const [rewardGold, setRewardGold] = useState(10);

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/admin');
      return;
    }

    loadLogs();
  }, [session, router]);

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/ads/logs');
      if ((res as any).ok && (res as any).data?.logs) {
        setLogs((res as any).data.logs);
      }
    } catch (error) {
      console.error('Failed to load ads logs', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Ads Management</h1>
          <p className="text-gray-400">Manage ad settings and view reward logs</p>
        </div>

        {/* Reward Settings */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Reward Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">XP Reward</label>
              <input
                type="number"
                value={rewardXp}
                onChange={(e) => setRewardXp(parseInt(e.target.value) || 20)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Gold Reward</label>
              <input
                type="number"
                value={rewardGold}
                onChange={(e) => setRewardGold(parseInt(e.target.value) || 10)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded"
              />
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white">
            Save Settings
          </button>
        </div>

        {/* Recent Logs */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Reward Logs</h2>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="text-gray-400">No logs yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-2 text-gray-400">User</th>
                    <th className="p-2 text-gray-400">Type</th>
                    <th className="p-2 text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-700">
                      <td className="p-2 text-white">{log.user?.email || log.userId}</td>
                      <td className="p-2 text-white">{log.type.toUpperCase()}</td>
                      <td className="p-2 text-gray-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


