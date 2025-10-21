"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiBase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  async function loadLeaderboards() {
    setLoading(true);

    // Load groups
    const groupsRes = await apiFetch("/api/groups");
    if ((groupsRes as any).ok && (groupsRes as any).data?.groups) {
      setGroups((groupsRes as any).data.groups.slice(0, 10));
    }

    // Load users (mock for now, will be real API later)
    const names = ['Alex', 'Jordan', 'Sam', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Avery', 'Quinn', 'Parker'];
    setUsers(names.map((name, index) => ({
      id: `user-${index}`,
      username: name,
      level: Math.max(1, 10 - index),
      xp: Math.max(100, 5000 - index * 500),
      gold: Math.max(50, 1000 - index * 100),
      tasksCompleted: Math.max(5, 50 - index * 5),
    })));

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text text-xl">Loading leaderboards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text mb-2">Leaderboard 🏆</h1>
          <p className="text-subtle">
            Top players and totems ranked by performance
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="players" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="players">🏃 Players</TabsTrigger>
            <TabsTrigger value="groups">🔥 Totems</TabsTrigger>
          </TabsList>

          {/* Players Tab */}
          <TabsContent value="players">
            <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-xl">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-bg border-b border-border">
            <div className="text-sm font-bold text-accent">Rank</div>
            <div className="text-sm font-bold text-accent col-span-2">Username</div>
            <div className="text-sm font-bold text-accent text-right">Level</div>
            <div className="text-sm font-bold text-accent text-right">XP</div>
            <div className="text-sm font-bold text-accent text-right">Tasks</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border">
            {users.map((user, index) => {
              const rank = index + 1;
              const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

              return (
                <div
                  key={user.id}
                  className={`grid grid-cols-6 gap-4 px-6 py-4 hover:bg-bg/50 transition ${
                    rank <= 3 ? 'bg-accent/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-text font-bold">#{rank}</span>
                    {medalEmoji && <span className="text-xl">{medalEmoji}</span>}
                  </div>
                  <div className="col-span-2 font-medium text-text">{user.username}</div>
                  <div className="text-right text-subtle">Lv. {user.level}</div>
                  <div className="text-right font-bold text-accent">{user.xp.toLocaleString()}</div>
                  <div className="text-right text-subtle">{user.tasksCompleted}</div>
                </div>
              );
            })}
          </div>
            </div>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups">
            <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-xl">
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-bg border-b border-border">
                <div className="text-sm font-bold text-accent">Rank</div>
                <div className="text-sm font-bold text-accent col-span-2">Totem</div>
                <div className="text-sm font-bold text-accent text-right">Total XP</div>
                <div className="text-sm font-bold text-accent text-right">Avg Karma</div>
                <div className="text-sm font-bold text-accent text-right">Members</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-border">
                {groups.length > 0 ? (
                  groups.map((group, index) => {
                    const rank = index + 1;
                    const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

                    return (
                      <div
                        key={group.id}
                        className={`grid grid-cols-6 gap-4 px-6 py-4 hover:bg-bg/50 transition ${
                          rank <= 3 ? 'bg-accent/5' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-text font-bold">#{rank}</span>
                          {medalEmoji && <span className="text-xl">{medalEmoji}</span>}
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                          <span className="text-2xl">{group.emblem}</span>
                          <div>
                            <div className="font-medium text-text">{group.name}</div>
                            {group.weeklyBonus && (
                              <div className="text-xs text-yellow-500">🏆 Weekly Champion</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right font-bold text-accent">{group.totalXp.toLocaleString()}</div>
                        <div className="text-right text-subtle">
                          {group.avgKarma > 0 ? `+${group.avgKarma}` : group.avgKarma}
                        </div>
                        <div className="text-right text-subtle">
                          {group.groupMembers?.length || 0}/{group.maxMembers}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-12 text-center text-subtle">
                    No totems yet. Be the first to create one!
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Demo Notice */}
        <div className="mt-6 bg-card border border-border rounded-lg p-4">
          <p className="text-subtle text-sm text-center">
            📊 Leaderboards update in real-time based on totem activity
          </p>
        </div>
      </div>
    </div>
  );
}
