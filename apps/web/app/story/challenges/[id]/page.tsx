/**
 * Story Challenge Detail Page
 * View challenge entries and submit stories
 * v0.40.8 - Story Challenges 1.0 (Community Story Prompts)
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Calendar,
  Heart,
  Laugh,
  Sparkles,
  Plus,
  X,
  Check,
  Globe,
  Lock,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { apiFetch } from '@/lib/apiBase';
import { getAllStickers } from '@parel/story/stickers';

interface StoryChallenge {
  id: string;
  title: string;
  description: string;
  promptType: 'image' | 'story' | 'extended';
  startAt: string;
  endAt: string;
  isActive: boolean;
}

interface ChallengeEntry {
  storyId: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
  };
  coverImageUrl: string | null;
  createdAt: string;
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
}

interface MyStory {
  id: string;
  type: string;
  coverImageUrl: string | null;
  visibility: string;
  createdAt: string;
}

export default function ChallengeDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [challenge, setChallenge] = useState<StoryChallenge | null>(null);
  const [entries, setEntries] = useState<ChallengeEntry[]>([]);
  const [myStories, setMyStories] = useState<MyStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadChallengeData();
      if (searchParams.get('submit') === 'true') {
        setShowSubmitModal(true);
        loadMyStories();
      }
    }
  }, [status, router, params.id, searchParams]);

  async function loadChallengeData() {
    setLoading(true);
    try {
      // Load challenge info from challenges list
      const challengesRes = await apiFetch('/api/story/challenges');
      const challengesData = await challengesRes.json();
      const allChallenges = [
        ...challengesData.challenges.active,
        ...challengesData.challenges.upcoming,
      ];
      const foundChallenge = allChallenges.find((c: StoryChallenge) => c.id === params.id);
      if (foundChallenge) {
        setChallenge(foundChallenge);
      }

      // Load entries
      const entriesRes = await apiFetch(`/api/story/challenges/entries?challengeId=${params.id}`);
      const entriesData = await entriesRes.json();
      if (entriesData.success) {
        setEntries(entriesData.entries);
      }
    } catch (error) {
      console.error('Failed to load challenge data', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMyStories() {
    try {
      const res = await apiFetch('/api/story/mine');
      const data = await res.json();
      if (data.success) {
        // Filter to only public stories
        const publicStories = data.stories.filter((s: MyStory) => s.visibility === 'public');
        setMyStories(publicStories);
      }
    } catch (error) {
      console.error('Failed to load my stories', error);
    }
  }

  async function handleSubmit() {
    if (!selectedStoryId) return;

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/story/challenges/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: selectedStoryId,
          challengeId: params.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setShowSubmitModal(false);
        // Reload entries
        loadChallengeData();
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        alert(data.error || 'Failed to submit story');
      }
    } catch (error) {
      console.error('Failed to submit story', error);
      alert('Failed to submit story. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleStoryClick(storyId: string) {
    router.push(`/story/view/${storyId}`);
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

  if (!challenge) {
    return (
      <div className="min-h-screen bg-bg p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-subtle">Challenge not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Toast */}
        {submitted && (
          <Card className="mb-4 bg-green-50 border-green-200">
            <CardContent className="p-4 flex items-center gap-2 text-green-900">
              <Check className="w-5 h-5" />
              <span className="font-medium">Submitted to challenge!</span>
            </CardContent>
          </Card>
        )}

        {/* Challenge Header */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{challenge.title}</span>
              <Badge variant="secondary" className="text-xs">
                {challenge.promptType}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text mb-4">{challenge.description}</p>
            <div className="flex items-center gap-4 text-sm text-subtle mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(new Date(challenge.startAt), 'MMM d')} -{' '}
                  {format(new Date(challenge.endAt), 'MMM d, yyyy')}
                </span>
              </div>
              <span>
                Ends {formatDistanceToNow(new Date(challenge.endAt), { addSuffix: true })}
              </span>
            </div>
            {session && challenge.isActive && (
              <Button onClick={() => {
                setShowSubmitModal(true);
                loadMyStories();
              }}>
                Submit My Story
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Entries */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text mb-4">
            Entries ({entries.length})
          </h2>
          {entries.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <p className="text-subtle">No entries yet. Be the first to submit!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <Card
                  key={entry.storyId}
                  className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleStoryClick(entry.storyId)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {entry.coverImageUrl && (
                        <div className="flex-shrink-0">
                          <img
                            src={entry.coverImageUrl}
                            alt="Story cover"
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-text">
                            {entry.user.username || entry.user.name || 'Unknown'}
                          </span>
                          <span className="text-xs text-subtle ml-auto">
                            {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mt-3">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Heart className="w-4 h-4 mr-1" />
                            <span className="text-xs">{entry.reactions.like}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Laugh className="w-4 h-4 mr-1" />
                            <span className="text-xs">{entry.reactions.lol}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Sparkles className="w-4 h-4 mr-1" />
                            <span className="text-xs">{entry.reactions.vibe}</span>
                          </Button>
                        </div>

                        {/* Sticker Summary */}
                        {entry.stickers.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-border">
                            <div className="flex items-center gap-2 flex-wrap">
                              {entry.stickers.slice(0, 3).map((sticker) => (
                                <Badge key={sticker.id} variant="outline" className="text-xs">
                                  <span className="mr-1">{sticker.emoji}</span>
                                  <span>{sticker.count}</span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Submit Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-card border-border max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Submit Story</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowSubmitModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myStories.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-subtle mb-4">
                      You don't have any public stories yet. Publish a story first!
                    </p>
                    <Button onClick={() => router.push('/story/create')}>
                      Create Story
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {myStories.map((story) => (
                      <Card
                        key={story.id}
                        className={`cursor-pointer transition-colors ${
                          selectedStoryId === story.id
                            ? 'border-primary bg-primary/10'
                            : 'bg-card border-border'
                        }`}
                        onClick={() => setSelectedStoryId(story.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            {story.coverImageUrl && (
                              <img
                                src={story.coverImageUrl}
                                alt="Story cover"
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {story.type}
                                </Badge>
                                {story.visibility === 'public' && (
                                  <Globe className="w-3 h-3 text-green-600" />
                                )}
                              </div>
                              <p className="text-xs text-subtle mt-1">
                                {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            {selectedStoryId === story.id && (
                              <Check className="w-5 h-5 text-primary" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {myStories.length > 0 && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowSubmitModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleSubmit}
                      disabled={!selectedStoryId || submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

