'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiBase";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, TrendingUp, Trophy, Plus, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function GroupsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    emblem: "🔥",
    motto: "Together we rise",
  });

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    setLoading(true);
    const res = await apiFetch("/api/groups");

    if ((res as any).ok && (res as any).data) {
      setGroups((res as any).data.groups || []);
      setMyGroups((res as any).data.myGroups || []);
    }
    setLoading(false);
  }

  async function createGroup() {
    if (!formData.name.trim()) {
      toast.error("Group name required");
      return;
    }

    const res = await apiFetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        ...formData,
      }),
    });

    if ((res as any).ok) {
      toast.success("🔥 Totem created!");
      setShowCreate(false);
      setFormData({ name: "", emblem: "🔥", motto: "Together we rise" });
      loadGroups();
    } else {
      toast.error((res as any).error || "Failed to create group");
    }
  }

  async function joinGroup(groupId: string) {
    const res = await apiFetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "join",
        groupId,
      }),
    });

    if ((res as any).ok) {
      toast.success("✅ Joined totem!");
      loadGroups();
    } else {
      toast.error((res as any).error || "Failed to join group");
    }
  }

  async function leaveGroup(groupId: string) {
    if (!confirm("Are you sure you want to leave this totem?")) return;

    const res = await apiFetch(`/api/groups?id=${groupId}`, {
      method: "DELETE",
    });

    if ((res as any).ok) {
      toast.success("👋 Left totem");
      loadGroups();
    } else {
      toast.error((res as any).error || "Failed to leave group");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text text-xl">Loading totems...</div>
      </div>
    );
  }

  const emblems = ["🔥", "⚡", "🌊", "🌙", "⭐", "💎", "🐉", "🦅", "🐺", "🌸"];

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text mb-2">🔥 Group Totems</h1>
          <p className="text-subtle">
            Join a totem to gain collective bonuses and compete with friends
          </p>
        </div>

        {/* Create Group Button */}
        <div className="flex justify-center">
          <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
            <Plus className="h-5 w-5" />
            Create Totem
          </Button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <Card className="bg-card border-accent text-text max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Create New Totem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-subtle mb-1 block">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="The Phoenix Alliance"
                  className="bg-bg border-border text-text"
                />
              </div>
              <div>
                <label className="text-sm text-subtle mb-1 block">
                  Emblem
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {emblems.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setFormData({ ...formData, emblem: emoji })}
                      className={`text-3xl p-2 rounded-lg border ${
                        formData.emblem === emoji
                          ? "border-accent bg-accent/20"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-subtle mb-1 block">Motto</label>
                <Input
                  value={formData.motto}
                  onChange={(e) =>
                    setFormData({ ...formData, motto: e.target.value })
                  }
                  placeholder="Together we rise"
                  className="bg-bg border-border text-text"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createGroup} className="flex-1">
                  Create
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreate(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Groups */}
        {myGroups.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-accent">Your Totems</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGroups.map((group) => (
                <Card
                  key={group.id}
                  className="bg-card border-2 border-accent text-text"
                >
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-5xl">{group.emblem}</span>
                        <div>
                          <h3 className="text-xl font-bold">{group.name}</h3>
                          <p className="text-xs text-subtle italic">
                            "{group.motto}"
                          </p>
                        </div>
                      </div>
                      {group.weeklyBonus && (
                        <Trophy className="h-6 w-6 text-yellow-500" />
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <div className="text-2xl font-bold text-accent">
                          {group.totalXp}
                        </div>
                        <div className="text-xs text-subtle">Total XP</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-text">
                          {group.avgKarma > 0 ? `+${group.avgKarma}` : group.avgKarma}
                        </div>
                        <div className="text-xs text-subtle">Avg Karma</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-text">
                          {group.avgPrestige}
                        </div>
                        <div className="text-xs text-subtle">Avg Prestige</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => router.push(`/groups/${group.id}`)}
                        className="flex-1"
                        size="sm"
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => leaveGroup(group.id)}
                        size="sm"
                        className="gap-1"
                      >
                        <LogOut className="h-4 w-4" />
                        Leave
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Groups */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-text">All Totems</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group, index) => {
              const isMember = myGroups.some((g) => g.id === group.id);
              const isFull = group.groupMembers.length >= group.maxMembers;

              return (
                <Card
                  key={group.id}
                  className="bg-card border-border text-text hover:border-accent/50 transition-colors"
                >
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{group.emblem}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold">{group.name}</h3>
                            {index < 3 && (
                              <span className="text-xs bg-accent text-black px-2 py-0.5 rounded">
                                TOP {index + 1}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-subtle italic">
                            "{group.motto}"
                          </p>
                        </div>
                      </div>
                      {group.weeklyBonus && (
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <div className="text-xl font-bold text-accent">
                          {group.totalXp}
                        </div>
                        <div className="text-xs text-subtle">XP</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-text">
                          {group.groupMembers.length}/{group.maxMembers}
                        </div>
                        <div className="text-xs text-subtle">Members</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-text">
                          {group.avgPrestige}
                        </div>
                        <div className="text-xs text-subtle">Prestige</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => router.push(`/groups/${group.id}`)}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        Details
                      </Button>
                      {!isMember && (
                        <Button
                          onClick={() => joinGroup(group.id)}
                          disabled={isFull}
                          className="flex-1"
                          size="sm"
                        >
                          {isFull ? "Full" : "Join"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-card border border-accent text-text">
          <CardContent className="p-4 text-center text-sm text-subtle">
            <TrendingUp className="h-5 w-5 inline mr-2 text-accent" />
            Top totem each week gains +10% XP bonus for all members
          </CardContent>
        </Card>
      </div>
    </div>
  );
}










