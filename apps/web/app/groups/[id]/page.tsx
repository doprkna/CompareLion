'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiBase";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Trophy, Activity, Crown } from "lucide-react";

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  async function loadGroup() {
    setLoading(true);
    const res = await apiFetch(`/api/groups?id=${groupId}`);

    if ((res as any).ok && (res as any).data?.group) {
      setGroup((res as any).data.group);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text text-xl">Loading totem...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-destructive text-xl">Totem not found</div>
          <Button onClick={() => router.push("/groups")}>Back to Totems</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push("/groups")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Group Header */}
        <Card className="bg-card border-2 border-accent text-text">
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <span className="text-7xl">{group.emblem}</span>
              <div>
                <h1 className="text-4xl font-bold">{group.name}</h1>
                <p className="text-subtle italic mt-1">"{group.motto}"</p>
              </div>
            </div>

            {group.weeklyBonus && (
              <div className="inline-flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold">
                <Trophy className="h-5 w-5" />
                🏆 WEEKLY CHAMPION — All members gain +10% XP!
              </div>
            )}

            <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-border">
              <div>
                <div className="text-4xl font-bold text-accent">
                  {group.totalXp}
                </div>
                <div className="text-sm text-subtle mt-1">Total XP</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-text">
                  {group.avgKarma > 0 ? `+${group.avgKarma}` : group.avgKarma}
                </div>
                <div className="text-sm text-subtle mt-1">Avg Karma</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-text">
                  {group.avgPrestige}
                </div>
                <div className="text-sm text-subtle mt-1">Avg Prestige</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members */}
        <Card className="bg-card border-border text-text">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-accent" />
              Members ({group.groupMembers.length}/{group.maxMembers})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.groupMembers.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 border border-border rounded-lg"
                >
                  {member.user.image && (
                    <img
                      src={member.user.image}
                      alt={member.user.name}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">
                        {member.user.name || member.user.email.split("@")[0]}
                      </div>
                      {member.role === "owner" && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-xs text-subtle">
                      Lvl {member.user.level} • {member.user.xp} XP
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-green-500">
                      K: {member.user.karmaScore > 0 ? `+${member.user.karmaScore}` : member.user.karmaScore}
                    </div>
                    <div className="text-purple-500">
                      P: {member.user.prestigeScore}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="bg-card border-border text-text">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-accent" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {group.activities.length > 0 ? (
                group.activities.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 border-l-2 border-accent/50 bg-bg rounded"
                  >
                    <div className="flex-1">
                      <div className="text-sm">{activity.message}</div>
                      <div className="text-xs text-muted mt-1">
                        {new Date(activity.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-subtle">{activity.type}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-subtle py-8">
                  No activity yet. Be the first to contribute!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}










