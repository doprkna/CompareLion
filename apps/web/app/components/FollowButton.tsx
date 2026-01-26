/**
 * Follow Button Component
 * Button to follow/unfollow a user
 * v0.36.42 - Social Systems 1.0
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, UserMinus } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { toast } from 'sonner';

interface FollowButtonProps {
  targetUserId: string;
  className?: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({ targetUserId, className, onFollowChange }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    checkFollowStatus();
  }, [targetUserId]);

  async function checkFollowStatus() {
    try {
      // Check if current user is following target user
      // This would need a separate endpoint or include in user profile
      // For now, we'll assume not following and let the button update on click
      setIsFollowing(false);
    } catch (error) {
      console.error('Failed to check follow status', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFollow() {
    if (updating) return;

    setUpdating(true);
    try {
      const res = await apiFetch('/api/social/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: targetUserId }),
      });

      if ((res as any).ok) {
        setIsFollowing(true);
        toast.success('Following user');
        onFollowChange?.(true);
      } else {
        throw new Error((res as any).error || 'Failed to follow');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to follow user');
    } finally {
      setUpdating(false);
    }
  }

  async function handleUnfollow() {
    if (updating) return;

    setUpdating(true);
    try {
      const res = await apiFetch('/api/social/unfollow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: targetUserId }),
      });

      if ((res as any).ok) {
        setIsFollowing(false);
        toast.success('Unfollowed user');
        onFollowChange?.(false);
      } else {
        throw new Error((res as any).error || 'Failed to unfollow');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to unfollow user');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <Button disabled size="sm" className={className}>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <Button
      onClick={isFollowing ? handleUnfollow : handleFollow}
      disabled={updating}
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
      className={className}
    >
      {updating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {isFollowing ? 'Unfollowing...' : 'Following...'}
        </>
      ) : isFollowing ? (
        <>
          <UserMinus className="w-4 h-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}

