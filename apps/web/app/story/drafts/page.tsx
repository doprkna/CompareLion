/**
 * Story Drafts Page
 * View and manage draft stories
 * v0.40.13 - Story Drafts 1.0
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, Globe, Lock, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { apiFetch } from '@/lib/apiBase';

interface DraftStory {
  id: string;
  type: string;
  title: string | null;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface DraftsResponse {
  success: boolean;
  drafts: DraftStory[];
  error?: string;
}

const TYPE_LABELS: Record<string, string> = {
  simple: 'Simple',
  extended: 'Extended',
  weekly: 'Weekly',
};

export default function StoryDraftsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<Set<string>>(new Set());
  const [selectedVisibility, setSelectedVisibility] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadDrafts();
    }
  }, [status, router]);

  async function loadDrafts() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/story/drafts');
      const data = (await res.json()) as DraftsResponse;

      if (data.success) {
        setDrafts(data.drafts);
        // Initialize visibility selections
        const initialVisibility: Record<string, string> = {};
        data.drafts.forEach((draft) => {
          initialVisibility[draft.id] = 'public';
        });
        setSelectedVisibility(initialVisibility);
      }
    } catch (error) {
      console.error('Failed to load drafts', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublishDraft(draftId: string) {
    const visibility = selectedVisibility[draftId] || 'public';
    setPublishing((prev) => new Set(prev).add(draftId));

    try {
      const res = await apiFetch('/api/story/drafts/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: draftId,
          visibility,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Remove from drafts list
        setDrafts((prev) => prev.filter((d) => d.id !== draftId));
        alert('Story published successfully!');
      } else {
        alert(data.error || 'Failed to publish draft');
      }
    } catch (error) {
      console.error('Failed to publish draft', error);
      alert('Failed to publish draft. Please try again.');
    } finally {
      setPublishing((prev) => {
        const next = new Set(prev);
        next.delete(draftId);
        return next;
      });
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-subtle" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text">Draft Stories</h1>
          <Button variant="outline" size="sm" onClick={() => loadDrafts()}>
            Refresh
          </Button>
        </div>

        {drafts.length === 0 && !loading && (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-subtle">No drafts yet. Create a story to save it as a draft!</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {drafts.map((draft) => (
            <Card key={draft.id} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {draft.coverImageUrl && (
                    <div className="flex-shrink-0">
                      <img
                        src={draft.coverImageUrl}
                        alt="Draft cover"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {TYPE_LABELS[draft.type] || draft.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                        Draft
                      </Badge>
                      <span className="text-xs text-subtle ml-auto">
                        {formatDistanceToNow(new Date(draft.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    {draft.title && (
                      <p className="text-sm font-medium text-text mb-2">{draft.title}</p>
                    )}

                    {draft.updatedAt && (
                      <p className="text-xs text-subtle mb-3">
                        Updated {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}
                      </p>
                    )}

                    {/* Publish Controls */}
                    <div className="flex items-center gap-2 mt-3">
                      <select
                        value={selectedVisibility[draft.id] || 'public'}
                        onChange={(e) =>
                          setSelectedVisibility((prev) => ({
                            ...prev,
                            [draft.id]: e.target.value,
                          }))
                        }
                        className="px-2 py-1 text-sm border rounded bg-bg text-text"
                        disabled={publishing.has(draft.id)}
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="friends" disabled>
                          Friends (Coming soon)
                        </option>
                      </select>
                      <Button
                        size="sm"
                        onClick={() => handlePublishDraft(draft.id)}
                        disabled={publishing.has(draft.id)}
                      >
                        {publishing.has(draft.id) ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          'Publish'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/story/view/${draft.id}`)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Open
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

