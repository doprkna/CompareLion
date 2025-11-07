'use client';

/**
 * Comments Section
 * v0.20.0 - Display and manage comments on reflections/comparisons
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showToast } from '@/lib/toast';
import { CommentForm } from './CommentForm';
import { logger } from '@/lib/logger';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  flagged: boolean;
  user: {
    id: string;
    username: string | null;
    name: string | null;
    avatarUrl: string | null;
  };
  isOwnComment: boolean;
}

interface CommentsSectionProps {
  targetType: 'reflection' | 'comparison' | 'user_reflection';
  targetId: string;
}

export function CommentsSection({ targetType, targetId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [targetId, targetType]);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/comments/${targetId}?targetType=${targetType}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      } else {
        setError('Failed to load comments');
      }
    } catch (err) {
      logger.error('Failed to fetch comments', err);
      setError('Error loading comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (content: string) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetType,
          targetId,
          content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add new comment to list
        const newComment: Comment = {
          id: data.comment.id,
          content: data.comment.content,
          createdAt: data.comment.createdAt,
          flagged: data.comment.flagged,
          user: data.comment.user,
          isOwnComment: true,
        };
        
        setComments((prev) => [newComment, ...prev]);
        setShowForm(false);
        
        if (data.comment.moderationWarning) {
          showToast(`⚠️ Comment posted but flagged: ${data.comment.moderationWarning.join(', ')}`, 'warning');
        } else {
          showToast('Comment posted! 💬', 'success');
        }
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to post comment', 'error');
      }
    } catch (err) {
      logger.error('Failed to post comment', err);
      showToast('Error posting comment', 'error');
    }
  };

  const handleFlag = async (commentId: string) => {
    if (!confirm('Flag this comment as inappropriate?')) return;

    try {
      const response = await fetch('/api/moderation/flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetType: 'comment',
          targetId: commentId,
          reason: 'User reported as inappropriate',
        }),
      });

      if (response.ok) {
        showToast('Comment flagged for review', 'success');
        fetchComments(); // Refresh to show flag status
      } else {
        showToast('Failed to flag comment', 'error');
      }
    } catch (err) {
      logger.error('Failed to flag comment', err);
      showToast('Error flagging comment', 'error');
    }
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">
          Comments {comments.length > 0 && `(${comments.length})`}
        </CardTitle>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          variant={showForm ? 'outline' : 'default'}
        >
          {showForm ? 'Cancel' : '+ Comment'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment Form */}
        {showForm && (
          <CommentForm onSubmit={handleAddComment} onCancel={() => setShowForm(false)} />
        )}

        {/* Error State */}
        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-muted-foreground">No comments yet</p>
            <p className="text-sm text-muted-foreground mt-1">Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`flex gap-3 p-3 rounded-lg hover:bg-muted/50 ${
                  comment.flagged ? 'border-l-4 border-yellow-500' : ''
                }`}
              >
                {/* Avatar */}
                {comment.user.avatarUrl ? (
                  <img
                    src={comment.user.avatarUrl}
                    alt={comment.user.username || comment.user.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {(comment.user.username || comment.user.name || 'U')[0].toUpperCase()}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {comment.user.username || comment.user.name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getTimeAgo(comment.createdAt)}
                    </span>
                    {comment.flagged && (
                      <span className="text-xs" title="Flagged content">⚠️</span>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>
                  
                  {/* Actions */}
                  {!comment.isOwnComment && !comment.flagged && (
                    <Button
                      onClick={() => handleFlag(comment.id)}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs mt-2"
                    >
                      🚩 Flag
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

