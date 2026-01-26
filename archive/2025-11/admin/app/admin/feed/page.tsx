/**
 * Admin Feed Management Page
 * v0.36.25 - Community Feed 1.0
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Trash2, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type FeedPost = {
  id: string;
  userId: string;
  type: string;
  content: string | null;
  createdAt: Date;
  user: {
    id: string;
    username: string | null;
    name: string | null;
    email: string | null;
  };
  _count: {
    comments: number;
    reactions: number;
  };
};

export default function AdminFeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [filterUserId, setFilterUserId] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    loadPosts();
  }, [status, filterType, filterUserId]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType) params.set('type', filterType);
      if (filterUserId) params.set('userId', filterUserId);

      const res = await fetch(`/api/admin/feed?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to load posts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/admin/feed/${postId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        loadPosts();
      }
    } catch (error) {
      console.error('Failed to delete post', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const res = await fetch(`/api/admin/feed/comments/${commentId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        loadPosts();
      }
    } catch (error) {
      console.error('Failed to delete comment', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Feed Management</h1>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-background"
              >
                <option value="">All Types</option>
                <option value="achievement">Achievement</option>
                <option value="fight">Fight</option>
                <option value="question">Question</option>
                <option value="levelup">Level Up</option>
                <option value="loot">Loot</option>
                <option value="status">Status</option>
                <option value="milestone">Milestone</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Filter by User ID</label>
              <input
                type="text"
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
                placeholder="User ID"
                className="w-full px-3 py-2 border rounded bg-background"
              />
            </div>
            <Button onClick={loadPosts}>
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">
                      {post.user.username || post.user.name || 'Unknown'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({post.user.email})
                    </span>
                    <span className="text-xs px-2 py-1 bg-muted rounded">
                      {post.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{post.content}</p>
                  <div className="text-xs text-muted-foreground">
                    {post._count.comments} comments • {post._count.reactions} reactions
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePost(post.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {posts.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No posts found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

