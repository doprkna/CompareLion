'use client';

/**
 * Global Feed Page
 * 
 * Real-time community activity feed with filters and reactions.
 */

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiBase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FeedItem from "@/components/FeedItem";
import { useEventBus } from "@/hooks/useEventBus";
import { TrendingUp, Users, Globe, RefreshCw } from "lucide-react";

type FilterType = "all" | "friends" | "trending";

export default function FeedPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeed();
  }, [filter]);

  // Listen for new feed items
  useEventBus("feed:new", () => {
    if (filter === "all") {
      loadFeed();
    }
  });

  // Listen for reactions
  useEventBus("feed:reaction", () => {
    // Optionally refresh to show updated counts
  });

  async function loadFeed() {
    setLoading(true);
    const res = await apiFetch(`/api/feed?filter=${filter}&limit=50`);

    if ((res as any).ok && (res as any).data) {
      setItems((res as any).data.items || []);
    }
    setLoading(false);
  }

  async function refreshFeed() {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  }

  const filterButtons: Array<{
    value: FilterType;
    label: string;
    icon: any;
    description: string;
  }> = [
    {
      value: "all",
      label: "All",
      icon: Globe,
      description: "Latest from everyone",
    },
    {
      value: "friends",
      label: "Friends",
      icon: Users,
      description: "Activity from your friends",
    },
    {
      value: "trending",
      label: "Trending",
      icon: TrendingUp,
      description: "Most popular in last 24h",
    },
  ];

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text mb-2">🌍 Global Feed</h1>
          <p className="text-subtle">
            See what the community is up to
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {filterButtons.map((btn) => {
                const Icon = btn.icon;
                return (
                  <Button
                    key={btn.value}
                    onClick={() => setFilter(btn.value)}
                    variant={filter === btn.value ? "default" : "outline"}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {btn.label}
                  </Button>
                );
              })}
            </div>

            <Button
              onClick={refreshFeed}
              disabled={refreshing}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Filter Description */}
          <div className="mt-3 text-sm text-subtle text-center">
            {filterButtons.find((b) => b.value === filter)?.description}
          </div>
        </Card>

        {/* Feed Items */}
        {loading ? (
          <div className="text-center py-12 text-subtle">
            <div className="text-4xl mb-4">⏳</div>
            Loading feed...
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item) => (
              <FeedItem
                key={item.id}
                item={item}
                onReactionChange={() => {
                  // Optionally refresh item
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-text mb-2">
              {filter === "friends"
                ? "No friend activity yet"
                : filter === "trending"
                ? "Nothing trending yet"
                : "No feed items yet"}
            </h3>
            <p className="text-subtle mb-6">
              {filter === "friends"
                ? "Add friends to see their activity here"
                : filter === "trending"
                ? "Check back later for trending content"
                : "Be the first to share something!"}
            </p>
            {filter !== "all" && (
              <Button onClick={() => setFilter("all")} variant="outline">
                View All Activity
              </Button>
            )}
          </Card>
        )}

        {/* Load More (placeholder) */}
        {items.length >= 50 && (
          <div className="text-center">
            <Button variant="outline" onClick={loadFeed}>
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}










