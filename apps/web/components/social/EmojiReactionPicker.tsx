'use client';

/**
 * Emoji Reaction Picker
 * v0.20.0 - Simple emoji reactions for content
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { showToast } from '@/lib/toast';
import { logger } from '@/lib/logger';

const AVAILABLE_EMOJIS = ['❤️', '😂', '👍', '😮', '😢', '🔥', '✨'];

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
  users: Array<{
    id: string;
    username: string | null;
    name: string | null;
  }>;
}

interface EmojiReactionPickerProps {
  targetType: 'reflection' | 'comment' | 'message' | 'user_reflection';
  targetId: string;
}

export function EmojiReactionPicker({ targetType, targetId }: EmojiReactionPickerProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    fetchReactions();
  }, [targetId, targetType]);

  const fetchReactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reactions?targetType=${targetType}&targetId=${targetId}`);
      if (response.ok) {
        const data = await response.json();
        setReactions(data.reactions || []);
      }
    } catch (err) {
      logger.error('Failed to fetch reactions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (emoji: string) => {
    // Find if user has reacted with this emoji
    const existingReaction = reactions.find(
      (r) => r.emoji === emoji && r.hasReacted
    );

    try {
      if (existingReaction) {
        // Remove reaction
        const response = await fetch('/api/reactions', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetType,
            targetId,
          }),
        });

        if (response.ok) {
          await fetchReactions();
          showToast('Reaction removed', 'info');
        }
      } else {
        // Add reaction
        const response = await fetch('/api/reactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetType,
            targetId,
            emoji,
          }),
        });

        if (response.ok) {
          await fetchReactions();
          showToast(`${emoji} reaction added!`, 'success');
        }
      }
      setShowPicker(false);
    } catch (err) {
      logger.error('Failed to handle reaction', err);
      showToast('Error updating reaction', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex gap-2 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Existing reactions */}
      {reactions.map((reaction) => (
        <Button
          key={reaction.emoji}
          onClick={() => handleReaction(reaction.emoji)}
          variant={reaction.hasReacted ? 'default' : 'outline'}
          size="sm"
          className="h-8 px-3 text-base"
          title={reaction.users.map((u) => u.username || u.name).join(', ')}
        >
          {reaction.emoji} {reaction.count}
        </Button>
      ))}

      {/* Add reaction button/picker */}
      <div className="relative">
        <Button
          onClick={() => setShowPicker(!showPicker)}
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-lg"
          title="Add reaction"
        >
          {showPicker ? '✕' : '+'}
        </Button>

        {/* Emoji picker dropdown */}
        {showPicker && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-background border rounded-lg shadow-lg z-10 flex gap-1">
            {AVAILABLE_EMOJIS.map((emoji) => {
              const existingReaction = reactions.find((r) => r.emoji === emoji);
              const hasReacted = existingReaction?.hasReacted || false;

              return (
                <Button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  variant={hasReacted ? 'default' : 'ghost'}
                  size="sm"
                  className="h-10 w-10 text-xl p-0"
                  title={emoji}
                >
                  {emoji}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

