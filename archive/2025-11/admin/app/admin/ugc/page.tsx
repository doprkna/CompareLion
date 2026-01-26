'use client';

/**
 * Admin UGC Moderation Dashboard
 * v0.17.0 - Review and moderate user submissions
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Submission {
  id: string;
  title: string;
  content: string;
  description: string | null;
  type: string;
  status: string;
  score: number;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  reviewedAt: string | null;
  moderatorNote: string | null;
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
  category: {
    id: string;
    name: string;
  } | null;
  moderator: {
    id: string;
    name: string | null;
  } | null;
  tags: string[];
  _count: {
    votes: number;
  };
}

export default function AdminUGCPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('PENDING');
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const [moderationNote, setModerationNote] = useState('');

  useEffect(() => {
    checkAccess();
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadSubmissions();
    }
  }, [filter, status]);

  const checkAccess = async () => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    // Check if user is admin/mod
    if (session?.user) {
      // This check should ideally be done on the server
      // For now, we'll let the API handle authorization
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    setLoading(true);
    setError('');

    try {
      const url = `/api/ugc/question?status=${filter}&limit=100`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          router.push('/');
          return;
        }
        throw new Error(data.error || 'Failed to load submissions');
      }

      setSubmissions(data.submissions || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (submissionId: string, action: 'APPROVE' | 'REJECT' | 'FLAG') => {
    try {
      const response = await fetch('/api/ugc/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          action,
          note: moderationNote || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to moderate submission');
      }

      // Remove from list or update status
      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
      setModeratingId(null);
      setModerationNote('');

      // Show success feedback
      alert(data.message);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">UGC Moderation</h1>
        <p className="text-muted-foreground">
          Review and moderate user-generated content submissions
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'PENDING'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          ⏳ Pending ({submissions.filter(s => s.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setFilter('APPROVED')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'APPROVED'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          ✅ Approved
        </button>
        <button
          onClick={() => setFilter('REJECTED')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'REJECTED'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          ❌ Rejected
        </button>
        <button
          onClick={() => setFilter('FLAGGED')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'FLAGGED'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🚩 Flagged
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm mb-6">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && submissions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No {filter.toLowerCase()} submissions found.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Submissions List */}
      {submissions.length > 0 && (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                        {submission.type}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        submission.status === 'APPROVED' 
                          ? 'bg-green-500/10 text-green-600'
                          : submission.status === 'PENDING'
                          ? 'bg-yellow-500/10 text-yellow-600'
                          : submission.status === 'FLAGGED'
                          ? 'bg-orange-500/10 text-orange-600'
                          : 'bg-red-500/10 text-red-600'
                      }`}>
                        {submission.status}
                      </span>
                      {submission.category && (
                        <span className="px-2 py-1 text-xs rounded-full bg-secondary">
                          {submission.category.name}
                        </span>
                      )}
                    </div>
                    <CardTitle>{submission.title}</CardTitle>
                    <CardDescription>
                      Submitted by {submission.user.name || 'Anonymous'} on {formatDate(submission.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold">Score: {submission.score}</div>
                    <div className="text-muted-foreground">
                      ↑ {submission.upvotes} ↓ {submission.downvotes}
                    </div>
                    <div className="text-muted-foreground">
                      {submission._count.votes} votes
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Content */}
                <div>
                  <p className="font-medium mb-1">Content:</p>
                  <p className="text-sm bg-muted p-3 rounded">{submission.content}</p>
                </div>

                {/* Description */}
                {submission.description && (
                  <div>
                    <p className="font-medium mb-1">Description:</p>
                    <p className="text-sm text-muted-foreground">{submission.description}</p>
                  </div>
                )}

                {/* Tags */}
                {submission.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {submission.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs rounded bg-muted">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Previous Moderation */}
                {submission.moderator && (
                  <div className="p-3 rounded bg-muted/50 text-sm">
                    <p className="font-medium">
                      Reviewed by {submission.moderator.name} on {submission.reviewedAt && formatDate(submission.reviewedAt)}
                    </p>
                    {submission.moderatorNote && (
                      <p className="mt-1 text-muted-foreground">
                        Note: {submission.moderatorNote}
                      </p>
                    )}
                  </div>
                )}

                {/* Moderation Actions */}
                {submission.status === 'PENDING' && (
                  <div className="border-t pt-4">
                    {moderatingId === submission.id ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`note-${submission.id}`}>Moderation Note (Optional)</Label>
                          <textarea
                            id={`note-${submission.id}`}
                            value={moderationNote}
                            onChange={(e) => setModerationNote(e.target.value)}
                            placeholder="Add a note explaining your decision..."
                            rows={3}
                            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleModerate(submission.id, 'APPROVE')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            ✅ Approve
                          </Button>
                          <Button
                            onClick={() => handleModerate(submission.id, 'REJECT')}
                            variant="destructive"
                          >
                            ❌ Reject
                          </Button>
                          <Button
                            onClick={() => handleModerate(submission.id, 'FLAG')}
                            variant="outline"
                          >
                            🚩 Flag for Review
                          </Button>
                          <Button
                            onClick={() => {
                              setModeratingId(null);
                              setModerationNote('');
                            }}
                            variant="ghost"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setModeratingId(submission.id)}
                        variant="outline"
                      >
                        Review
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

