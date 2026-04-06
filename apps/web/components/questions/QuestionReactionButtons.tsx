'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import Link from 'next/link';

interface ReactionData {
  myReaction: 'LIKE' | 'DISLIKE' | null;
  likeCount: number;
  dislikeCount: number;
}

interface QuestionReactionButtonsProps {
  questionId: string;
  onReactionChange?: (data: ReactionData) => void;
  compact?: boolean;
}

export function QuestionReactionButtons({
  questionId,
  onReactionChange,
  compact = false,
}: QuestionReactionButtonsProps) {
  const { data: session, status } = useSession();
  const [data, setData] = useState<ReactionData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReaction = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/questions/${questionId}/reaction`);
      const d = (res as any).data?.data ?? (res as any).data;
      if (d) {
        setData({
          myReaction: d.myReaction ?? null,
          likeCount: d.likeCount ?? 0,
          dislikeCount: d.dislikeCount ?? 0,
        });
        onReactionChange?.(d);
      }
    } catch {
      setData(null);
    }
  }, [questionId, onReactionChange]);

  useEffect(() => {
    fetchReaction();
  }, [fetchReaction]);

  const setReaction = async (type: 'LIKE' | 'DISLIKE' | 'NONE') => {
    if (status !== 'authenticated' || !session) return;
    if (loading) return;
    const next =
      type === 'NONE'
        ? 'NONE'
        : data?.myReaction === type
          ? 'NONE'
          : type;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/questions/${questionId}/reaction`, {
        method: 'PUT',
        body: JSON.stringify({ type: next }),
      });
      const ok = (res as any).ok ?? (res as any).data?.success;
      if (ok) {
        await fetchReaction();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    if (!session) return;
    setReaction(data?.myReaction === 'LIKE' ? 'NONE' : 'LIKE');
  };

  const handleDislike = () => {
    if (!session) return;
    setReaction(data?.myReaction === 'DISLIKE' ? 'NONE' : 'DISLIKE');
  };

  if (!data && status !== 'loading') return null;

  const base = compact ? 'text-sm' : 'text-base';
  const countClass = 'text-xs text-subtle ml-0.5';

  if (status !== 'authenticated' || !session) {
    return (
      <div className={`flex items-center gap-2 ${base}`}>
        <span className="text-subtle flex items-center gap-1">
          <ThumbsUp className="h-4 w-4" />
          {data?.likeCount ?? 0}
        </span>
        <span className="text-subtle flex items-center gap-1">
          <ThumbsDown className="h-4 w-4" />
          {data?.dislikeCount ?? 0}
        </span>
        <Link href="/login" className="text-xs text-accent hover:underline ml-2">
          Login to vote
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${base}`}>
      <button
        type="button"
        onClick={handleLike}
        disabled={loading}
        className={`flex items-center gap-1 rounded px-2 py-1 transition-colors ${
          data?.myReaction === 'LIKE'
            ? 'bg-accent/20 text-accent'
            : 'hover:bg-card/80 text-subtle'
        }`}
      >
        <ThumbsUp className="h-4 w-4" />
        <span className={countClass}>{data?.likeCount ?? 0}</span>
      </button>
      <button
        type="button"
        onClick={handleDislike}
        disabled={loading}
        className={`flex items-center gap-1 rounded px-2 py-1 transition-colors ${
          data?.myReaction === 'DISLIKE'
            ? 'bg-destructive/20 text-destructive'
            : 'hover:bg-card/80 text-subtle'
        }`}
      >
        <ThumbsDown className="h-4 w-4" />
        <span className={countClass}>{data?.dislikeCount ?? 0}</span>
      </button>
    </div>
  );
}
