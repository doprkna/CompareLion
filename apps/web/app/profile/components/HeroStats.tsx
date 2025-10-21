'use client';

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiBase";
import { useEventBus } from "@/hooks/useEventBus";
import { toast } from "sonner";
import { Sparkles, History } from "lucide-react";

interface HeroStat {
  name: string;
  value: number;
  icon: string;
  color: string;
}

export default function HeroStats() {
  const [stats, setStats] = useState<HeroStat[]>([
    { name: "Sleep", value: 0, icon: "💤", color: "bg-blue-500" },
    { name: "Health", value: 0, icon: "💪", color: "bg-red-500" },
    { name: "Social", value: 0, icon: "💬", color: "bg-green-500" },
    { name: "Knowledge", value: 0, icon: "📘", color: "bg-purple-500" },
    { name: "Creativity", value: 0, icon: "🎨", color: "bg-yellow-500" },
  ]);
  const [archetype, setArchetype] = useState<string>("Adventurer");
  const [archetypeEmoji, setArchetypeEmoji] = useState<string>("🧙");
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [evolving, setEvolving] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  // Listen for archetype evolution events
  useEventBus("archetype:evolved", (data) => {
    if (data.newArchetype) {
      setArchetype(data.newArchetype);
      setArchetypeEmoji(data.emoji);
      toast.success(`✨ You evolved into ${data.emoji} ${data.newArchetype}!`, {
        description: `Congratulations! +${data.xpBonus} XP`,
      });
      loadStats(); // Refresh stats
    }
  });

  async function loadStats() {
    setLoading(true);
    const res = await apiFetch("/api/user/summary");
    if ((res as any).ok && (res as any).data) {
      const data = (res as any).data;
      setStats([
        { name: "Sleep", value: data.statSleep || 0, icon: "💤", color: "bg-blue-500" },
        { name: "Health", value: data.statHealth || 0, icon: "💪", color: "bg-red-500" },
        { name: "Social", value: data.statSocial || 0, icon: "💬", color: "bg-green-500" },
        { name: "Knowledge", value: data.statKnowledge || 0, icon: "📘", color: "bg-purple-500" },
        { name: "Creativity", value: data.statCreativity || 0, icon: "🎨", color: "bg-yellow-500" },
      ]);
      setArchetype(data.archetype || "Adventurer");
      
      // Extract emoji from archetype name (if present)
      const archetypeMap: Record<string, string> = {
        "The Scholar": "📚",
        "The Bard": "🎭",
        "The Artist": "🎨",
        "The Warrior": "⚔️",
        "The Dreamer": "💤",
        "The Adventurer": "🧙",
        "The Polymath": "🌟",
        "The Sage": "🧙‍♂️",
        "The Diplomat": "🤝",
      };
      setArchetypeEmoji(archetypeMap[data.archetype] || "🧙");
    }
    setLoading(false);
  }

  async function checkEvolution() {
    setEvolving(true);
    const res = await apiFetch("/api/archetype/evolve", { method: "POST" });
    
    if ((res as any).ok && (res as any).data) {
      const data = (res as any).data;
      if (data.evolved) {
        // Event will trigger toast via useEventBus
        loadStats();
      } else {
        toast.info("No evolution detected", {
          description: "Keep building your stats to unlock new archetypes!",
        });
      }
    } else {
      toast.error("Failed to check evolution");
    }
    setEvolving(false);
  }

  async function loadHistory() {
    const res = await apiFetch("/api/archetype/history");
    if ((res as any).ok && (res as any).data?.history) {
      setHistory((res as any).data.history);
      setShowHistory(true);
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-border text-text">
        <CardContent className="p-6 text-center text-subtle">
          Loading hero stats...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border text-text">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            ⚔️ Hero Stats
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadHistory}
            className="gap-1"
          >
            <History className="h-4 w-4" />
            History
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Archetype */}
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-center">
          <div className="text-4xl mb-2">{archetypeEmoji}</div>
          <div className="font-bold text-lg text-accent">{archetype}</div>
          <Button
            onClick={checkEvolution}
            disabled={evolving}
            variant="outline"
            size="sm"
            className="mt-3 gap-1"
          >
            <Sparkles className="h-4 w-4" />
            {evolving ? "Checking..." : "Check Evolution"}
          </Button>
        </div>

        {/* Stats */}
        {stats.map((stat) => (
          <div key={stat.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">
                {stat.icon} {stat.name}
              </span>
              <span className="text-subtle">{stat.value} XP</span>
            </div>
            <div className="w-full bg-bg rounded-full h-3 border border-border overflow-hidden">
              <div
                className={`h-full ${stat.color} transition-all duration-500`}
                style={{ width: `${Math.min(stat.value, 100)}%` }}
              />
            </div>
          </div>
        ))}
        
        {stats.every(s => s.value === 0) && (
          <div className="text-center py-4 text-subtle text-sm">
            📊 Complete flows to build your hero stats!
          </div>
        )}

        {/* Evolution History Modal */}
        {showHistory && history.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Evolution History</h4>
              <button
                onClick={() => setShowHistory(false)}
                className="text-xs text-subtle hover:text-text"
              >
                Hide
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="text-xs p-2 bg-bg rounded border border-border"
                >
                  <div className="font-medium">
                    {entry.previousType ? `${entry.previousType} → ` : ""}
                    {entry.newType}
                  </div>
                  <div className="text-muted mt-1">
                    {new Date(entry.evolvedAt).toLocaleDateString()} • +{entry.xpBonus} XP
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

