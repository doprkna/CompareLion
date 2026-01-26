/**
 * Vote Buttons Component
 * Upvote/downvote buttons for answers
 * v0.37.11 - Upvote / Downvote Answers
 */

'use client';

import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoteButtonsProps {
  answerId: string;
  initialScore?: number;
  initialUserVote?: 1 | -1 | null;
  className?: string;
  onVoteChange?: (score: number, userVote: 1 | -1 | null) => void;
}

export function VoteButtons({
  answerId,
  initialScore = 0,
  initialUserVote = null,
  className = '',
  onVoteChange,
}: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialUserVote);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load vote state on mount
  useEffect(() => {
    const loadVoteState = async () => {
      try {
        const response = await fetch(`/api/answers/votes?answerId=${encodeURIComponent(answerId)}`);
        const data = await response.json();

        if (data.success) {
          setScore(data.score || 0);
          setUserVote(data.userVote || null);
        }
      } catch (err) {
        // Silently fail - use initial values
      }
    };

    if (answerId) {
      loadVoteState();
    }
  }, [answerId]);

  const handleVote = async (value: 1 | -1) => {
    if (loading) return;

    // Optimistic update
    const previousVote = userVote;
    const previousScore = score;

    // Calculate new vote state
    let newVote: 1 | -1 | null = value;
    if (previousVote === value) {
      // Toggle off if clicking same vote
      newVote = null;
    }

    // Calculate new score optimistically
    let newScore = previousScore;
    if (previousVote === null) {
      // No previous vote - add new vote
      newScore += value;
    } else if (previousVote === value) {
      // Removing vote
      newScore -= value;
    } else {
      // Changing vote (e.g., downvote to upvote)
      newScore = previousScore - previousVote + value;
    }

    // Update UI immediately
    setScore(newScore);
    setUserVote(newVote);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/answers/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answerId,
          value, // Service handles toggle logic
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to vote');
      }

      // Update with server response
      setScore(data.score || newScore);
      setUserVote(data.userVote || newVote);
      onVoteChange?.(data.score || newScore, data.userVote || newVote);
    } catch (err) {
      // Revert optimistic update on error
      setScore(previousScore);
      setUserVote(previousVote);
      setError('Failed to vote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(1)}
        disabled={loading}
        className={`
          h-8 w-8 p-0
          ${userVote === 1 ? 'text-accent bg-accent/10' : 'text-subtle hover:text-text'}
        `}
        aria-label="Upvote"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>

      <span className={`text-sm font-medium min-w-[2ch] text-center ${score > 0 ? 'text-green-500' : score < 0 ? 'text-red-500' : 'text-subtle'}`}>
        {score > 0 ? `+${score}` : score}
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={`
          h-8 w-8 p-0
          ${userVote === -1 ? 'text-red-500 bg-red-500/10' : 'text-subtle hover:text-text'}
        `}
        aria-label="Downvote"
      >
        <ChevronDown className="h-4 w-4" />
      </Button>

      {error && (
        <span className="text-xs text-red-500 ml-2">{error}</span>
      )}
    </div>
  );
}

