'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { apiFetch } from '@/lib/apiBase';

interface BookmarkButtonProps {
  questionId: string;
  bookmarked: boolean;
  onToggle?: (bookmarked: boolean) => void;
  size?: 'sm' | 'default' | 'lg';
}

export function BookmarkButton({
  questionId,
  bookmarked: initial,
  onToggle,
  size = 'sm',
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initial);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const toggle = async () => {
    setLoading(true);
    const next = !bookmarked;
    setBookmarked(next);
    onToggle?.(next);

    try {
      if (next) {
        const res = await apiFetch(`/api/questions/${questionId}/bookmark`, {
          method: 'POST',
        });
        if (!res.ok) throw new Error(res.error);
        toast({ title: 'Saved' });
      } else {
        const res = await apiFetch(`/api/questions/${questionId}/bookmark`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error(res.error);
        toast({ title: 'Removed' });
      }
    } catch {
      setBookmarked(!next);
      onToggle?.(!next);
      toast({ title: 'Failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={toggle}
      disabled={loading}
      className="text-subtle hover:text-accent"
    >
      <Star
        className={`h-4 w-4 ${bookmarked ? 'fill-amber-400 text-amber-400' : ''}`}
      />
    </Button>
  );
}
