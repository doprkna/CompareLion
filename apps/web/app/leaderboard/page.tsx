"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/apiBase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Share2, Trophy, Flame } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface LeaderboardUser {
  id: string;
  displayName: string;
  xp: number;
  level: number;
  streakCount: number;
  rank: number;
  avatarUrl?: string | null;
  image?: string | null;
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[];
  currentUser: LeaderboardUser | null;
  type: string;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [globalData, setGlobalData] = useState<LeaderboardData | null>(null);
  const [friendsData, setFriendsData] = useState<LeaderboardData | null>(null);
  const [weeklyData, setWeeklyData] = useState<LeaderboardData | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("global");

  useEffect(() => {
    loadLeaderboards();
  }, []);

  async function loadLeaderboards() {
    setLoading(true);

    // Load all leaderboard types in parallel
    const [globalRes, friendsRes, weeklyRes, groupsRes] = await Promise.all([
      apiFetch("/api/leaderboard?type=global"),
      apiFetch("/api/leaderboard?type=friends"),
      apiFetch("/api/leaderboard?type=weekly"),
      apiFetch("/api/groups"),
    ]);

    if ((globalRes as any).ok) {
      setGlobalData((globalRes as any).data);
    }

    if ((friendsRes as any).ok) {
      setFriendsData((friendsRes as any).data);
    }

    if ((weeklyRes as any).ok) {
      setWeeklyData((weeklyRes as any).data);
    }

    if ((groupsRes as any).ok && (groupsRes as any).data?.groups) {
      setGroups((groupsRes as any).data.groups.slice(0, 10));
    }

    setLoading(false);
  }

  async function shareRank() {
    const data = activeTab === 'global' ? globalData : activeTab === 'friends' ? friendsData : weeklyData;
    const currentUser = data?.currentUser;

    if (!currentUser) {
      toast({
        title: "Not Available",
        description: "Complete some challenges to appear on the leaderboard!",
        variant: "default",
      });
      return;
    }

    // Generate share text
    const shareText = `🏆 I'm ranked #${currentUser.rank} on PareL!\n\n⭐ Level ${currentUser.level} | 💫 ${currentUser.xp.toLocaleString()} XP | 🔥 ${currentUser.streakCount} day streak\n\nJoin me on PareL!`;
    const shareUrl = `${window.location.origin}/invite`;

    // Try native share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My PareL Rank",
          text: shareText,
          url: shareUrl,
        });
        
        // Track share event
        fetch('/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            events: [{ name: 'share_clicked', timestamp: Date.now(), data: { type: 'rank' } }],
          }),
        });

        toast({
          title: "Shared!",
          description: "Thanks for spreading the word 🎉",
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast({
        title: "Copied!",
        description: "Share link copied to clipboard",
      });
    }
  }

  function renderUserTable(data: LeaderboardData | null, showStreak = false) {
    if (!data || !data.leaderboard || data.leaderboard.length === 0) {
      return (
        <div className="p-12 text-center text-subtle">
          <Trophy className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No rankings yet</p>
          <p className="text-sm mt-2">Be the first to earn XP and appear here!</p>
        </div>
      );
    }

    return (
      <>
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-bg border-b border-border">
          <div className="text-sm font-bold text-accent">Rank</div>
          <div className="text-sm font-bold text-accent col-span-2">Player</div>
          <div className="text-sm font-bold text-accent text-right">Level</div>
          <div className="text-sm font-bold text-accent text-right">XP</div>
          <div className="text-sm font-bold text-accent text-right">{showStreak ? 'Streak' : 'Streak'}</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border">
          {data.leaderboard.map((user) => {
            const medalEmoji = user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : '';
            const isCurrentUser = session?.user?.id === user.id;

            return (
              <div
                key={user.id}
                className={`grid grid-cols-6 gap-4 px-6 py-4 hover:bg-bg/50 transition ${
                  user.rank <= 3 ? 'bg-accent/5' : ''
                } ${isCurrentUser ? 'ring-2 ring-accent' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-text font-bold">#{user.rank}</span>
                  {medalEmoji && <span className="text-xl">{medalEmoji}</span>}
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  {user.image || user.avatarUrl ? (
                    <img
                      src={user.image || user.avatarUrl || ''}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold">
                      {user.displayName[0].toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-text">
                    {user.displayName}
                    {isCurrentUser && <span className="text-xs text-accent ml-2">(You)</span>}
                  </span>
                </div>
                <div className="text-right text-subtle">Lv. {user.level}</div>
                <div className="text-right font-bold text-accent">{user.xp.toLocaleString()}</div>
                <div className="text-right text-subtle flex items-center justify-end gap-1">
                  {user.streakCount > 0 && <Flame className="h-4 w-4 text-orange-500" />}
                  {user.streakCount}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current User Position (if not in top 10) */}
        {data.currentUser && !data.leaderboard.find(u => u.id === data.currentUser?.id) && (
          <div className="border-t-2 border-border">
            <div className="px-6 py-2 bg-bg/50 text-center text-xs text-subtle">
              ... {data.currentUser.rank - 11} more ...
            </div>
            <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-accent/10 ring-2 ring-accent">
              <div className="flex items-center gap-2">
                <span className="text-text font-bold">#{data.currentUser.rank}</span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                {data.currentUser.image || data.currentUser.avatarUrl ? (
                  <img
                    src={data.currentUser.image || data.currentUser.avatarUrl || ''}
                    alt={data.currentUser.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold">
                    {data.currentUser.displayName[0].toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-text">
                  {data.currentUser.displayName}
                  <span className="text-xs text-accent ml-2">(You)</span>
                </span>
              </div>
              <div className="text-right text-subtle">Lv. {data.currentUser.level}</div>
              <div className="text-right font-bold text-accent">{data.currentUser.xp.toLocaleString()}</div>
              <div className="text-right text-subtle flex items-center justify-end gap-1">
                {data.currentUser.streakCount > 0 && <Flame className="h-4 w-4 text-orange-500" />}
                {data.currentUser.streakCount}
              </div>
            </div>
          </div>
        )}
      </>
    );
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text mb-2">Leaderboard 🏆</h1>
            <p className="text-subtle">
              Top players and totems ranked by XP and streaks
            </p>
          </div>
          <Button onClick={shareRank} variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share My Rank
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="global" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="global">🌍 Global</TabsTrigger>
            <TabsTrigger value="friends">👥 Friends</TabsTrigger>
            <TabsTrigger value="weekly">📅 Weekly</TabsTrigger>
            <TabsTrigger value="groups">🔥 Totems</TabsTrigger>
          </TabsList>

          {/* Global Tab */}
          <TabsContent value="global">
            <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-xl">
              {renderUserTable(globalData)}
            </div>
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends">
            <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-xl">
              {renderUserTable(friendsData)}
            </div>
          </TabsContent>

          {/* Weekly Tab */}
          <TabsContent value="weekly">
            <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-xl">
              {renderUserTable(weeklyData, true)}
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
