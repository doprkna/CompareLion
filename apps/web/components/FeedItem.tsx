'use client';

/**
 * FeedItem Component
 * 
 * Display a single feed item with inline reactions.
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Flame, PartyPopper, Zap } from "lucide-react";
import { apiFetch } from "@/lib/apiBase";
import { toast } from "sonner";

interface FeedItemProps {
  item: {
    id: string;
    type: string;
    title: string;
    description?: string;
    metadata?: any;
    createdAt: string;
    user: {
      id: string;
      name: string;
      image?: string;
      level?: number;
    };
    reactions: Record<string, number>; // { "❤️": 5, "🔥": 3 }
    totalReactions: number;
    userReaction?: string | null;
  };
  onReactionChange?: () => void;
}

const AVAILABLE_REACTIONS = [
  { emoji: "❤️", label: "Love", icon: Heart, color: "text-red-500" },
  { emoji: "🔥", label: "Fire", icon: Flame, color: "text-orange-500" },
  { emoji: "🎉", label: "Party", icon: PartyPopper, color: "text-yellow-500" },
  { emoji: "🤯", label: "Mind Blown", icon: Zap, color: "text-purple-500" },
];

export default function FeedItem({ item, onReactionChange }: FeedItemProps) {
  const [userReaction, setUserReaction] = useState(item.userReaction);
  const [reactions, setReactions] = useState(item.reactions);
  const [totalReactions, setTotalReactions] = useState(item.totalReactions);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  async function handleReaction(emoji: string) {
    try {
      if (userReaction === emoji) {
        // Remove reaction
        const res = await apiFetch("/api/feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "unreact",
            feedItemId: item.id,
          }),
        });

        if ((res as any).ok) {
          setUserReaction(null);
          setReactions((prev) => {
            const updated = { ...prev };
            updated[emoji] = Math.max((updated[emoji] || 1) - 1, 0);
            if (updated[emoji] === 0) delete updated[emoji];
            return updated;
          });
          setTotalReactions((prev) => Math.max(prev - 1, 0));
        }
      } else {
        // Add or change reaction
        const res = await apiFetch("/api/feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "react",
            feedItemId: item.id,
            emoji,
          }),
        });

        if ((res as any).ok) {
          setReactions((prev) => {
            const updated = { ...prev };
            // Remove old reaction count
            if (userReaction) {
              updated[userReaction] = Math.max((updated[userReaction] || 1) - 1, 0);
              if (updated[userReaction] === 0) delete updated[userReaction];
            }
            // Add new reaction count
            updated[emoji] = (updated[emoji] || 0) + 1;
            return updated;
          });

          if (!userReaction) {
            setTotalReactions((prev) => prev + 1);
          }

          setUserReaction(emoji);
        }
      }

      setShowReactionPicker(false);
      if (onReactionChange) onReactionChange();
    } catch (error) {
      toast.error("Failed to update reaction");
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "achievement":
        return "🏆";
      case "challenge":
        return "⚔️";
      case "quiz":
        return "📝";
      case "duel":
        return "🎯";
      case "group_join":
        return "🔥";
      case "level_up":
        return "⬆️";
      default:
        return "📢";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "achievement":
        return "text-yellow-500";
      case "challenge":
        return "text-red-500";
      case "quiz":
        return "text-blue-500";
      case "duel":
        return "text-purple-500";
      case "group_join":
        return "text-orange-500";
      case "level_up":
        return "text-green-500";
      default:
        return "text-zinc-400";
    }
  };

  const timeSince = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="bg-card border-border text-text hover:border-accent/50 transition-colors">
      <CardContent className="p-4 space-y-3">
        {/* Header: User + Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {item.user.image && (
              <img
                src={item.user.image}
                alt={item.user.name}
                className="w-10 h-10 rounded-full"
              />
            )}
            {!item.user.image && (
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                {item.user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-semibold">{item.user.name}</div>
              <div className="text-xs text-subtle">
                Level {item.user.level} • {timeSince(item.createdAt)}
              </div>
            </div>
          </div>

          {/* Type Badge */}
          <div className={`text-2xl ${getTypeColor(item.type)}`}>
            {getTypeIcon(item.type)}
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="font-medium text-text">{item.title}</div>
          {item.description && (
            <div className="text-sm text-subtle mt-1">{item.description}</div>
          )}
          {item.metadata?.icon && (
            <div className="text-3xl mt-2">{item.metadata.icon}</div>
          )}
        </div>

        {/* Reactions Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          {/* Existing Reactions */}
          <div className="flex items-center gap-1 flex-1 flex-wrap">
            {Object.entries(reactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${
                  userReaction === emoji
                    ? "bg-accent text-black"
                    : "bg-bg hover:bg-accent/20"
                }`}
              >
                <span>{emoji}</span>
                <span className="text-xs font-medium">{count}</span>
              </button>
            ))}

            {totalReactions === 0 && (
              <span className="text-xs text-muted">Be the first to react!</span>
            )}
          </div>

          {/* Add Reaction Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="gap-1"
            >
              <span className="text-lg">+</span>
              <span className="text-xs">React</span>
            </Button>

            {/* Reaction Picker Dropdown */}
            {showReactionPicker && (
              <div className="absolute right-0 bottom-full mb-2 bg-card border-2 border-accent rounded-lg p-2 shadow-xl z-10 flex gap-1">
                {AVAILABLE_REACTIONS.map((reaction) => (
                  <button
                    key={reaction.emoji}
                    onClick={() => handleReaction(reaction.emoji)}
                    className="w-10 h-10 rounded-lg hover:bg-accent/20 transition-colors flex items-center justify-center text-xl"
                    title={reaction.label}
                  >
                    {reaction.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}










