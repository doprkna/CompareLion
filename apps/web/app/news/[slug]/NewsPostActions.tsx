'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Heart, Share2 } from 'lucide-react';

export function NewsPostActions({
  postId,
  slug,
  initialLiked = false,
  initialLikeCount = 0,
}: {
  postId: string;
  slug: string;
  initialLiked?: boolean;
  initialLikeCount?: number;
}) {
  const { status } = useSession();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (status !== 'authenticated' || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/news/${postId}/like`, { method: 'POST' });
      const j = await res.json();
      const d = j?.data ?? j;
      setLiked(d.liked ?? !liked);
      setLikeCount(d.likeCount ?? likeCount + (liked ? -1 : 1));
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/news/${slug}` : '';
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        // could add toast
      });
    }
  };

  return (
    <div className="flex items-center gap-4 mt-8 pt-6 border-t border-border">
      {status === 'authenticated' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={loading}
          className={liked ? 'text-accent' : ''}
        >
          <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-current' : ''}`} />
          {likeCount}
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={handleShare}>
        <Share2 className="h-4 w-4 mr-1" />
        Share
      </Button>
      <span className="text-sm text-subtle">Comments: Coming soon</span>
    </div>
  );
}
