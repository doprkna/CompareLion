/**
 * Bookmark Button Component
 * Toggle bookmark for a question
 * v0.37.1 - Bookmark Question Feature
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { toast } from 'sonner';
import useSWR from 'swr';

interface BookmarkButtonProps {
  questionId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const fetcher = (url: string) => apiFetch(url).then((res: any) => res.ok && res.data?.bookmarks || []);

export function BookmarkButton({ questionId, className, size = 'sm' }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Check if question is bookmarked
  const { data: bookmarks, mutate } = useSWR('/api/questions/bookmarks', fetcher);

  useEffect(() => {
    if (bookmarks) {
      const bookmarked = bookmarks.some((b: any) => b.questionId === questionId);
      setIsBookmarked(bookmarked);
    }
  }, [bookmarks, questionId]);

  async function handleToggle() {
    if (updating) return;

    setUpdating(true);
    const wasBookmarked = isBookmarked;

    // Optimistic update
    setIsBookmarked(!wasBookmarked);

    try {
      if (wasBookmarked) {
        // Remove bookmark
        const res = await apiFetch('/api/questions/bookmark', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId }),
        });

        if (!(res as any).ok) {
          throw new Error((res as any).error || 'Failed to remove bookmark');
        }

        toast.success('Bookmark removed');
      } else {
        // Add bookmark
        const res = await apiFetch('/api/questions/bookmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId }),
        });

        if (!(res as any).ok) {
          throw new Error((res as any).error || 'Failed to add bookmark');
        }

        toast.success('Question bookmarked');
      }

      // Refresh bookmarks list
      await mutate();
    } catch (error: any) {
      // Revert optimistic update
      setIsBookmarked(wasBookmarked);
      toast.error(error.message || 'Failed to update bookmark');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={updating}
      variant="ghost"
      size={size}
      className={className}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
    >
      {isBookmarked ? (
        <BookmarkCheck className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'} text-yellow-500 fill-yellow-500`} />
      ) : (
        <Bookmark className={size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'} />
      )}
    </Button>
  );
}

