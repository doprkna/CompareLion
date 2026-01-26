/**
 * Story Viewer Page
 * View story in swipe/carousel mode
 * v0.40.11 - Story Viewer 2.0 (Swipe / Carousel Mode)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Download, Eye, Heart, Laugh, Sparkles, Trophy, Repeat, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StoryViewer } from '@/components/story/StoryViewer';
import { apiFetch } from '@/lib/apiBase';

interface StoryPanel {
  imageUrl: string;
  caption: string;
  vibeTag: string;
  microStory: string;
  role?: string | null;
}

interface StoryPanelsResponse {
  success: boolean;
  panels: StoryPanel[];
  title: string | null;
  type: string;
  createdAt: string;
  userId?: string; // v0.40.17 - Story owner ID
  fallback?: boolean; // If true, use PNG viewer fallback
  audio?: {
    audioType: string;
    audioTagId: string | null;
    audioUrl: string | null;
  } | null;
  error?: string;
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

export default function StoryViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [storyData, setStoryData] = useState<StoryPanelsResponse | null>(null);
  const [analytics, setAnalytics] = useState<StoryAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewTracked, setViewTracked] = useState(false);
  const [remixCount, setRemixCount] = useState<number | null>(null);
  const [remixMetadata, setRemixMetadata] = useState<{
    parentStoryId: string;
    parentAuthor: { id: string; name: string | null; username: string | null };
    remixType: string;
  } | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioTagId, setAudioTagId] = useState<string | null>(null);
  const [storyOwnerId, setStoryOwnerId] = useState<string | null>(null);
  const [unreadReactionCount, setUnreadReactionCount] = useState(0);
  const { data: session } = useSession();

  useEffect(() => {
    loadStoryPanels();
    loadAnalytics();
    trackView();
    loadRemixInfo();
  }, [params.id]);

  useEffect(() => {
    // Load unread reaction notifications if viewing own story (v0.40.17)
    if (session?.user && storyOwnerId) {
      const userId = (session.user as any).id;
      if (userId && userId === storyOwnerId) {
        loadUnreadReactionNotifications();
      }
    }
  }, [session, storyOwnerId, params.id]);

  async function loadUnreadReactionNotifications() {
    if (!session?.user) return;
    
    try {
      const res = await apiFetch('/api/notifications');
      const data = await res.json();
      if (data.success && data.notifications) {
        // Count unread notifications for this story (reactions/stickers)
        const unread = data.notifications.filter(
          (n: any) =>
            !n.isRead &&
            (n.type === 'story_reaction' || n.type === 'story_sticker') &&
            n.data.storyId === params.id
        );
        setUnreadReactionCount(unread.length);
      }
    } catch (error) {
      console.error('Failed to load unread reaction notifications', error);
    }
  }

  async function loadRemixInfo() {
    try {
      // Load remix metadata (if this is a remix)
      const remixRes = await apiFetch(`/api/story/remix/metadata?storyId=${params.id}`);
      const remixData = await remixRes.json();
      if (remixData.success && remixData.metadata) {
        setRemixMetadata(remixData.metadata);
      }

      // Load remix count (how many remixes of this story)
      const countRes = await apiFetch(`/api/story/remix/count?parentStoryId=${params.id}`);
      const countData = await countRes.json();
      if (countData.success) {
        setRemixCount(countData.count);
      }
    } catch (error) {
      console.error('Failed to load remix info', error);
    }
  }

  async function trackView() {
    if (viewTracked) return;
    try {
      await apiFetch('/api/story/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: params.id }),
      });
      setViewTracked(true);
      // Reload analytics to get updated view count
      loadAnalytics();
    } catch (error) {
      console.error('Failed to track view', error);
    }
  }

  async function loadAnalytics() {
    setLoadingAnalytics(true);
    try {
      const res = await apiFetch(`/api/story/analytics?storyId=${params.id}`);
      const data = await res.json();
      if (data.success) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load analytics', error);
    } finally {
      setLoadingAnalytics(false);
    }
  }

  async function loadStoryPanels() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/story/panels?storyId=${params.id}`);
      const data = (await res.json()) as StoryPanelsResponse;

      if (data.success) {
        setStoryData(data);
        // Set story owner ID (v0.40.17)
        if (data.userId) {
          setStoryOwnerId(data.userId);
        }
        // Set audio info
        if (data.audio) {
          if (data.audio.audioTagId) {
            setAudioTagId(data.audio.audioTagId);
            // Get audio tag file URL
            const { getAudioTagById } = await import('@/lib/story/audioTags');
            const tag = getAudioTagById(data.audio.audioTagId);
            if (tag) {
              setAudioUrl(tag.fileUrl);
            }
          } else if (data.audio.audioUrl) {
            setAudioUrl(data.audio.audioUrl);
          }
        }
      } else {
        setError(data.error || 'Failed to load story');
      }
    } catch (err) {
      console.error('Failed to load story panels', err);
      setError('Failed to load story. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadPNG() {
    // Fallback to PNG export viewer
    router.push(`/story/export?exportId=story-${params.id}`);
  }

  if (loading) {
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

  if (error || !storyData) {
    return (
      <div className="min-h-screen bg-bg p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-subtle mb-4">{error || 'Story not found'}</p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Fallback to PNG viewer if no panel metadata
  if (storyData.fallback || storyData.panels.length === 0) {
    return (
      <div className="min-h-screen bg-bg p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-subtle mb-4">
                This story doesn't have panel metadata yet. Use the PNG export viewer instead.
              </p>
              <Button onClick={handleDownloadPNG}>
                <Download className="w-4 h-4 mr-2" />
                View PNG Export
              </Button>
              <Button variant="outline" onClick={() => router.back()} className="ml-2">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            ← Back
          </Button>
          <div className="flex gap-2">
            {remixMetadata && (
              <Button
                variant="outline"
                onClick={() => router.push(`/story/view/${remixMetadata.parentStoryId}`)}
              >
                <Repeat className="w-4 h-4 mr-2" />
                View Original
              </Button>
            )}
            <Button variant="outline" onClick={handleDownloadPNG}>
              <Download className="w-4 h-4 mr-2" />
              PNG Export
            </Button>
          </div>
        </div>

        {/* Remix Badge */}
        {remixMetadata && (
          <Card className="mb-4 bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-purple-700" />
                <span className="text-sm text-purple-900">
                  Remix of{' '}
                  <button
                    onClick={() => router.push(`/story/view/${remixMetadata.parentStoryId}`)}
                    className="font-semibold underline hover:text-purple-700"
                  >
                    @{remixMetadata.parentAuthor.username || remixMetadata.parentAuthor.name || 'user'}
                  </button>
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Reactions Badge (v0.40.17) */}
        {unreadReactionCount > 0 && (
          <Card className="mb-4 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-blue-700" />
                <span className="text-sm text-blue-900">
                  You have {unreadReactionCount} new {unreadReactionCount === 1 ? 'reaction' : 'reactions'} on this story
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <StoryViewer
          panels={storyData.panels}
          title={storyData.title}
          autoplay={false}
          onClose={() => router.back()}
        />

        {/* Audio Player */}
        {audioUrl && (
          <Card className="mt-6 bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-subtle" />
                <span className="text-sm font-medium text-text">Audio</span>
              </div>
              <audio
                src={audioUrl}
                controls
                className="w-full"
                preload="metadata"
              />
            </CardContent>
          </Card>
        )}

        {/* Analytics Panel */}
        {analytics && (
          <Card className="mt-6 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Views */}
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-subtle" />
                <span className="text-sm text-text font-medium">Views:</span>
                <span className="text-sm text-subtle">{analytics.viewCount}</span>
              </div>

              {/* Reactions */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-subtle">{analytics.reactions.like}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Laugh className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-subtle">{analytics.reactions.lol}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-subtle">{analytics.reactions.vibe}</span>
                </div>
              </div>

              {/* Top Stickers */}
              {analytics.stickers.length > 0 && (
                <div>
                  <span className="text-sm text-text font-medium mb-2 block">Top Stickers:</span>
                  <div className="flex gap-2 flex-wrap">
                    {analytics.stickers.slice(0, 3).map((sticker) => (
                      <Badge key={sticker.id} variant="secondary" className="text-xs">
                        {sticker.emoji} {sticker.count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Reach Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text font-medium">Reach Score</span>
                  <span className="text-sm text-subtle">{analytics.reachScore}</span>
                </div>
                <div className="w-full bg-subtle/20 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (analytics.reachScore / 100) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Challenge Participation */}
              {analytics.inChallenges.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-text">
                    This story was part of {analytics.inChallenges.length}{' '}
                    {analytics.inChallenges.length === 1 ? 'challenge' : 'challenges'}
                  </span>
                </div>
              )}

              {/* Remix Count */}
              {remixCount !== null && remixCount > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Repeat className="w-4 h-4 text-purple-500" />
                  <button
                    onClick={() => router.push(`/story/remix/list?parent=${params.id}`)}
                    className="text-sm text-text hover:text-purple-600 underline"
                  >
                    Remixes ({remixCount})
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

