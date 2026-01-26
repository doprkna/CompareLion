/**
 * My Stories Page
 * View and manage user's own stories
 * v0.40.7 - Story Publishing & Visibility Controls 1.0
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, Lock, Users, Eye, Heart, Laugh, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { apiFetch } from '@/lib/apiBase';

interface MyStory {
  id: string;
  type: string;
  coverImageUrl: string | null;
  visibility: string;
  publishedAt: string | null;
  createdAt: string;
}

interface StoryAnalytics {
  viewCount: number;
  reactions: {
    like: number;
    lol: number;
    vibe: number;
  };
  stickers: Array<{
    id: string;
    emoji: string;
    count: number;
  }>;
  reachScore: number;
  inChallenges: string[];
}

interface MyStoriesResponse {
  success: boolean;
  stories: MyStory[];
  error?: string;
}

const TYPE_LABELS: Record<string, string> = {
  simple: 'Simple',
  extended: 'Extended',
  weekly: 'Weekly',
};

const VISIBILITY_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  public: { label: 'Public', icon: Globe, color: 'bg-green-100 text-green-700' },
  private: { label: 'Private', icon: Lock, color: 'bg-gray-100 text-gray-700' },
  friends: { label: 'Friends', icon: Users, color: 'bg-blue-100 text-blue-700' },
};

export default function MyStoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');
  const [stories, setStories] = useState<MyStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Set<string>>(new Set());
  const [selectedVisibility, setSelectedVisibility] = useState<Record<string, string>>({});
  const [analytics, setAnalytics] = useState<Record<string, StoryAnalytics>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadStories();
    }
  }, [status, router]);

  async function loadStories() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/story/mine');
      const data = (await res.json()) as MyStoriesResponse;

      if (data.success) {
        setStories(data.stories);
        // Initialize selected visibility
        const initialVisibility: Record<string, string> = {};
        data.stories.forEach((story) => {
          initialVisibility[story.id] = story.visibility;
        });
        setSelectedVisibility(initialVisibility);
        // Load analytics for all stories
        loadAnalyticsForStories(data.stories);
      }
    } catch (error) {
      console.error('Failed to load stories', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalyticsForStories(stories: MyStory[]) {
    const analyticsMap: Record<string, StoryAnalytics> = {};
    await Promise.all(
      stories.map(async (story) => {
        try {
          const res = await apiFetch(`/api/story/analytics?storyId=${story.id}`);
          const data = await res.json();
          if (data.success) {
            analyticsMap[story.id] = data;
          }
        } catch (error) {
          console.error(`Failed to load analytics for story ${story.id}`, error);
        }
      })
    );
    setAnalytics(analyticsMap);
  }

  async function handleUpdateVisibility(storyId: string) {
    const visibility = selectedVisibility[storyId];
    if (!visibility) return;

    setUpdating((prev) => new Set(prev).add(storyId));

    try {
      const res = await apiFetch('/api/story/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          visibility,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local state
        setStories((prev) =>
          prev.map((story) =>
            story.id === storyId
              ? {
                  ...story,
                  visibility: data.story.visibility,
                  publishedAt: data.story.publishedAt || story.publishedAt,
                }
              : story
          )
        );
      } else {
        alert(data.error || 'Failed to update visibility');
        // Revert selection
        const story = stories.find((s) => s.id === storyId);
        if (story) {
          setSelectedVisibility((prev) => ({
            ...prev,
            [storyId]: story.visibility,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to update visibility', error);
      alert('Failed to update visibility. Please try again.');
      // Revert selection
      const story = stories.find((s) => s.id === storyId);
      if (story) {
        setSelectedVisibility((prev) => ({
          ...prev,
          [storyId]: story.visibility,
        }));
      }
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(storyId);
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
          <h1 className="text-2xl font-bold text-text">My Stories</h1>
          <Button variant="outline" size="sm" onClick={() => loadStories()}>
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('published')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'published'
                ? 'text-text border-b-2 border-primary'
                : 'text-subtle hover:text-text'
            }`}
          >
            Published
          </button>
          <button
            onClick={() => {
              setActiveTab('drafts');
              router.push('/story/drafts');
            }}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'drafts'
                ? 'text-text border-b-2 border-primary'
                : 'text-subtle hover:text-text'
            }`}
          >
            Drafts
          </button>
        </div>

        {stories.length === 0 && !loading && (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-subtle">No stories yet. Create your first story!</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {stories.map((story) => {
            const VisibilityIcon = VISIBILITY_LABELS[story.visibility]?.icon || Lock;
            const visibilityInfo = VISIBILITY_LABELS[story.visibility] || VISIBILITY_LABELS.private;

            return (
              <Card key={story.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {story.coverImageUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={story.coverImageUrl}
                          alt="Story cover"
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {TYPE_LABELS[story.type] || story.type}
                        </Badge>
                        <Badge className={`text-xs ${visibilityInfo.color}`}>
                          <VisibilityIcon className="w-3 h-3 mr-1" />
                          {visibilityInfo.label}
                        </Badge>
                        <span className="text-xs text-subtle ml-auto">
                          {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      {story.publishedAt && (
                        <p className="text-xs text-subtle mb-3">
                          Published {formatDistanceToNow(new Date(story.publishedAt), { addSuffix: true })}
                        </p>
                      )}

                      {/* Analytics Summary */}
                      {analytics[story.id] && (
                        <div className="flex items-center gap-4 mb-3 text-xs text-subtle">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{analytics[story.id].viewCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-500" />
                            <span>{analytics[story.id].reactions.like}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Laugh className="w-3 h-3 text-yellow-500" />
                            <span>{analytics[story.id].reactions.lol}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-500" />
                            <span>{analytics[story.id].reactions.vibe}</span>
                          </div>
                          <div className="ml-auto">
                            <span className="text-xs font-medium">Reach: {analytics[story.id].reachScore}</span>
                          </div>
                        </div>
                      )}

                      {/* Visibility Controls */}
                      <div className="flex items-center gap-2 mt-3">
                        <select
                          value={selectedVisibility[story.id] || story.visibility}
                          onChange={(e) =>
                            setSelectedVisibility((prev) => ({
                              ...prev,
                              [story.id]: e.target.value,
                            }))
                          }
                          className="px-2 py-1 text-sm border rounded bg-bg text-text"
                          disabled={updating.has(story.id)}
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                          <option value="friends" disabled>
                            Friends (Coming soon)
                          </option>
                        </select>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateVisibility(story.id)}
                          disabled={
                            updating.has(story.id) ||
                            (selectedVisibility[story.id] || story.visibility) === story.visibility
                          }
                        >
                          {updating.has(story.id) ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

