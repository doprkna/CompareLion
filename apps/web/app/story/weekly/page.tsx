/**
 * Parel Story Generator - Weekly Story Page
 * Auto-generated weekly recap story
 * v0.40.3 - Auto-Story from Weekly Activity (My Week Story)
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, RefreshCw, Globe, Lock, Users, Check } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';

interface WeeklyStoryPanel {
  role: 'intro' | 'build' | 'peak' | 'outro';
  imageUrl: string;
  caption: string;
  vibeTag: string;
  microStory: string;
}

interface WeeklyStory {
  title: string;
  panels: WeeklyStoryPanel[];
  outro: string;
}

export default function WeeklyStoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [story, setStory] = useState<WeeklyStory | null>(null);
  const [exportId, setExportId] = useState<string | null>(null);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishVisibility, setPublishVisibility] = useState<'public' | 'private' | 'friends'>('private');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  async function handleGenerate() {
    setGenerating(true);
    setStory(null);
    setExportId(null);
    setError(null);

    try {
      const res = await apiFetch('/api/story/weekly');

      if ((res as any).ok && (res as any).data) {
        if ((res as any).data.success) {
          setStory((res as any).data.story);
          setExportId((res as any).data.exportId);
          setStoryId((res as any).data.storyId || null);
          setPublished(false);
        } else {
          setError((res as any).data.error || 'Failed to generate story');
        }
      } else {
        throw new Error((res as any).error || 'Failed to generate weekly story');
      }
    } catch (err) {
      console.error('Failed to generate weekly story', err);
      setError(err instanceof Error ? err.message : 'Failed to generate weekly story');
    } finally {
      setGenerating(false);
    }
  }

  function handleDownloadStory() {
    if (!story || !exportId) return;

    const panelsData = story.panels.map((panel) => ({
      imageUrl: panel.imageUrl,
      caption: panel.caption,
      vibeTag: panel.vibeTag,
      microStory: panel.microStory,
      role: panel.role,
    }));

    const exportUrl = `/api/story/export?panels=${encodeURIComponent(JSON.stringify(panelsData))}&layoutMode=vertical&title=${encodeURIComponent(story.title)}&logline=${encodeURIComponent(story.outro)}`;
    window.open(exportUrl, '_blank');
  }

  async function handlePublishStory() {
    if (!storyId) return;

    setPublishing(true);
    try {
      const res = await apiFetch('/api/story/drafts/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          visibility: publishVisibility,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPublished(true);
      } else {
        alert(data.error || 'Failed to publish story');
      }
    } catch (error) {
      console.error('Failed to publish story', error);
      alert('Failed to publish story. Please try again.');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Week Story</h1>
        <p className="text-gray-600">Auto-generated weekly recap from your past 7 days</p>
      </div>

      {/* Generate Button */}
      <div className="mb-6">
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full"
          size="lg"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Your Week Story...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5 mr-2" />
              Generate My Week Story
            </>
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Story Output */}
      {story && story.panels.length > 0 && (
        <div className="space-y-6">
          {/* Title */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-2 text-purple-900">{story.title}</h2>
            </CardContent>
          </Card>

          {/* Panels */}
          <div className="space-y-6">
            {story.panels.map((panel, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Role Badge */}
                    <div>
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium uppercase">
                        {panel.role}
                      </span>
                    </div>

                    {/* Image */}
                    <div>
                      <img
                        src={panel.imageUrl}
                        alt={`Panel ${index + 1}`}
                        className="w-full rounded-lg border"
                      />
                    </div>

                    {/* Caption */}
                    <div>
                      <h3 className="font-semibold text-lg">{panel.caption}</h3>
                    </div>

                    {/* Vibe Tag */}
                    <div>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {panel.vibeTag}
                      </span>
                    </div>

                    {/* Micro Story */}
                    <div>
                      <p className="text-sm text-gray-600">{panel.microStory}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Outro */}
          {story.outro && (
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <p className="text-lg font-medium text-purple-900">{story.outro}</p>
              </CardContent>
            </Card>
          )}

          {/* Download Button */}
          {exportId && (
            <div>
              <Button onClick={handleDownloadStory} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Story Image
              </Button>
            </div>
          )}

          {/* Draft Banner */}
          {storyId && !published && (
            <Card className="bg-yellow-50 border-yellow-200 mb-4">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-yellow-900 mb-4">
                  <span className="font-medium">✓ Saved as draft</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handlePublishStory}
                    disabled={publishing}
                    className="flex-1"
                  >
                    {publishing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      'Publish Now'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/story/drafts')}
                    className="flex-1"
                  >
                    Maybe Later
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Publish Panel */}
          {storyId && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                {published ? (
                  <div className="flex items-center gap-2 text-blue-900">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Published to Story Feed.</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-blue-900">
                        Visibility:
                      </label>
                      <div className="flex gap-2">
                        <Button
                          variant={publishVisibility === 'public' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPublishVisibility('public')}
                        >
                          <Globe className="w-4 h-4 mr-1" />
                          Public
                        </Button>
                        <Button
                          variant={publishVisibility === 'private' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPublishVisibility('private')}
                        >
                          <Lock className="w-4 h-4 mr-1" />
                          Private
                        </Button>
                        <Button
                          variant={publishVisibility === 'friends' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPublishVisibility('friends')}
                          disabled
                          title="Coming soon"
                        >
                          <Users className="w-4 h-4 mr-1" />
                          Friends
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={handlePublishStory}
                      disabled={publishing}
                      className="w-full"
                    >
                      {publishing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        'Publish Story'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!story && !generating && !error && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500 text-center">
              Click "Generate My Week Story" to create your weekly recap from the past 7 days of activity.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

