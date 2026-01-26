/**
 * Trending Compare Feed Page
 * /feed/trending - Shows trending compare posts from last 24h
 * v0.36.31 - Social Compare Feed 2.0
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, MessageSquare, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type ComparePost = {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string | null;
    name: string | null;
    avatarUrl: string | null;
    level: number;
  };
  questionId?: string | null;
  questionContext?: { id: string; text: string } | null;
  content: string | null;
  value?: any;
  createdAt: Date;
  reactions: {
    counts: Record<string, number>;
    userReactions: string[];
    total: number;
  };
  comments: {
    preview: Array<{
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
    total: number;
  };
};

type FeedResponse = {
  success: boolean;
  posts: ComparePost[];
  nextCursor: string | null;
  hasMore: boolean;
};

const COMPARE_REACTION_TYPES = [
  { type: 'like', label: '👍 Like' },
  { type: 'wow', label: '😮 Wow' },
  { type: 'same', label: '👋 Same' },
  { type: 'lol', label: '😂 Lol' },
  { type: 'roast', label: '🔥 Roast' },
];

export default function TrendingFeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<ComparePost[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const loadFeed = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set('limit', '20');
      params.set('feedType', 'compare');
      params.set('type', 'trending');

      const res = await fetch(`/api/feed?${params.toString()}`);
      const data: FeedResponse = await res.json();

      if (data.success) {
        if (reset) {
          setPosts(data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Failed to load trending feed', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    loadFeed(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadFeed();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadFeed]);

  const handleReact = async (postId: string, type: string) => {
    try {
      const res = await fetch('/api/feed/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, type, postType: 'compare' }),
      });

      const data = await res.json();
      if (data.success) {
        loadFeed(true);
      }
    } catch (error) {
      console.error('Failed to react', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Trending Now</h1>
        </div>
        <Button variant="outline" onClick={() => router.push('/feed?feedType=compare')}>
          View All
        </Button>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  {post.user.avatarUrl ? (
                    <img
                      src={post.user.avatarUrl}
                      alt={post.user.username || post.user.name || 'User'}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {post.user.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">
                      {post.user.username || post.user.name || 'Unknown'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Lv.{post.user.level}
                    </span>
                    <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded">
                      🔥 Trending
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Question Context */}
                  {post.questionContext && (
                    <div className="text-sm font-medium mb-2 p-2 bg-muted rounded">
                      ❓ {post.questionContext.text}
                    </div>
                  )}

                  {/* Value Display */}
                  {post.value && (
                    <div className="text-lg font-bold mb-2 p-2 bg-primary/10 rounded">
                      {typeof post.value === 'object' && post.value.value !== undefined
                        ? post.value.value
                        : JSON.stringify(post.value)}
                    </div>
                  )}

                  {/* Content */}
                  {post.content && <p className="text-sm mb-2">{post.content}</p>}

                  {/* CTA */}
                  {post.questionId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/questions?questionId=${post.questionId}`)}
                      className="mb-2"
                    >
                      How do you compare?
                    </Button>
                  )}

                  {/* Reactions */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex gap-2 flex-wrap">
                      {COMPARE_REACTION_TYPES.map(({ type, label }) => (
                        <button
                          key={type}
                          onClick={() => handleReact(post.id, type)}
                          className={`text-xs px-2 py-1 rounded ${
                            post.reactions.userReactions.includes(type)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {label.split(' ')[0]} {post.reactions.counts[type] || 0}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => router.push(`/feed/post/${post.id}`)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      {post.comments.total}
                    </button>
                  </div>

                  {/* Comments Preview */}
                  {post.comments.preview.length > 0 && (
                    <div className="mt-3 space-y-2 border-t pt-3">
                      {post.comments.preview.map((comment) => (
                        <div key={comment.id} className="text-sm">
                          <span className="font-semibold">
                            {comment.user.username || comment.user.name || 'Unknown'}
                          </span>
                          <span className="text-muted-foreground ml-2">{comment.content}</span>
                        </div>
                      ))}
                      {post.comments.total > post.comments.preview.length && (
                        <button
                          onClick={() => router.push(`/feed/post/${post.id}`)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          View {post.comments.total - post.comments.preview.length} more comments
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="text-center text-muted-foreground py-8">
            No more trending posts
          </div>
        )}

        {!loading && posts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No trending posts in the last 24 hours.</p>
            </CardContent>
          </Card>
        )}

        <div ref={sentinelRef} className="h-4" />
      </div>
    </div>
  );
}

