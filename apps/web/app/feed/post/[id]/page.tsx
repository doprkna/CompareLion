/**
 * Feed Post Detail Page
 * v0.36.25 - Community Feed 1.0
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type FeedPost = {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string | null;
    name: string | null;
    avatarUrl: string | null;
    level: number;
  };
  type: string;
  content: string | null;
  refId: string | null;
  preview: any;
  createdAt: Date;
  reactions: {
    counts: Record<string, number>;
    userReactions: string[];
    total: number;
  };
  comments: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      username: string | null;
      name: string | null;
      avatarUrl: string | null;
    };
    content: string;
    createdAt: Date;
  }>;
};

export default function FeedPostPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const postId = params.id as string;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Load post details (for now, fetch from feed API and find the post)
    // In a real implementation, you'd have a GET /api/feed/post/[id] endpoint
    const loadPost = async () => {
      try {
        // For MVP, we'll fetch from the feed and find the post
        // TODO: Create dedicated endpoint
        const res = await fetch('/api/feed?limit=100');
        const data = await res.json();
        if (data.success) {
          const foundPost = data.posts.find((p: FeedPost) => p.id === postId);
          if (foundPost) {
            // Fetch full comments
            // For MVP, we'll use the preview comments
            // TODO: Fetch full comments from dedicated endpoint
            setPost(foundPost);
          }
        }
      } catch (error) {
        console.error('Failed to load post', error);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      loadPost();
    }
  }, [postId, router, status]);

  const handleComment = async () => {
    if (!commentText.trim() || !post) return;

    setPostingComment(true);
    try {
      const res = await fetch('/api/feed/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, content: commentText }),
      });

      const data = await res.json();
      if (data.success) {
        setCommentText('');
        // Reload post to get updated comments
        // TODO: Optimistically add comment
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to comment', error);
    } finally {
      setPostingComment(false);
    }
  };

  const handleReact = async (emoji: string) => {
    if (!post) return;

    try {
      const res = await fetch('/api/feed/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, emoji }),
      });

      const data = await res.json();
      if (data.success) {
        // Reload post to get updated reactions
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to react', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Post not found</p>
            <Button onClick={() => router.push('/feed')} className="mt-4">
              Back to Feed
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <Button variant="ghost" onClick={() => router.push('/feed')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Feed
      </Button>

      {/* Post */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              {post.user.avatarUrl ? (
                <img
                  src={post.user.avatarUrl}
                  alt={post.user.username || post.user.name || 'User'}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  {post.user.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">
                  {post.user.username || post.user.name || 'Unknown'}
                </span>
                <span className="text-xs text-muted-foreground">
                  Lv.{post.user.level}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>

              <p className="text-base mb-4">{post.content}</p>

              {/* Reactions Grid */}
              <div className="flex gap-2 mb-4">
                {['👍', '🔥', '❤️', '💡'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReact(emoji)}
                    className={`px-3 py-1 rounded ${
                      post.reactions.userReactions.includes(emoji)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {emoji} {post.reactions.counts[emoji] || 0}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            Comments ({post.comments.length})
          </h2>

          {/* Comment Form */}
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleComment();
                }
              }}
            />
            <Button
              onClick={handleComment}
              disabled={!commentText.trim() || postingComment}
            >
              {postingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
            </Button>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {post.comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="flex-shrink-0">
                    {comment.user.avatarUrl ? (
                      <img
                        src={comment.user.avatarUrl}
                        alt={comment.user.username || comment.user.name || 'User'}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">
                        {comment.user.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {comment.user.username || comment.user.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

