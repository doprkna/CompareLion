'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { apiFetch } from '@/lib/apiBase';

const ReportsCharts = dynamic(() => import('./ReportsCharts'), {
  ssr: false,
  loading: () => (
    <div className="bg-card border-2 border-border rounded-xl p-6 space-y-8">
      <div className="h-80 animate-pulse bg-bg rounded-lg" />
      <div className="h-96 animate-pulse bg-bg rounded-lg" />
    </div>
  ),
});

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#a855f7", "#ec4899", "#14b8a6", "#f97316"];

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await apiFetch("/api/reports");
      if ((res as any).ok && (res as any).data) {
        setData((res as any).data);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text text-xl">Loading reports...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-destructive text-xl">Failed to load reports</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-text mb-2">📊 Reports & Analytics</h1>
          <p className="text-subtle">System statistics and user insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <div className="text-subtle text-sm mb-2">Total Users</div>
            <div className="text-4xl font-bold text-accent">{data.stats.usersCount}</div>
          </div>
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <div className="text-subtle text-sm mb-2">Total Messages</div>
            <div className="text-4xl font-bold text-accent">{data.stats.messagesCount}</div>
          </div>
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <div className="text-subtle text-sm mb-2">Flow Questions</div>
            <div className="text-4xl font-bold text-accent">{data.stats.flowQuestionsCount}</div>
          </div>
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <div className="text-subtle text-sm mb-2">Average XP</div>
            <div className="text-4xl font-bold text-accent">{data.stats.avgXP}</div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <div className="text-subtle text-sm mb-2">Recent Messages (7 days)</div>
            <div className="text-3xl font-bold text-text">{data.stats.recentMessages}</div>
          </div>
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <div className="text-subtle text-sm mb-2">Recent Responses (7 days)</div>
            <div className="text-3xl font-bold text-text">{data.stats.recentResponses}</div>
          </div>
        </div>

        {/* Charts (recharts loaded dynamically) */}
        <ReportsCharts
          xpDistribution={data.xpDistribution}
          topUsers={data.topUsers}
        />

        {/* Top Users Table */}
        <div className="bg-card border-2 border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-text mb-6">Leaderboard Rankings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b-2 border-border">
                <tr>
                  <th className="text-left py-3 px-4 text-accent font-bold">Rank</th>
                  <th className="text-left py-3 px-4 text-accent font-bold">User</th>
                  <th className="text-right py-3 px-4 text-accent font-bold">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.topUsers.map((user: any) => (
                  <tr key={user.rank} className="hover:bg-bg/50 transition">
                    <td className="py-3 px-4 text-text font-bold">
                      #{user.rank}
                      {user.rank === 1 && ' 🥇'}
                      {user.rank === 2 && ' 🥈'}
                      {user.rank === 3 && ' 🥉'}
                    </td>
                    <td className="py-3 px-4 text-text">{user.name}</td>
                    <td className="py-3 px-4 text-right text-accent font-bold">
                      {user.xp.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-subtle text-sm text-center">
            📊 Real-time data from database - updates when you refresh the page
          </p>
        </div>
      </div>
    </div>
  );
}













